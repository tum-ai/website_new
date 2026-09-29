/**
 * Where `pnpm sanity:backfill` may write: the guard behind its `--dataset`
 * flag, kept apart from the script so tests can call it.
 */
import { legacyDataset } from "@/lib/sanity-config";

/** The dataset and project a backfill targets. */
export type BackfillTarget = { dataset: string; projectId: string | null };

type Env = Record<string, string | undefined>;

/**
 * The target for `--dataset <dataset>`, or an error: the flag is required
 * (no default, so a run always names where it goes), must be a dataset
 * name, and is never `production`, the old site's dataset: the site on
 * `main` renders every document there, and the backfill only ever reads it.
 * `env` must already hold `.env.local` (the script loads it first).
 */
export function backfillTarget(
  dataset: string | undefined,
  env: Env,
): BackfillTarget {
  if (!dataset) {
    throw new Error(
      "Name the target dataset: pnpm sanity:backfill --dataset redesign",
    );
  }
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset)) {
    throw new Error(`Not a dataset name: "${dataset}"`);
  }
  if (dataset === legacyDataset) {
    throw new Error(
      `Refusing "${dataset}": it is the old site's dataset, which the backfill only reads. Import into the new site's dataset (--dataset redesign).`,
    );
  }
  return {
    dataset,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || null,
  };
}
