/**
 * Partners public API for other features: the partner directory, the marquee
 * logos and the partnership email helper (the homepage shows all three).
 *
 * The /partners route imports `./partners-page` directly. Never re-export a
 * page here: the bundler would ship that page's client islands to every page
 * that imports this index.
 */

export { marqueeLogos } from "./data/partner-marquee-logos";
export {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "./partner-directory";
export { getPartnershipEmailUrl } from "./partnerships";
