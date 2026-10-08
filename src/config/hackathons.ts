/** Hackathon programme shapes and pure season summaries. Programme values come from CMS site settings; matches reference existing events. */

import { formatList } from "@/lib/words";

/** One match of a league season, as its own site lists it. */
export type LeagueMatch = {
  /** Stable key, as in the league site's URL (`munich-1`). */
  key: string;
  /** "Match 1", "Grand Finale". */
  label: string;
  city: string;
  /** First day, a Munich calendar date (YYYY-MM-DD). */
  start: string;
  /** Last day, a Munich calendar date (YYYY-MM-DD). */
  end: string;
  /** The match is a TUM.ai Makeathon. */
  makeathon?: true;
};

/** CMS-owned programme facts. Match dates and cities are projected from event references. */
export type HackathonFacts = {
  makeathonUrl: string;
  league: {
    name: string;
    url: string;
    foundedYear: number;
    finaleTeams: number;
    matches: readonly LeagueMatch[];
  };
};
/** The league's facts as copy states them. */
export type LeagueSummary = {
  /** The host cities in order of their first match. */
  cities: readonly string[];
  /** "Munich, Paris and Zurich" (house style, `formatList`). */
  citiesText: string;
  matchCount: number;
};

/** The cities and match count of a season, derived from its matches. */
export function leagueSummaryOf(
  matches: readonly Pick<LeagueMatch, "city">[],
): LeagueSummary {
  const cities = [...new Set(matches.map(({ city }) => city))];
  return {
    cities,
    citiesText: formatList(cities),
    matchCount: matches.length,
  };
}
