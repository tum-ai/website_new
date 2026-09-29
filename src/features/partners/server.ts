import "server-only";

/**
 * Partners server API for other features: the content getters that read the
 * CMS content source (the partner pitch and copy, the case studies, the logo
 * sets, the partners themselves) and the organisation backfill other slices
 * build their logo lists from. Import it only from server modules; the isomorphic API is
 * `./index.ts`.
 *
 * The /partners route imports `./partners-page` directly; never re-export a
 * page here (see features/partners/index.ts).
 */

export { getPartnerCaseStudies, getPartnersCopy } from "./content";
export {
  buildOrganizationBackfill,
  getPartnerLogos,
  getPartners,
  getResearchPartners,
} from "./organization-content";
