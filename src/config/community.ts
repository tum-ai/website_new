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
  /**
   * Membership applications started in one recruiting round (a lower bound,
   * shown with "+"). /partners draws the batch from it.
   */
  startedApplicationsPerBatch: 2100,
  /**
   * Share of those applications that become members, in percent (2.3 is
   * 2.3%). The batch size /partners draws is derived from both figures.
   */
  acceptanceRatePercent: 2.3,
} as const;

const berlinYear = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  year: "numeric",
});

/** The figures as the CMS `siteSettings` document holds them; `communityFacts` is the code fallback. */
export type CommunityFacts = {
  readonly makeathonSize: number;
  readonly startedApplicationsPerBatch: number;
  readonly acceptanceRatePercent: number;
};

/**
 * The members one recruiting round admits: the started applications times
 * the acceptance rate, rounded to whole people (2100 at 2.3% is 48).
 */
export function admittedPerBatchOf(
  facts: Pick<
    CommunityFacts,
    "startedApplicationsPerBatch" | "acceptanceRatePercent"
  >,
): number {
  return Math.round(
    (facts.startedApplicationsPerBatch * facts.acceptanceRatePercent) / 100,
  );
}

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
