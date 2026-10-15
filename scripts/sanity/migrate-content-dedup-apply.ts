/**
 * The write step of `pnpm sanity:migrate-content-dedup --apply`, run by the
 * Sanity CLI (`sanity exec --with-user-token`, so it writes with the
 * editor's login) with `MIGRATE_DATASET` and
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` set. It plans over the published
 * documents and their drafts (`content-dedup-plan.ts`) and patches each
 * document only at the revision it read, so a concurrent Studio edit wins
 * and that document is reported instead. Imports are relative: the CLI
 * runs this file without the `@/` alias.
 */
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  formatPlan,
  PLAN_QUERY,
  planContentDedup,
  type StoredDocument,
  singletonIds,
  withDraftIds,
} from "./content-dedup-plan";

async function main() {
  const dataset = process.env.MIGRATE_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!dataset || !projectId || dataset === "production") {
    throw new Error(
      "Run this through `pnpm sanity:migrate-content-dedup --dataset <dataset> --apply`, which sets MIGRATE_DATASET (never production) and NEXT_PUBLIC_SANITY_PROJECT_ID.",
    );
  }
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
    perspective: "raw",
  });
  const documents = await client.fetch<StoredDocument[]>(PLAN_QUERY, {
    ids: withDraftIds(singletonIds),
  });
  const plan = planContentDedup(documents);
  process.stdout.write(`${formatPlan(plan)}\n`);

  const failures: string[] = [];
  for (const { id, rev, set, unset } of plan.patches) {
    try {
      let patch = client.patch(id).set(set).unset(unset);
      if (rev) patch = patch.ifRevisionId(rev);
      await patch.commit();
    } catch (error) {
      failures.push(`${id}: ${error instanceof Error ? error.message : error}`);
    }
  }
  const done = plan.patches.length - failures.length;
  process.stdout.write(
    `Patched ${done} of ${plan.patches.length} document(s).\n`,
  );
  if (failures.length > 0) {
    process.stderr.write(
      `Not patched (run again to re-plan them):\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
  }
}

await main();
