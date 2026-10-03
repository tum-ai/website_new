/**
 * The write step of `pnpm sanity:migrate-home-quotes --apply`, run by the
 * Sanity CLI (`sanity exec --with-user-token`) with `MIGRATE_DATASET` and
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` set. It plans over `homeCopy` and its
 * draft (`home-quotes-plan.ts`) and patches each only at the revision it
 * read, so a concurrent Studio edit wins and is reported instead. Imports
 * are relative: the CLI runs this file without the `@/` alias.
 */
import { sanityApiVersion } from "../../src/lib/sanity-config";
import { PLAN_QUERY, type PlanInput, planHomeQuotes } from "./home-quotes-plan";

async function main() {
  const dataset = process.env.MIGRATE_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!dataset || !projectId || dataset === "production") {
    throw new Error(
      "Run this through `pnpm sanity:migrate-home-quotes --dataset <dataset> --apply`, which sets MIGRATE_DATASET (never production) and NEXT_PUBLIC_SANITY_PROJECT_ID.",
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
  const { patches, lines } = planHomeQuotes(
    await client.fetch<PlanInput>(PLAN_QUERY),
  );
  process.stdout.write(`${lines.join("\n")}\n`);

  const failures: string[] = [];
  for (const { id, rev, set, unset } of patches) {
    try {
      let patch = client.patch(id).set(set).unset(unset);
      if (rev) patch = patch.ifRevisionId(rev);
      await patch.commit();
    } catch (error) {
      failures.push(`${id}: ${error instanceof Error ? error.message : error}`);
    }
  }
  process.stdout.write(
    `Patched ${patches.length - failures.length} of ${patches.length} document(s).\n`,
  );
  if (failures.length > 0) {
    process.stderr.write(
      `Not patched (run again to re-plan them):\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
  }
}

await main();
