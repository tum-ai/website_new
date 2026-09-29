import "server-only";

/**
 * Community server API for other features: what reads the CMS content source
 * or the render's application window. Import it only from server modules;
 * the isomorphic API (journey, departments) is `./index.ts`.
 *
 * The /community route imports `./community-page` directly; never re-export
 * a page here (see features/partners/index.ts).
 */

export { getJourneyStages } from "./content";
export { memberStoryKey } from "./data/member-stories";
export { MembershipApplyButton } from "./membership-apply-button";
export { buildMemberStoriesBackfill, getMemberStories } from "./people-content";
