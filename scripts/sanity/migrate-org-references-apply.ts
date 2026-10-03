/** Re-plan from CMS and patch only the revisions read, including drafts. */
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  eventHostsListId,
  formatPlan,
  PLAN_QUERY,
  type PlanDataset,
  planOrgReferences,
  withDraftIds,
} from "./org-references-plan";

async function main() {
  const dataset = process.env.MIGRATE_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!dataset || !projectId || dataset === "production") {
    throw new Error(
      "Run this through `pnpm sanity:migrate-org-references --dataset <dataset> --apply`, which sets MIGRATE_DATASET (never production), ORG_REFERENCES_INPUT and NEXT_PUBLIC_SANITY_PROJECT_ID.",
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
  const read = await client.fetch<PlanDataset>(PLAN_QUERY, {
    listIds: withDraftIds([eventHostsListId]),
  });
  const plan = planOrgReferences(read);
  process.stdout.write(`${formatPlan(plan)}\n`);

  const failures: string[] = [];
  const attempt = async (id: string, step: () => Promise<unknown>) => {
    try {
      await step();
      return true;
    } catch (error) {
      failures.push(`${id}: ${error instanceof Error ? error.message : error}`);
      return false;
    }
  };

  let patched = 0;
  for (const { id, rev, set, unset } of plan.patches) {
    if (
      await attempt(id, () => {
        let patch = client.patch(id).set(set);
        if (unset.length > 0) patch = patch.unset(unset);
        if (rev) patch = patch.ifRevisionId(rev);
        return patch.commit();
      })
    ) {
      patched++;
    }
  }

  let deleted = 0;
  for (const { id, rev } of plan.deletes) {
    if (
      await attempt(id, () => {
        const transaction = client.transaction();
        // The revision guard: a list edited since it was read stays.
        if (rev) {
          transaction.patch(id, (patch) =>
            patch.ifRevisionId(rev).set({ surface: "event-hosts" }),
          );
        }
        return transaction.delete(id).commit();
      })
    ) {
      deleted++;
    }
  }

  process.stdout.write(
    `Patched ${patched} of ${plan.patches.length} document(s), deleted ${deleted} of ${plan.deletes.length}.\n`,
  );
  if (failures.length > 0) {
    process.stderr.write(
      `Not written (run again to re-plan them):\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
  }
}

await main();
