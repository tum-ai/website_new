/**
 * Partners public API for other features: the partner directory helpers
 * (the homepage shows the highlighted partners), the rotating partner wall
 * (a client island without CSS; its styles are global, in
 * styles/partner-rotation.css) and the organisation table other pages pick
 * their logos from. Safe for client islands: nothing here reads the CMS. The content getters (pitch, case studies, logo sets, the
 * partners) are server-only and live in `./server.ts`.
 *
 * The /partners route imports `./partners-page` directly. Never re-export a
 * page here or in `./server.ts`: the bundler would ship that page's client
 * islands to every page that imports the entry.
 */

export { organizationByKey } from "./data/organizations";
export { getHighlightedPartners, getPartnerKey } from "./partner-directory";
export { PartnerRotationGrid } from "./partner-rotation-grid";
