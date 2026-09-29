import "server-only";

import type { BackfillDocument } from "@/lib/cms-backfill";
import {
  buildLogoListDocument,
  buildOrganizationDocument,
  getLogoLists,
} from "@/lib/organization-content";
import { organizations, partnerLogoLists } from "./data/organizations";
import {
  type AlumniDestination,
  alumniDestinationsOf,
  symbolOnlyLogos,
  symbolOnlyLogosOf,
} from "./data/partner-logos";
import { marqueeLogosOf } from "./data/partner-marquee-logos";

/**
 * The organisation slice: every organisation document (the code table in
 * `data/organizations.ts`, which the E-Lab and events slices pick from by
 * key) and the partner sections' logo lists. The shared query and mapping
 * are in `lib/organization-content.ts`.
 */

/** The logos /partners reads from the CMS, in the shapes its sections use. */
export type PartnerLogos = {
  /** "Where they go afterwards". */
  alumniDestinations: AlumniDestination[];
  /** Dark-band artwork by partner key, for the hero marquee. */
  marqueeLogos: Readonly<Record<string, string | undefined>>;
  /**
   * Symbol-only artwork files. The code files stay in the set, so the
   * launch-default partner logos keep their name beside them while CMS
   * artwork is served from the CDN.
   */
  symbolOnlyLogos: ReadonlySet<string>;
};

/** The partner sections' logos: the CMS lists, or the code lists. */
export async function getPartnerLogos(): Promise<PartnerLogos> {
  const lists = await getLogoLists({
    lists: partnerLogoLists,
    label: "the partner logos",
    mockDocuments: buildOrganizationBackfill,
  });
  return {
    alumniDestinations: alumniDestinationsOf(lists["alumni-destinations"]),
    marqueeLogos: marqueeLogosOf(lists["partner-marquee"]),
    symbolOnlyLogos: new Set([
      ...symbolOnlyLogos,
      ...symbolOnlyLogosOf(Object.values(lists)),
    ]),
  };
}

/**
 * Every organisation, and the partner sections' logo lists, as documents
 * for `pnpm sanity:backfill`. Other slices' lists and references point at
 * these documents.
 */
export function buildOrganizationBackfill(): BackfillDocument[] {
  return [
    ...organizations.map(buildOrganizationDocument),
    buildLogoListDocument(
      "alumni-destinations",
      partnerLogoLists["alumni-destinations"],
    ),
    buildLogoListDocument(
      "partner-marquee",
      partnerLogoLists["partner-marquee"],
    ),
  ];
}
