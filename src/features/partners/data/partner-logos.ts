import type { Organization } from "@/lib/people-and-logos";
import { partnerLogoLists } from "./organizations";

/** A company in "Where they go afterwards": its name and light logo. */
export type AlumniDestination = { name: string; image?: string };

/** The alumni-destination chips of a logo list. */
export function alumniDestinationsOf(
  list: readonly Organization[],
): AlumniDestination[] {
  return list.map(({ name, logo }) =>
    logo ? { name, image: logo.src } : { name },
  );
}

/**
 * The symbol-only artwork among `lists` (light and dark logos): artwork that
 * doesn't name its company, so tiles and the hero marquee set the partner
 * name beside it as a wordmark lockup. Matched by file: the hero marquee
 * looks its dark artwork up by partner name, so it has only the file.
 */
export function symbolOnlyLogosOf(
  lists: readonly (readonly Organization[])[],
): ReadonlySet<string> {
  return new Set(
    lists
      .flat()
      .flatMap(({ logo, logoOnDark }) => [logo, logoOnDark])
      .flatMap((artwork) => (artwork?.symbolOnly ? [artwork.src] : [])),
  );
}

export const symbolOnlyLogos = symbolOnlyLogosOf(
  Object.values(partnerLogoLists),
);

export const alumniDestinations = alumniDestinationsOf(
  partnerLogoLists["alumni-destinations"],
);
