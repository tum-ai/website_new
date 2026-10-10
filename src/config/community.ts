const berlinYear = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  year: "numeric",
});

/** The figures as the CMS `siteSettings` document holds them. */
export type CommunityFacts = { readonly makeathonSize: number };

/**
 * Whole calendar years between the founding year and `now`'s year in Munich,
 * e.g. 6 in 2026 for a 2020 founding. Pass the server's "now"; never call it
 * during a client render. `foundingYear` defaults to the code fact; pass the
 * resolved one from `getSiteFacts()` where it is at hand.
 */
export function yearsSinceFounding(now: Date, foundingYear: number): number {
  return Number(berlinYear.format(now)) - foundingYear;
}
