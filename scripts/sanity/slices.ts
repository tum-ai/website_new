import { buildApplyBackfill } from "@/features/apply/content";
import { buildCommunityBackfill } from "@/features/community/content";
import { buildELabBackfill } from "@/features/e-lab/content";
import { buildProjectsBackfill } from "@/features/projects/content";
import { buildQandaBackfill } from "@/features/qanda/content";
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

  // Phase 3: organizations (logos) and people

  // Phase 4: page copy
  { slice: "features/qanda/content.ts", build: buildQandaBackfill },
  { slice: "features/community/content.ts", build: buildCommunityBackfill },
  { slice: "features/projects/content.ts", build: buildProjectsBackfill },
];

/** The documents of every slice, in registry order. */
export function collectBackfill(): BackfillDocument[] {
  return backfillSlices.flatMap(({ build }) => build());
}
