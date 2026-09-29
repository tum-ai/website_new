/**
 * Partners public API for other features: the partner directory, the marquee
 * logos, the symbol-only artwork and the case studies (the homepage shows
 * them), and the one-sentence partner pitch the closing bands of /apply,
 * /community and /qanda share.
 *
 * The /partners route imports `./partners-page` directly. Never re-export a
 * page here: the bundler would ship that page's client islands to every page
 * that imports this index.
 */

export { symbolOnlyLogos } from "./data/partner-logos";
export { marqueeLogos } from "./data/partner-marquee-logos";
export { partnerCaseStudies, partnerPitch } from "./data/partners";
export {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "./partner-directory";
