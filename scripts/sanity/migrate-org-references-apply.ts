/**
 * The write step of `pnpm sanity:migrate-org-references --apply`, run by
 * the Sanity CLI (`sanity exec --with-user-token`, so it writes with the
 * editor's login) with `MIGRATE_DATASET`, `ORG_REFERENCES_INPUT` (the code
 * input the parent wrote) and `NEXT_PUBLIC_SANITY_PROJECT_ID` set. It plans
 * over the published documents and their drafts (`org-references-plan.ts`),
 * creates the planned organisations if they don't exist, patches each
 * document only at the revision it read (a concurrent Studio edit wins and
 * that document is reported instead), and deletes the `event-hosts` list
 * only at the revision it read. Imports are relative: the CLI runs this
 * file without the `@/` alias.
 */
import { readFileSync } from "node:fs";
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  eventHostsListId,
  formatPlan,
  PLAN_QUERY,
  type PlanDataset,
  type PlanInput,
  planOrgReferences,
  withDraftIds,
} from "./org-references-plan";

async function main() {
  const dataset = process.env.MIGRATE_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const inputFile = process.env.ORG_REFERENCES_INPUT;
  if (!dataset || !projectId || !inputFile || dataset === "production") {
    throw new Error(
      "Run this through `pnpm sanity:migrate-org-references --dataset <dataset> --apply`, which sets MIGRATE_DATASET (never production), ORG_REFERENCES_INPUT and NEXT_PUBLIC_SANITY_PROJECT_ID.",
    );
  }
  const input = JSON.parse(readFileSync(inputFile, "utf8")) as PlanInput;
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
  const plan = planOrgReferences(input, read);
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

  let created = 0;
  for (const document of plan.create) {
    if (
      await attempt(document._id, () =>
        client.createIfNotExists(document as { _id: string; _type: string }),
      )
    ) {
      created++;
    }
  }
  // A reference needs its organisation: without all of them, patch nothing.
  if (failures.length > 0) {
    process.stderr.write(
      `Could not create the organisations; nothing else was written:\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }

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
    `Created ${created} organisation(s), patched ${patched} of ${plan.patches.length} document(s), deleted ${deleted} of ${plan.deletes.length}.\n`,
  );
  if (failures.length > 0) {
    process.stderr.write(
      `Not written (run again to re-plan them):\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
  }
}

await main();
