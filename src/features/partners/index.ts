/**
 * Partners public API for other features: the partner directory, the marquee
 * logos, the symbol-only artwork and the case studies (the homepage shows
 * them), the one-sentence partner pitch the closing bands of /apply,
 * /community and /qanda share, and the organisation table other pages pick
 * their logos from.
 *
 * The content getters (`get…`) are server-only: they read the CMS content
 * source. Import this index only from server modules; a client island that
 * reached it would pull `server-only` into the browser bundle.
 *
 * The /partners route imports `./partners-page` directly. Never re-export a
 * page here: the bundler would ship that page's client islands to every page
 * that imports this index.
 */

export {
  getPartnerCaseStudies,
  /** @public For the closings' partner pitch in the integration pass. */
  getPartnersCopy,
} from "./content";
export { organizationByKey } from "./data/organizations";
export { symbolOnlyLogos } from "./data/partner-logos";
export { marqueeLogos } from "./data/partner-marquee-logos";
export { partnerPitch } from "./data/partners";
export {
  buildOrganizationBackfill,
  /** @public For the home hero's marquee artwork in the integration pass. */
  getPartnerLogos,
} from "./organization-content";
export {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "./partner-directory";
