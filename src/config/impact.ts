/** The record as the CMS `siteSettings` document holds it. */
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
