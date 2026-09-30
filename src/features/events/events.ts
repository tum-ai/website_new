/**
 * Server-side shaping for /events: the upcoming/past split, the semester
 * groups of the register, the co-host index of the hero and every date
 * label. All of it runs on the server, and every date is read in Munich time,
 * so the output is the same whatever timezone the server runs in (UTC on
 * Vercel) and the browser never formats a date.
 */
import { tz } from "@date-fns/tz";
import { endOfDay, format } from "date-fns";
import { stegaClean } from "next-sanity";
import { getPartnerKey } from "@/features/partners";
import type { Event, EventCategory } from "@/lib/types";
import { formatList } from "@/lib/words";

/** The timezone every /events date is shown and grouped in. */
const EVENTS_TIME_ZONE = "Europe/Berlin";

const inMunich = tz(EVENTS_TIME_ZONE);

/** Formats an ISO instant in Munich time (date-fns pattern). */
function formatInMunich(iso: string, pattern: string): string {
  return format(new Date(iso), pattern, { in: inMunich });
}

/** The field the split and the grouping read. */
type Dated = Pick<Event, "event_date">;

const time = (event: Dated) => new Date(event.event_date).getTime();

/**
 * The last instant an event counts as upcoming: its start, or, for an event
 * without a start time ({@link hasStartTime}), the end of its Munich day, so
 * it doesn't turn past at 01:00 or 02:00 on the day itself.
 */
function upcomingUntil(event: Dated): number {
  return hasStartTime(event.event_date)
    ? time(event)
    : endOfDay(new Date(event.event_date), { in: inMunich }).getTime();
}

/**
 * Splits events at `now`: upcoming (starting at or after `now`, or on
 * today's Munich date when they have no start time; soonest first) and past
 * (newest first). The inputs are left untouched.
 *
 * `now` is the server's render time (see the /events route for how stale it
 * can get).
 */
export function splitEvents<T extends Dated>(
  events: readonly T[],
  now: Date,
): { upcoming: T[]; past: T[] } {
  const cutoff = now.getTime();
  return {
    upcoming: events
      .filter((event) => upcomingUntil(event) >= cutoff)
      .sort((a, b) => time(a) - time(b)),
    past: events
      .filter((event) => upcomingUntil(event) < cutoff)
      .sort((a, b) => time(b) - time(a)),
  };
}

/**
 * `upcoming` with the event a running campaign features (`featuredId`,
 * `getFeaturedEventId()` in `config/schedule-content.ts`) moved to the
 * front; the rest keep their order (soonest first). Without a featured
 * event, or when it is not among `upcoming` (it has started, or the
 * campaign names an event that was deleted), `upcoming` as it is. The input
 * is left untouched.
 */
export function pinFeaturedEvent<T extends { id: string }>(
  upcoming: readonly T[],
  featuredId: string | null,
): T[] {
  const featured = upcoming.find((event) => event.id === featuredId);
  return featured
    ? [featured, ...upcoming.filter((event) => event !== featured)]
    : [...upcoming];
}

/** A TUM semester, as {@link semesterOf} returns it. */
export type Semester = {
  /** "2026-summer", "2025-winter": unique and a React key. */
  key: string;
  /** "Summer semester 2026", "Winter semester 2025/26". */
  label: string;
};

/**
 * The TUM semester an instant falls in, by its Munich calendar date: the
 * summer semester runs from 1 April to 30 September, the winter semester
 * from 1 October to 31 March and is named after both of its years.
 */
export function semesterOf(iso: string): Semester {
  const year = Number(formatInMunich(iso, "yyyy"));
  const month = Number(formatInMunich(iso, "M"));
  if (month >= 4 && month <= 9) {
    return { key: `${year}-summer`, label: `Summer semester ${year}` };
  }
  const start = month >= 10 ? year : year - 1;
  const end = String((start + 1) % 100).padStart(2, "0");
  return {
    key: `${start}-winter`,
    label: `Winter semester ${start}/${end}`,
  };
}

/** One semester of events, as {@link groupEventsBySemester} returns it. */
export type SemesterGroup<T> = Semester & {
  /** The semester's events, in input order. */
  events: T[];
};

/**
 * Groups events by TUM semester (in Munich time), keeping the input order of
 * both the semesters (by first appearance) and the events within each.
 */
