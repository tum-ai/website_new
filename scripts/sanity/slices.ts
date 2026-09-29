import { buildApplyBackfill } from "@/features/apply/content";
import { buildELabBackfill } from "@/features/e-lab/content";
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
  { slice: "features/apply/content.ts", build: buildApplyBackfill },
  { slice: "features/e-lab/content.ts", build: buildELabBackfill },
];

/** The documents of every slice, in registry order. */
export function collectBackfill(): BackfillDocument[] {
  return backfillSlices.flatMap(({ build }) => build());
}
