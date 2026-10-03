/** Create missing partner organizations and fill absent fields from CMS only. */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { legacyDataset, sanityApiVersion } from "../../src/lib/sanity-config";
import type { MigrationStep, PartnerMigrationPlan } from "./partner-migration";

/** What the step needs from Sanity; a fake in tests. */
export type MigrationClient = {
  /** Creates the document unless one with its id exists; whether it did. */
  createIfNotExists(document: Record<string, unknown>): Promise<boolean>;
  /** Whether a document with this id exists. */
  exists(id: string): Promise<boolean>;
  /** Sets the fields each document lacks, in one transaction. */
  setIfMissing(ids: string[], fields: Record<string, unknown>): Promise<void>;
};

/** Carries out `steps`; returns what it did and what failed. */
export async function applyPartnerMigration(
  steps: readonly MigrationStep[],
  client: MigrationClient,
): Promise<{ created: number; updated: number; failures: string[] }> {
  let created = 0;
  let updated = 0;
  const failures: string[] = [];
  for (const step of steps) {
    try {
      if (step.action === "create") {
        const document = step.document;
        if (await client.createIfNotExists(document)) created++;
      } else {
        const fields = step.set;
        const draft = `drafts.${step.id}`;
        await client.setIfMissing(
          (await client.exists(draft)) ? [step.id, draft] : [step.id],
          fields,
        );
        updated++;
      }
    } catch (error) {
      failures.push(
        `${step.id}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
  return { created, updated, failures };
}

async function main() {
  const planFile = process.env.PARTNER_MIGRATION_PLAN;
  const dataset = process.env.PARTNER_MIGRATION_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!planFile || !dataset || !projectId) {
    throw new Error(
      "apply-partner-migration runs from `pnpm sanity:migrate-partners --apply`, which sets PARTNER_MIGRATION_PLAN, PARTNER_MIGRATION_DATASET and NEXT_PUBLIC_SANITY_PROJECT_ID.",
    );
  }
  if (dataset === legacyDataset) {
    throw new Error(
      `Refusing "${dataset}": it is the old site's dataset, which reads its partner documents.`,
    );
  }
  const plan = JSON.parse(
    readFileSync(planFile, "utf8"),
  ) as PartnerMigrationPlan;
  const { getCliClient } = await import("sanity/cli");
  const sanity = getCliClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
    perspective: "raw",
  });
  const client: MigrationClient = {
    createIfNotExists: async (document) => {
      const id = document._id as string;
      const before = await sanity.fetch<number>("count(*[_id == $id])", { id });
      if (before > 0) return false;
      await sanity.createIfNotExists(
        document as { _id: string; _type: string },
      );
      return true;
    },
    exists: async (id) =>
      (await sanity.fetch<number>("count(*[_id == $id])", { id })) > 0,
    setIfMissing: async (ids, fields) => {
      const stored = await sanity.fetch<
        (Record<string, unknown> & { _id: string; _rev: string })[]
      >("*[_id in $ids]", { ids });
      if (stored.length !== ids.length)
        throw new Error(
          "A migration target was removed; re-plan before applying",
        );
      const transaction = sanity.transaction();
      let patches = 0;
      for (const document of stored) {
        // Sanity setIfMissing replaces null, so filter deliberate clears before patching.
        const missing = Object.fromEntries(
          Object.entries(fields).filter(
            ([field]) => document[field] === undefined,
          ),
        );
        if (Object.keys(missing).length === 0) continue;
        transaction.patch(document._id, (patch) =>
          patch.ifRevisionId(document._rev).setIfMissing(missing),
        );
        patches++;
      }
      if (patches > 0) await transaction.commit();
    },
  };
  const { created, updated, failures } = await applyPartnerMigration(
    plan.steps,
    client,
  );
  process.stdout.write(
    `Created ${created} organisation(s), updated ${updated}.\n`,
  );
  if (failures.length > 0) {
    process.stderr.write(
      `${failures.length} step(s) failed; run the migration again:\n${failures.join("\n")}\n`,
    );
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
