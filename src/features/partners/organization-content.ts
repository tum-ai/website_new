import "server-only";

import type { BackfillDocument } from "@/lib/cms-backfill";
import {
  buildLogoListDocument,
  buildOrganizationDocument,
  getLogoLists,
  getPartnerOrganizations,
} from "@/lib/organization-content";
import type { Partner } from "@/lib/types";
import {
  organizations,
  partnerLogoLists,
  partnerOrganizations,
} from "./data/organizations";
import {
  type AlumniDestination,
  alumniDestinationsOf,
  symbolOnlyLogosOf,
} from "./data/partner-logos";
import { marqueeLogosOf } from "./data/partner-marquee-logos";
import { getPartnerDirectory, partnerOf } from "./partner-directory";

/**
 * The organisation slice: every organisation document (the code table in
 * `data/organizations.ts`, which the E-Lab, events and REX slices pick from
 * by key), the partners (the organisations with a partnership) and the
 * partner sections' logo lists. The shared query and mapping are in
 * `lib/organization-content.ts`.
 */

/** The logos /partners reads from the CMS, in the shapes its sections use. */
export type PartnerLogos = {
  /** "Where they go afterwards". */
  alumniDestinations: AlumniDestination[];
  /** Dark-band artwork by partner key, for the hero marquee. */
  marqueeLogos: Readonly<Record<string, string | undefined>>;
  /** Symbol-only artwork files of those lists (the marquee's included). */
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
    symbolOnlyLogos: symbolOnlyLogosOf(Object.values(lists)),
  };
}

/**
 * Every partner in directory order (`getPartnerDirectory`): the CMS's
 * partner organisations, or the code's (`partnerOrganizations`).
 */
export async function getPartners(): Promise<Partner[]> {
  const partners = await getPartnerOrganizations({
    fallback: partnerOrganizations,
    label: "the partners",
    mockDocuments: buildOrganizationBackfill,
  });
  return getPartnerDirectory(partners.map(partnerOf));
}

/** The research partners (/research), in directory order. */
export async function getResearchPartners(): Promise<Partner[]> {
  return (await getPartners()).filter(
    ({ category }) => category === "Research Partners",
  );
}

/**
 * Every organisation (partners with their partnership fields), and the
 * partner sections' logo lists, as documents for `pnpm sanity:backfill`.
 * Other slices' lists and references point at these documents.
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
