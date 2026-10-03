/**
 * The hackathons the /hackathons ribbon draws, from three sources: the
 * Makeathon editions (the page's copy), the league season (config) and the
 * CMS events in the Hackathon category. Pure and isomorphic; every date is
 * a Munich calendar day ("YYYY-MM-DD"), so string order is date order.
 */
import { stegaClean } from "next-sanity";
import type { LeagueMatch } from "@/config/hackathons";
import { munichIsoDate } from "@/lib/munich-time";
import type { Event, EventCategory } from "@/lib/types";
import type { MakeathonEdition } from "./model";

/**
 * `makeathon`: an edition of the flagship. `league`: a match of the league
 * that is not a Makeathon. `partner`: any other hackathon (a CMS event).
 */
export type MarkKind = "makeathon" | "league" | "partner";

/** One hackathon on the ribbon. */
export type HackathonMark = {
  /** Unique and stable: a React key and the scrubber's value. */
  id: string;
  title: string;
  kind: MarkKind;
  /** First day (YYYY-MM-DD, Munich). */
  start: string;
  /** Last day (YYYY-MM-DD, Munich); `start` for a one-day event. */
  end: string;
  city?: string;
  /** Where to read more or sign up: the CMS event's sign-up link. */
  href?: string;
  /** A Makeathon that was also a league match. */
  league?: true;
};

/** The CMS fields a partner mark reads. */
export type HackathonEvent = Pick<
  Event,
  "id" | "title" | "event_date" | "end_date" | "city" | "category" | "sign_up"
>;

const HACKATHON: EventCategory = "Hackathon";

/** Whether an event is in the Hackathon category (stega-safe). */
export function isHackathonEvent(event: Pick<Event, "category">): boolean {
  return stegaClean(event.category) === HACKATHON;
}

const dayOf = (iso: string) => munichIsoDate(new Date(iso));

/** An event as a partner mark; its end is its start without `end_date`. */
function eventMark(event: HackathonEvent): HackathonMark {
  const start = dayOf(event.event_date);
  const end = event.end_date ? dayOf(event.end_date) : start;
  const city = stegaClean(event.city ?? "").trim();
  return {
    id: `event-${stegaClean(event.id)}`,
    title: stegaClean(event.title).trim(),
    kind: "partner",
    start,
    end: end < start ? start : end,
    ...(city ? { city } : {}),
    ...(event.sign_up ? { href: event.sign_up } : {}),
  };
}

/** Two marks share a day in the same city (a mark without a city matches any). */
const sameHackathon = (a: HackathonMark, b: HackathonMark) =>
  a.start <= b.end &&
  b.start <= a.end &&
  (!a.city || !b.city || a.city === b.city);

/**
 * Every hackathon once, in calendar order. The editions and the league are
 * the record; a CMS event or league match that falls on a Makeathon in the
 * same city is that Makeathon (the CMS "Makeathon 2026" is the 2026
 * edition, which was also the league's first match) and only adds what the
 * edition lacks: the league flag and a sign-up link. A CMS event on a league
 * match adds its link to the match the same way.
 */
export function buildMarks({
  editions,
  matches,
  leagueName,
  events,
}: {
  editions: readonly MakeathonEdition[];
  matches: readonly LeagueMatch[];
  /** "European Hackathon League", for the match titles. */
  leagueName: string;
  events: readonly HackathonEvent[];
}): HackathonMark[] {
  const marks: HackathonMark[] = editions.map((edition) => ({
    id: `makeathon-${edition.key}`,
    title: edition.name,
    kind: "makeathon",
    start: edition.start,
    end: edition.end,
    city: edition.city,
  }));

  for (const match of matches) {
    const mark: HackathonMark = {
      id: `league-${match.key}`,
      title: `${leagueName}, ${match.label}`,
      kind: "league",
      start: match.start,
      end: match.end,
      city: match.city,
    };
    const makeathon = marks.find(
      (existing) =>
        existing.kind === "makeathon" && sameHackathon(existing, mark),
    );
    if (makeathon) makeathon.league = true;
    else marks.push(mark);
  }

  for (const event of events.filter(isHackathonEvent)) {
    const mark = eventMark(event);
    const record = marks.find(
      (existing) =>
        existing.kind !== "partner" && sameHackathon(existing, mark),
    );
    if (!record) marks.push(mark);
    else if (mark.href && !record.href) record.href = mark.href;
  }

  return marks.sort(
    (a, b) =>
      a.start.localeCompare(b.start) ||
      a.end.localeCompare(b.end) ||
      a.id.localeCompare(b.id),
  );
}

/** The hackathons that are over on `today` (YYYY-MM-DD, Munich). */
export function pastMarks(
  marks: readonly HackathonMark[],
  today: string,
): HackathonMark[] {
  return marks.filter((mark) => mark.end < today);
}

/**
 * The next hackathon on `today` (YYYY-MM-DD, Munich): the earliest one
 * that is running or still to come, or `undefined`.
 */
export function nextMark(
  marks: readonly HackathonMark[],
  today: string,
): HackathonMark | undefined {
  return marks.find((mark) => mark.end >= today);
}
