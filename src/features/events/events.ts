/**
 * Server-side shaping for /events: the upcoming/past split, the month groups
 * and every date label. All of it runs on the server, and every date is read
 * in Munich time, so the output is the same whatever timezone the server
 * runs in (UTC on Vercel) and the browser never formats a date.
 */
import { tz } from "@date-fns/tz";
import { format } from "date-fns";
import type { Event } from "@/lib/types";

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
 * Splits events at `now`: upcoming (starting at or after `now`, soonest
 * first) and past (newest first). The inputs are left untouched.
 *
 * The comparison is between instants, so it needs no timezone; `now` is the
 * server's render time (see the /events route for how stale it can get).
 */
export function splitEvents<T extends Dated>(
  events: readonly T[],
  now: Date,
): { upcoming: T[]; past: T[] } {
  const cutoff = now.getTime();
  return {
    upcoming: events
      .filter((event) => time(event) >= cutoff)
      .sort((a, b) => time(a) - time(b)),
    past: events
      .filter((event) => time(event) < cutoff)
      .sort((a, b) => time(b) - time(a)),
  };
}

/** One calendar month of events, as {@link groupEventsByMonth} returns it. */
export type EventMonth<T> = {
  /** `yyyy-MM`, unique per month: a React key. */
  key: string;
  /** "October". */
  monthName: string;
  /** "2026". */
  year: string;
  /** The month's events, in input order. */
  events: T[];
};

/**
 * Groups events by their Munich calendar month, keeping the input order of
 * both the months (by first appearance) and the events within each. An event
 * at 23:30 UTC on 31 October is on 1 November in Munich, so it lands in
 * November.
 */
export function groupEventsByMonth<T extends Dated>(
  events: readonly T[],
): EventMonth<T>[] {
  const months = new Map<string, EventMonth<T>>();
  for (const event of events) {
    const key = formatInMunich(event.event_date, "yyyy-MM");
    let month = months.get(key);
    if (!month) {
      month = {
        key,
        monthName: formatInMunich(event.event_date, "MMMM"),
        year: formatInMunich(event.event_date, "yyyy"),
        events: [],
      };
      months.set(key, month);
    }
    month.events.push(event);
  }
  return [...months.values()];
}

/** An event's date, pre-formatted in Munich time for the cards and dialog. */
export type EventDateLabels = {
  /** The ISO instant, for `<time dateTime>`. */
  dateTime: string;
  /** "October 10th, 2026". */
  long: string;
  /** "10". */
  day: string;
  /** "Oct". */
  monthShort: string;
  /** "Sat". */
  weekday: string;
};

/** Munich-time labels for an ISO instant. */
export function formatEventDate(iso: string): EventDateLabels {
  return {
    dateTime: iso,
    long: formatInMunich(iso, "PPP"),
    day: formatInMunich(iso, "dd"),
    monthShort: formatInMunich(iso, "MMM"),
    weekday: formatInMunich(iso, "EEE"),
  };
}

/** Cards show this many characters; longer descriptions get "Read More". */
const DESCRIPTION_LIMIT = 300;

/** Whether the card truncates the description (and offers "Read More"). */
export function hasLongDescription(event: Pick<Event, "description">) {
  return event.description.length > DESCRIPTION_LIMIT;
}

/** The card's excerpt of a description. */
export function truncateDescription(description: string) {
  return description.length > DESCRIPTION_LIMIT
    ? `${description.slice(0, DESCRIPTION_LIMIT)}...`
    : description;
}

/** "Location, City", skipping whichever part is missing. */
export function formatEventLocation(event: Pick<Event, "location" | "city">) {
  return [event.location, event.city].filter(Boolean).join(", ");
}

/** A photo of an event. */
export type EventPhoto = { src: string; alt: string };

/**
 * Photos first, then the poster; empty when there is neither. Each URL
 * appears once: `poster` and `img` may reference the same Sanity asset, and
 * the carousel keys its slides by URL, so a repeat would both show the same
 * photo twice and let React keep a stale slide after a live update.
 */
export function getEventPhotos(
  event: Pick<Event, "title" | "images" | "poster">,
): EventPhoto[] {
  const images = [...new Set(event.images)];
  if (images.length > 0) {
    return images.map((src, index) => ({
      src,
      alt: `${event.title} Image ${index + 1}`,
    }));
  }
  if (event.poster) {
    return [{ src: event.poster, alt: `${event.title} Poster` }];
  }
  return [];
}

/** Everything the event dialog shows, as plain, pre-formatted props. */
export type EventDetails = {
  title: string;
  date: EventDateLabels;
  location: string;
  category?: string;
  description: string;
  image?: EventPhoto;
};

/** The dialog's props for an event; `image` defaults to the first photo. */
export function toEventDetails(
  event: Event,
  image: EventPhoto | undefined = getEventPhotos(event)[0],
): EventDetails {
  return {
    title: event.title,
    date: formatEventDate(event.event_date),
    location: formatEventLocation(event),
    category: event.category,
    description: event.description,
    image,
  };
}
