import "server-only";
import {
  getLogoLists,
  getPartnerOrganizations,
} from "@/lib/organization-content";
import type { Partner } from "@/lib/types";
import {
  type AlumniDestination,
  alumniDestinationsOf,
  symbolOnlyLogosOf,
} from "./data/partner-logos";
import { marqueeLogosOf } from "./data/partner-marquee-logos";
import { getPartnerDirectory, partnerOf } from "./partner-directory";
/** Artwork loaded once for the partner page's ordered logo sections. */
export type PartnerLogos = {
  alumniDestinations: AlumniDestination[];
  marqueeLogos: Readonly<Record<string, string | undefined>>;
  symbolOnlyLogos: ReadonlySet<string>;
};
/** Optional logo lists; intentional clearing remains visible. */
export async function getPartnerLogos(): Promise<PartnerLogos> {
  const lists = await getLogoLists({
    surfaces: ["alumni-destinations", "partner-marquee"],
    label: "partner logos",
  });
  return {
    alumniDestinations: alumniDestinationsOf(lists["alumni-destinations"]),
    marqueeLogos: marqueeLogosOf(lists["partner-marquee"]),
    symbolOnlyLogos: symbolOnlyLogosOf(Object.values(lists)),
  };
}
/** Published partners in tier, featured, editorial and alphabetical order. */
export async function getPartners(): Promise<Partner[]> {
  return getPartnerDirectory(
    (await getPartnerOrganizations({ label: "partners" })).map(partnerOf),
  );
}
/** Research partners share the same directory order. */
export async function getResearchPartners(): Promise<Partner[]> {
  return (await getPartners()).filter(
    ({ category }) => category === "Research Partners",
  );
}
