import { organizationFacts } from "./organization";

/**
 * Single source for community facts that the Apply and Community pages quote
 * in their copy, so a new figure is one edit here. See "Updating site facts"
 * in docs/contributor-guide.md.
 */
export const communityFacts = {
  /**
   * Size of the signature Makeathon, a lower bound that renders with "+" or
   * "over" (registrations on /apply, participants on /community).
   *
   * TODO(content): confirm the canonical Makeathon size. The copies said
   * "500+ registrations" and "over 500 participants"; is it 500, and is it
   * registrations or participants?
   */
  makeathonSize: 500,
} as const;

const berlinYear = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  year: "numeric",
});

/**
 * Whole calendar years between the founding year and `now`'s year in Munich,
 * e.g. 6 in 2026 for a 2020 founding. Pass the server's "now"; never call it
 * during a client render.
 */
export function yearsSinceFounding(now: Date): number {
  return Number(berlinYear.format(now)) - organizationFacts.foundingYear;
}
