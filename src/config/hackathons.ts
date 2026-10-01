/**
 * Single source for the facts about TUM.ai's hackathon programmes beyond
 * the counts in `community.ts` and `impact.ts`: the Makeathon's own site
 * and the European Hackathon League that TUM.ai founded. /hackathons and
 * the Partners page quote them, so a new season is one edit here. See
 * "Updating site facts" in docs/contributor-guide.md.
 *
 * Source of truth for the league: its own site (`league.url`), as of
 * 2026-10-01. The league's leaderboard and rules live there and are not
 * repeated on this site.
 */

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

export const hackathonFacts = {
  /** The Makeathon's own site, with the current edition. */
  makeathonUrl: "https://makeathon.tum-ai.com",
  league: {
    name: "European Hackathon League",
    url: "https://ehl.gg",
    /** The year TUM.ai founded the league (its first season). */
    foundedYear: 2026,
    /**
     * Season one, in calendar order: the Makeathon 2026 was its first match.
     *
     * TODO(content): confirm who runs the matches outside Munich (Paris,
     * Zurich), and the Grand Finale's venue.
     */
    matches: [
      {
        key: "munich-1",
        label: "Match 1",
        city: "Munich",
        start: "2026-04-17",
        end: "2026-04-19",
        makeathon: true,
      },
      {
        key: "paris",
        label: "Match 2",
        city: "Paris",
        start: "2026-06-27",
        end: "2026-06-28",
      },
      {
        key: "munich-2",
        label: "Match 3",
        city: "Munich",
        start: "2026-08-22",
        end: "2026-08-23",
      },
      {
        key: "zurich",
        label: "Match 4",
        city: "Zurich",
        start: "2026-09-12",
        end: "2026-09-13",
      },
      {
        key: "finale",
        label: "Grand Finale",
        city: "Munich",
        start: "2026-10-10",
        end: "2026-10-11",
      },
    ] satisfies readonly LeagueMatch[],
  },
} as const;

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
