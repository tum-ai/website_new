/**
 * Community public API for other features: the member journey, whose two
 * tracks the Apply page quotes, and the core departments, which the
 * homepage counts. Their single sources are `./data/`; other pages that
 * describe them read them here. Safe for client islands: nothing here reads
 * the CMS. The member stories and the dated member call to action are
 * server-only (`./server.ts`).
 *
 * The /community route imports `./community-page` directly; never re-export a
 * page here (see features/partners/index.ts).
 */

export { departments } from "./data/departments";
export { type JourneyStep, memberJourney } from "./data/member-journey";
export type { MemberStory } from "./data/member-stories";