export function groupEventsBySemester<T extends Dated>(
  events: readonly T[],
): SemesterGroup<T>[] {
  const groups = new Map<string, SemesterGroup<T>>();
  for (const event of events) {
    const semester = semesterOf(event.event_date);
    let group = groups.get(semester.key);
    if (!group) {
      group = { ...semester, events: [] };
      groups.set(semester.key, group);
    }
    group.events.push(event);
  }
  return [...groups.values()];
}

/** An event's co-host as /events shows it. */
export type EventHost = {
  /**
   * The organisation's name, or the name as typed in `hosts`; in draft mode
   * with the stega metadata that makes it clickable in Presentation.
   */
  name: string;
  /** The organisation's key; only for a referenced organisation. */
  key?: string;
};

/** The fields {@link eventHosts} reads. */
type Hosted = Pick<Event, "hosts" | "coHosts">;

/** A name without stega metadata (which also contains characters `\s` matches). */
const plain = (value: string | null | undefined) =>
  stegaClean(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

/**
 * An event's co-hosts: the organisations `coHosts` references (those that
 * resolve), or, for an event without any, the names in `hosts`, the old
 * site's field. Blank names are left out.
 */
export function eventHosts(event: Hosted): EventHost[] {
  const referenced = (event.coHosts ?? []).flatMap((organization) => {
    const key = plain(organization?.key);
    const name = organization?.name ?? "";
    return key && plain(name) ? [{ key, name }] : [];
  });
  if (referenced.length > 0) return referenced;
  return event.hosts.flatMap((name) => (plain(name) ? [{ name }] : []));
}

/**
 * One co-host in the hero's index, as {@link indexHosts} returns it: the
 * name without stega metadata.
 */
export type HostEntry<T> = EventHost & {
  /** The events the co-host was part of, newest first. */
  events: T[];
};

/**
 * Every co-host across the events, most frequent first and, among equals,
 * the most recent first (then by name, so the order is stable). A co-host
 * is one organisation, matched by `getPartnerKey` of its name, so a typed
 * name ("Amazon Web Services") and a referenced organisation ("AWS") are
 * one entry; the name and key are the latest event's.
 */
export function indexHosts<T extends Pick<Event, "event_date"> & Hosted>(
  events: readonly T[],
): HostEntry<T>[] {
  const hosts = new Map<string, HostEntry<T>>();
  const newestFirst = [...events].sort((a, b) => time(b) - time(a));
  for (const event of newestFirst) {
    const seen = new Set<string>();
    for (const host of eventHosts(event)) {
      const name = plain(host.name);
      const id = getPartnerKey(name);
      if (seen.has(id)) continue;
      seen.add(id);
      const entry = hosts.get(id);
      if (entry) entry.events.push(event);
      else hosts.set(id, { ...host, name, events: [event] });
    }
  }
  const latest = (entry: HostEntry<T>) => time(entry.events[0]);
  return [...hosts.values()].sort(
    (a, b) =>
      b.events.length - a.events.length ||
      latest(b) - latest(a) ||
      a.name.localeCompare(b.name, "en"),
  );
}

/** The figures the hero's lead states, as {@link summarizeEvents} returns them. */
export type EventSummary = {
  /** Every event, upcoming included. */
  total: number;
  /** "March 2025": the month of the earliest event. */
  since?: string;
  /** Events in the Hackathon category. */
  hackathons: number;
  /** Events with at least one co-host. */
  withHosts: number;
};

/** Counts for the hero's lead, over every event on the page. */
export function summarizeEvents(
  events: readonly (Pick<Event, "event_date" | "category"> & Hosted)[],
): EventSummary {
  const first = events.reduce<(typeof events)[number] | undefined>(
    (earliest, event) =>
      !earliest || time(event) < time(earliest) ? event : earliest,
    undefined,
  );
  return {
    total: events.length,
    since: first ? formatInMunich(first.event_date, "MMMM yyyy") : undefined,
    hackathons: events.filter(
      (event) =>
        stegaClean(event.category) === ("Hackathon" satisfies EventCategory),
    ).length,
    withHosts: events.filter((event) => eventHosts(event).length > 0).length,
  };
}

/**
 * Whether an instant carries a start time. Editors (and the old import) store
 * an event whose time isn't known yet at exactly midnight UTC, which would
 * otherwise read as 01:00 or 02:00 in Munich.
 */
export function hasStartTime(iso: string): boolean {
  const date = new Date(iso);
  return (
    date.getUTCHours() !== 0 ||
    date.getUTCMinutes() !== 0 ||
    date.getUTCSeconds() !== 0
  );
}

/** An event's date, pre-formatted in Munich time for the page and dialog. */
export type EventDateLabels = {
  /** The ISO instant, for `<time dateTime>`. */
  dateTime: string;
  /** "24 September 2025". */
  long: string;
  /** "24 Sep". */
  short: string;
  /** "24". */
  day: string;
  /** "September". */
  month: string;
  /** "Wednesday". */
  weekday: string;
  /** "19:30", or undefined when the event has no start time. */
  time?: string;
};

/** Munich-time labels for an ISO instant. */
export function formatEventDate(iso: string): EventDateLabels {
  return {
    dateTime: iso,
    long: formatInMunich(iso, "d MMMM yyyy"),
    short: formatInMunich(iso, "d MMM"),
    day: formatInMunich(iso, "d"),
    month: formatInMunich(iso, "MMMM"),
    weekday: formatInMunich(iso, "EEEE"),
    time: hasStartTime(iso) ? formatInMunich(iso, "HH:mm") : undefined,
  };
}

/**
 * A title split at its co-branding crosses ("Anthropic x Lovable",
 * "AI × Life Sciences"), so the page can set each cross as a × in the accent.
 * Only a lone x or × between spaces counts; a title without one is one part.
 */
export function lockupParts(title: string): string[] {
  return title
    .trim()
    .split(/\s+[x×]\s+/i)
    .filter(Boolean);
}

/**
 * The co-hosts a title doesn't already name: "Anthropic x Lovable x Hugging
 * Face" with hosts Anthropic, Lovable, Hugging Face and CDTM leaves CDTM.
 */
export function hostsBeyondTitle(
  event: Pick<Event, "title"> & Hosted,
): string[] {
  // By text: in draft mode stega appends invisible characters to both.
  const title = stegaClean(event.title).toLowerCase();
  return eventHosts(event)
    .map(({ name }) => name)
    .filter((name) => !title.includes(plain(name).toLowerCase()));
}

/**
 * "Anthropic, Lovable and Hugging Face": co-hosts in running text, the one
 * format the hero, the register and the poster wall share.
 */
export function formatHosts(hosts: readonly string[]): string {
  return formatList(hosts.map((host) => host.trim()).filter(Boolean));
}

/** "Location, City", skipping whichever part is missing or repeated. */
export function formatEventLocation(event: Pick<Event, "location" | "city">) {
  const location = event.location?.trim();
  const city = event.city?.trim();
  if (location && city && location.toLowerCase().includes(city.toLowerCase())) {
    return location;
  }
  return [location, city].filter(Boolean).join(", ");
}

/** Short descriptions show in full; longer ones are cut at this length. */
const EXCERPT_LIMIT = 220;

/**
 * The first sentences of a description that fit {@link EXCERPT_LIMIT},
 * cut at a word with an ellipsis when even the first sentence is longer.
 * Paragraph breaks are read as spaces.
 */
export function excerpt(description: string): string {
  const text = description.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_LIMIT) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let result = "";
  for (const sentence of sentences) {
    if ((result + sentence).trim().length > EXCERPT_LIMIT) break;
    result += sentence;
  }
  if (result.trim()) return result.trim();
  const cut = text.slice(0, EXCERPT_LIMIT);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** A photo of an event. */
export type EventPhoto = { src: string; alt: string };

/**
 * Photos first, then the poster; empty when there is neither. Each URL
 * appears once: `poster` and `img` may reference the same Sanity asset.
 */
export function getEventPhotos(
  event: Pick<Event, "title" | "images" | "poster">,
): EventPhoto[] {
  const images = [...new Set(event.images)];
  const title = event.title.trim();
  if (images.length > 0) {
    return images.map((src, index) => ({
      src,
      alt: `${title}, image ${index + 1}`,
    }));
  }
  if (event.poster) {
    return [{ src: event.poster, alt: `${title}, poster` }];
  }
  return [];
}

/** Everything the event dialog shows, as plain, pre-formatted props. */
export type EventDetails = {
  title: string;
  date: EventDateLabels;
  location: string;
  category?: EventCategory;
  /** The co-hosts the title doesn't already name. */
  hosts: string[];
  description: string;
  /** The poster, or the first photo. */
  image?: EventPhoto;
};

/** The dialog's props for an event. */
export function toEventDetails(event: Event): EventDetails {
  return {
    title: event.title.trim(),
    date: formatEventDate(event.event_date),
    location: formatEventLocation(event),
    category: event.category,
    hosts: hostsBeyondTitle(event),
    description: event.description,
    image: event.poster
      ? { src: event.poster, alt: `${event.title.trim()}, poster` }
      : getEventPhotos(event)[0],
  };
}
