import { buildScheduleBackfill } from "@/config/schedule-content";
import { buildSiteSettingsBackfill } from "@/config/site-settings-content";
import { buildApplyBackfill } from "@/features/apply/content";
import { buildMemberStoriesBackfill } from "@/features/community/people-content";
import { buildELabBackfill } from "@/features/e-lab/content";
import { buildVentureBackfill } from "@/features/e-lab/venture-content";
import { buildEventHostBackfill } from "@/features/events/host-content";
import { buildPartnersBackfill } from "@/features/partners/content";
import { buildOrganizationBackfill } from "@/features/partners/organization-content";
import { buildRexBackfill } from "@/features/research/rex-content";
import type { BackfillDocument } from "@/lib/cms-backfill";

/**
 * Every content slice's backfill builder: what `pnpm sanity:backfill`
 * writes and `test/cms-backfill.test.ts` checks. Append one entry per
 * `content.ts` slice (see the `cms-content-model` skill, "Content slices").
 */
export const backfillSlices: readonly {
  /** The slice module, for messages. */
  slice: string;
  build: () => BackfillDocument[];
}[] = [
  // Shared page content (FAQs)
  { slice: "features/apply/content.ts", build: buildApplyBackfill },
  { slice: "features/e-lab/content.ts", build: buildELabBackfill },
  // Phases 1 and 2: campaigns, application windows, site settings
  {
    slice: "config/site-settings-content.ts",
    build: buildSiteSettingsBackfill,
  },
  { slice: "config/schedule-content.ts", build: buildScheduleBackfill },

  // Phase 3: organizations (logos) and people
  {
    slice: "features/partners/organization-content.ts",
    build: buildOrganizationBackfill,
  },
  { slice: "features/partners/content.ts", build: buildPartnersBackfill },
  { slice: "features/e-lab/venture-content.ts", build: buildVentureBackfill },
  { slice: "features/events/host-content.ts", build: buildEventHostBackfill },
  { slice: "features/research/rex-content.ts", build: buildRexBackfill },
  {
    slice: "features/community/people-content.ts",
    build: buildMemberStoriesBackfill,
  },

  // Phase 4: page copy
];

/** The documents of every slice, in registry order. */
export function collectBackfill(): BackfillDocument[] {
  return backfillSlices.flatMap(({ build }) => build());
}
