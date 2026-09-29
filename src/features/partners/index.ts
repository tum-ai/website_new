/**
 * Partners public API for other features: the partner directory (the
 * homepage shows its highlighted partners) and the organisation table other
 * pages pick their logos from. Safe for client islands: nothing here reads
 * the CMS. The content getters (pitch, case studies, logo sets) are
 * server-only and live in `./server.ts`.
 *
 * The /partners route imports `./partners-page` directly. Never re-export a
 * page here or in `./server.ts`: the bundler would ship that page's client
 * islands to every page that imports the entry.
 */

export { organizationByKey } from "./data/organizations";
export {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "./partner-directory";
