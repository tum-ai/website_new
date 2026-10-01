import type { KeyDateItem } from "@/components/ds";
import { hackathonFacts } from "@/config/hackathons";
import { formatEventLocation, hostsBeyondTitle } from "@/features/events";
import { fillPageTokens } from "@/lib/content-copy";
import { munichIsoDate } from "@/lib/munich-time";
import type { Event } from "@/lib/types";
import type { HackathonsCopy } from "./data/copy";
import {
  buildMarks,
  type HackathonMark,
  type MarkKind,
  nextMark,
  pastMarks,
} from "./marks";
import {
  dayNumber,
  formatDayRange,
  layoutByYear,
  layoutRibbon,
  type PlacedMark,
} from "./ribbon";

/** One hackathon as the ribbon's list, slider and readout read it. */
type RibbonEntry = {
  id: string;
  title: string;
  kind: MarkKind;
  /** "26 to 28 April 2024". */
  dates: string;
  /** Still to come (drawn hollow). */
  upcoming: boolean;
  /** The next hackathon (the readout's default). */
  next: boolean;
};

/** A ribbon mark with what its CSS needs. */
export type DrawnMark = PlacedMark & Pick<RibbonEntry, "kind" | "upcoming">;

/** One row of the "between Makeathons" list. */
export type HackathonEventRow = {
  id: string;
  title: string;
  dates: string;
  /** "Cafe Luitpold, Munich", or empty. */
  place: string;
  /** Co-hosts the title doesn't already name. */
  hosts: string[];
  /** The sign-up link, while the hackathon is still to come. */
  signUp?: string;
};

/** The closing strip starts on 1 January of the year a year ago. */
const STRIP_DAYS = 365;

const monthYear = (day: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));

const shiftDays = (day: string, days: number) =>
  new Date((dayNumber(day) + days) * 86_400_000).toISOString().slice(0, 10);

/**
 * Everything /hackathons renders, shaped on the server from the copy, the
 * CMS events and `now` (the render time, read in Munich): the ribbon in
 * both layouts, the page tokens filled, the league's dates with their
 * state, and the list of the other hackathons.
 */
export function hackathonsView({
  copy,
  events,
  now,
}: {
  copy: HackathonsCopy;
  events: readonly Event[];
  now: Date;
}) {
  const today = munichIsoDate(now);
  const { league } = hackathonFacts;
  const marks = buildMarks({
    editions: copy.makeathon.editions,
    matches: league.matches,
    leagueName: league.name,
    events,
  });
  const next = nextMark(marks, today);

  const entries: RibbonEntry[] = marks.map((mark) => ({
    id: mark.id,
    title: mark.title,
    kind: mark.kind,
    dates: formatDayRange(mark.start, mark.end),
    upcoming: mark.start > today,
    next: mark === next,
  }));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const draw = (placed: PlacedMark): DrawnMark => {
    const entry = byId.get(placed.id) as RibbonEntry;
    return { ...placed, kind: entry.kind, upcoming: entry.upcoming };
  };
  const continuous = layoutRibbon(marks, today);
  const closing = layoutRibbon(marks, today, {
    from: `${shiftDays(today, -STRIP_DAYS).slice(0, 4)}-01-01`,
  });

  const firstEdition = copy.makeathon.editions[0];
  const since = firstEdition ? firstEdition.start.slice(0, 4) : "";
  const partnerMarks = marks.filter(({ kind }) => kind === "partner");
  const partnersPast = pastMarks(partnerMarks, today);

  return {
    hero: {
      ...copy.hero,
      lead: fillPageTokens(copy.hero.lead, {
        count: String(pastMarks(marks, today).length),
        since,
      }),
      ribbon: {
        entries,
        continuous: { ...continuous, marks: continuous.marks.map(draw) },
        byYear: layoutByYear(marks).map((row) => ({
          ...row,
          marks: row.marks.map(draw),
        })),
      },
    },
    makeathon: {
      ...copy.makeathon,
      title: fillPageTokens(copy.makeathon.title, { since }),
      // Newest first, as a record reads.
      editions: [...copy.makeathon.editions].reverse(),
      url: hackathonFacts.makeathonUrl,
    },
    partners: {
      ...copy.partners,
      lead: fillPageTokens(copy.partners.lead, {
        count: String(partnersPast.length),
        since: partnersPast[0] ? monthYear(partnersPast[0].start) : "",
      }),
      rows: hackathonEventRows(partnerMarks, events, today),
    },
    league: {
      ...copy.league,
      url: league.url,
      dates: leagueDates(today),
    },
    offer: copy.offer,
    closing: {
      ...copy.closing,
      strip: { ...closing, marks: closing.marks.map(draw) },
      next: next ? byId.get(next.id) : undefined,
      nextLabel: copy.hero.nextLabel,
    },
  };
}

/** The other hackathons, newest first, with their event's place and hosts. */
function hackathonEventRows(
  partnerMarks: readonly HackathonMark[],
  events: readonly Event[],
  today: string,
): HackathonEventRow[] {
  const eventsById = new Map(
    events.map((event) => [`event-${event.id}`, event]),
  );
  return [...partnerMarks].reverse().flatMap((mark) => {
    const event = eventsById.get(mark.id);
    if (!event) return [];
    return [
      {
        id: mark.id,
        title: mark.title,
        dates: formatDayRange(mark.start, mark.end),
        // A venue still "TBA" says nothing once the hackathon is over.
        place: /\bTBA\b/.test(event.location ?? "")
          ? (event.city ?? "")
          : formatEventLocation(event),
        hosts: hostsBeyondTitle(event),
        ...(mark.href && mark.end >= today ? { signUp: mark.href } : {}),
      },
    ];
  });
}

/** Days from `today` to `day`, in words: "Now" (today or running), "Tomorrow", "In 9 days". */
function daysUntil(day: string, today: string): string {
  const days = dayNumber(day) - dayNumber(today);
  if (days <= 0) return "Now";
  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

/** The season's matches as a register, each with its state on `today`. */
function leagueDates(today: string): KeyDateItem[] {
  const { matches } = hackathonFacts.league;
  const nextIndex = matches.findIndex(({ end }) => end >= today);
  return matches.map((match, index) => {
    const state =
      match.end < today ? "past" : index === nextIndex ? "next" : "upcoming";
    return {
      id: match.key,
      label: `${match.label}, ${match.city}`,
      ...("makeathon" in match && match.makeathon
        ? { detail: "The TUM.ai Makeathon" }
        : {}),
      date: formatDayRange(match.start, match.end, { short: true }),
      dateTime: match.start,
      state,
      ...(state === "next" ? { note: daysUntil(match.start, today) } : {}),
    };
  });
}
