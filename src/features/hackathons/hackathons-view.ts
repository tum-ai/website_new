import type { KeyDateItem } from "@tum.ai/ui-kit";
import { hackathonFacts } from "@/config/hackathons";
import { formatEventLocation, hostsBeyondTitle } from "@/features/events";
import { organizationsWithKeys } from "@/features/partners";
import type { ContentImage } from "@/lib/cms-content-model";
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
  layoutSeason,
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

/** One match on the league's route, with its place and state on `today`. */
export type SeasonStopView = {
  key: string;
  /** "Match 1", "Grand Finale". */
  label: string;
  city: string;
  /** "17 - 19 Apr". */
  dates: string;
  dateTime: string;
  state: "past" | "next" | "upcoming";
  /** "In 8 days", on the next match only. */
  note?: string;
  /** Under a match that was a Makeathon. */
  detail?: string;
  finale: boolean;
};

/** A league partner's logo for dark bands. */
export type LeaguePartnerLogo = {
  name: string;
  src: string;
  /** The artwork's width over its height. */
  aspect: number;
  href?: string;
};

/** The other hackathons the page lists; the events page has the rest. */
const PARTNER_ROWS = 4;

const monthYear = (day: string) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));

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

  const firstEdition = copy.makeathon.editions[0];
  const since = firstEdition ? firstEdition.start.slice(0, 4) : "";
  const finaleMatch = league.matches.at(-1);
  const finale = finaleMatch
    ? finaleView(copy.league.finale, finaleMatch, today)
    : undefined;
  const finaleAhead = finale?.phase === "upcoming" || finale?.phase === "live";
  const route = layoutSeason(league.matches, today);
  const { figures } = copy.makeathon;
  const pageTokens = {
    since,
    editions: String(copy.makeathon.editions.length),
  };
  const partnerMarks = marks.filter(({ kind }) => kind === "partner");
  const partnersPast = pastMarks(partnerMarks, today);

  return {
    hero: {
      ...copy.hero,
      lead: fillPageTokens(copy.hero.lead, {
        count: String(pastMarks(marks, today).length),
        since,
      }),
      leagueUrl: league.url,
      makeathonUrl: hackathonFacts.makeathonUrl,
      // The hero's live line: the finale until it ends, then its champion.
      line:
        finale && finaleAhead
          ? {
              label: finale.label,
              text: `${finale.city}, ${finale.dates}`,
              dateTime: finale.dateTime,
              meta: finale.countdown,
            }
          : finale?.result
            ? { label: finale.result.label, text: finale.result.champion }
            : undefined,
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
      eyebrow: fillPageTokens(copy.makeathon.eyebrow, pageTokens),
      figures: [figures.latest, figures.editions, figures.league].map(
        ({ value, label }) => ({
          value: fillPageTokens(value, pageTokens),
          label: fillPageTokens(label, pageTokens),
        }),
      ),
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
      rows: hackathonEventRows(partnerMarks, events, today).slice(
        0,
        PARTNER_ROWS,
      ),
    },
    league: {
      ...copy.league,
      name: league.name,
      url: league.url,
      dates: leagueDates(today, copy.league.makeathonDetail),
      season: seasonStops(today, copy.league.makeathonDetail),
      progress: route.progress,
      finale,
      partners: leaguePartners(),
    },
    offer: copy.offer,
    closing: {
      ...copy.closing,
      // Until the finale ends, students can follow it too.
      finale:
        finale && finaleAhead
          ? { label: finale.actionLabel, url: league.url }
          : undefined,
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

/** Where the Grand Finale stands on a day. */
type FinalePhase = "upcoming" | "live" | "decided" | "champion";

/**
 * The Grand Finale on `today`, from the season's last match and its copy:
 * to come (the poster and a countdown), running ("Live now"), over (the
 * standings link) and, once editors enter the champion, the result with
 * the recap photo in the poster's place.
 */
export function finaleView(
  copy: HackathonsCopy["league"]["finale"],
  match: { city: string; start: string; end: string },
  today: string,
) {
  const champion = copy.champion?.trim();
  const phase: FinalePhase =
    today < match.start
      ? "upcoming"
      : today <= match.end
        ? "live"
        : champion
          ? "champion"
          : "decided";
  const over = phase === "decided" || phase === "champion";
  const recap = phase === "champion" && copy.recapPhoto;
  return {
    phase,
    label: copy.label,
    city: match.city,
    dates: formatDayRange(match.start, match.end, { year: false }),
    dateTime: match.start,
    /** "In 8 days" before, the live label during; none after. */
    countdown:
      phase === "upcoming"
        ? daysUntil(match.start, today)
        : phase === "live"
          ? copy.liveLabel
          : undefined,
    /** The sentence under the date; the result replaces it. */
    text: phase === "champion" ? undefined : over ? copy.pastText : copy.text,
    actionLabel: over ? copy.standingsLabel : copy.actionLabel,
    image: recap ? (copy.recapPhoto as ContentImage) : copy.poster,
    caption: recap ? copy.recapCaption : undefined,
    result:
      phase === "champion" && champion
        ? {
            label: copy.championLabel,
            champion,
            runnersUpLabel: copy.runnersUpLabel,
            runnersUp: (copy.runnersUp ?? [])
              .map((team) => team.trim())
              .filter(Boolean),
          }
        : undefined,
  };
}

/** The state of each match on `today`: played, the next one, or to come. */
function matchStates(today: string) {
  const { matches } = hackathonFacts.league;
  const nextIndex = matches.findIndex(({ end }) => end >= today);
  return matches.map((match, index) => ({
    match,
    state: (match.end < today
      ? "past"
      : index === nextIndex
        ? "next"
        : "upcoming") as SeasonStopView["state"],
  }));
}

/** The season's matches as a register, each with its state on `today`. */
function leagueDates(today: string, makeathonDetail: string): KeyDateItem[] {
  return matchStates(today).map(({ match, state }) => ({
    id: match.key,
    label: `${match.label}, ${match.city}`,
    ...("makeathon" in match && match.makeathon
      ? { detail: makeathonDetail }
      : {}),
    date: formatDayRange(match.start, match.end, { short: true }),
    dateTime: match.start,
    state,
    ...(state === "next" ? { note: daysUntil(match.start, today) } : {}),
  }));
}

/** The season's matches in order, for the route (see `layoutSeason`). */
function seasonStops(today: string, makeathonDetail: string): SeasonStopView[] {
  const { matches } = hackathonFacts.league;
  return matchStates(today).map(({ match, state }, index) => ({
    key: match.key,
    label: match.label,
    city: match.city,
    dates: formatDayRange(match.start, match.end, { short: true }),
    dateTime: match.start,
    state,
    ...(state === "next" ? { note: daysUntil(match.start, today) } : {}),
    ...("makeathon" in match && match.makeathon
      ? { detail: makeathonDetail }
      : {}),
    finale: index === matches.length - 1,
  }));
}

/** The league's partners that have artwork for dark bands, in config order. */
function leaguePartners(): LeaguePartnerLogo[] {
  return organizationsWithKeys(hackathonFacts.league.partners).flatMap(
    ({ name, href, logoOnDark }) =>
      logoOnDark && !logoOnDark.symbolOnly
        ? [
            {
              name,
              src: logoOnDark.src,
              aspect:
                logoOnDark.aspectRatio ?? logoOnDark.width / logoOnDark.height,
              ...(href ? { href } : {}),
            },
          ]
        : [],
  );
}
