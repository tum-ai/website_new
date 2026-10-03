import { organizationFacts } from "./organization";

/**
 * Single source for community facts that the Apply and Community pages quote
 * in their copy, so a new figure is one edit here. See "Updating site facts"
 * in docs/contributor-guide.md.
 */
export const communityFacts = {
  /**
   * Participants at the signature Makeathon, a lower bound that renders
   * with "+" or "over": 500+ at the Makeathon 2026 (Match 1 of the European
   * Hackathon League, as its site states). /apply's 2025 milestone quotes
   * the same figure as registrations, which the 2025 edition also had.
   */
  makeathonSize: 500,
} as const;

const berlinYear = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  year: "numeric",
});

/** The figures as the CMS `siteSettings` document holds them; `communityFacts` is the code fallback. */
export type CommunityFacts = { readonly makeathonSize: number };

/**
 * Whole calendar years between the founding year and `now`'s year in Munich,
 * e.g. 6 in 2026 for a 2020 founding. Pass the server's "now"; never call it
 * during a client render. `foundingYear` defaults to the code fact; pass the
 * resolved one from `getSiteFacts()` where it is at hand.
 */
export function yearsSinceFounding(
  now: Date,
  foundingYear: number = organizationFacts.foundingYear,
): number {
  return Number(berlinYear.format(now)) - foundingYear;
}
