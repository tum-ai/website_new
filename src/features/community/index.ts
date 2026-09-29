/**
 * Community public API for other features: the member journey, whose two
 * tracks the Apply page quotes, the core departments, which the homepage
 * counts, the member stories, which the homepage and the Apply page quote, and the dated member call to action the
 * homepage's closing band shares with this page's. The journey's single source is
 * `./data/member-journey.ts`; other pages that describe it read it here.
 *
 * The /community route imports `./community-page` directly; never re-export a
 * page here (see features/partners/index.ts).
 */

export { departments } from "./data/departments";
export { type JourneyStep, memberJourney } from "./data/member-journey";
export { stories as memberStories } from "./data/member-stories";
export { MembershipApplyButton } from "./membership-apply-button";
