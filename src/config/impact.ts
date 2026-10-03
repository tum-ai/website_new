/**
 * Single source for TUM.ai's track record beyond membership: research output
 * and hackathon reach. The landing page and the Partners page quote them, so
 * a new paper or a bigger season is one edit here. Counts are lower bounds and
 * render with a trailing "+". See "Updating site facts" in
 * docs/contributor-guide.md.
 */
export const impactFacts = {
  /**
   * Peer-reviewed papers by members from TUM.ai research projects.
   *
   * TODO(content): confirm the count; the Partners page said "5+".
   */
  publications: 5,
  /** Venues those papers appeared at, most prominent first. */
  publicationVenues: ["NeurIPS", "ICML", "ICLR"],
  /** Participants across all TUM.ai hackathons so far. */
  hackathonParticipants: 2500,
} as const;

/** The record as the CMS `siteSettings` document holds it; `impactFacts` is the code fallback. */
export type ImpactFacts = {
  readonly publications: number;
  readonly publicationVenues: readonly string[];
  readonly hackathonParticipants: number;
};

const venueList = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/** The venues as running text: "NeurIPS, ICML, and ICLR". */
export function publicationVenuesTextOf(venues: readonly string[]): string {
  return venueList.format(venues);
}

/** {@link publicationVenuesTextOf} the code venues; per render, derive it from `getSiteFacts()`. */
export const publicationVenuesText = publicationVenuesTextOf(
  impactFacts.publicationVenues,
);
