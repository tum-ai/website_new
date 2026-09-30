/**
 * The write step of `pnpm sanity:migrate-partners --apply`: carries out the
 * plan the dry run wrote (`partner-migration.ts`) with the editor's CLI
 * login. Run by `migrate-partners.ts` through
 * `sanity exec --with-user-token`, with `PARTNER_MIGRATION_PLAN` (the plan
 * file), `PARTNER_MIGRATION_DATASET` and `NEXT_PUBLIC_SANITY_PROJECT_ID` in
 * the environment. Imports are relative: the Sanity CLI runs this file
 * without the `@/` alias.
 *
 * - `create`: uploads the document's logo files, then `createIfNotExists`,
 *   so an organisation created since the dry run is left alone.
 * - `update`: uploads a planned logo file, then `setIfMissing` on the
 *   published document and, if there is one, its draft, in one transaction:
 *   fields an editor set in the meantime win, and a failure leaves both
 *   untouched, so the next dry run plans the step again (it reads only
 *   published documents and would not see a draft left behind).
 *
 * Every step runs on its own; a failure is reported and the others go on.
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import { assetFileOf } from "../../src/lib/cms-backfill";
import { legacyDataset, sanityApiVersion } from "../../src/lib/sanity-config";
import type { MigrationStep, PartnerMigrationPlan } from "./partner-migration";

/** What the step needs from Sanity; a fake in tests. */
export type MigrationClient = {
  /** Uploads an image file and returns its asset document id. */
  uploadImage(file: string): Promise<string>;
  /** Creates the document unless one with its id exists; whether it did. */
  createIfNotExists(document: Record<string, unknown>): Promise<boolean>;
  /** Whether a document with this id exists. */
  exists(id: string): Promise<boolean>;
  /** Sets the fields each document lacks, in one transaction. */
  setIfMissing(ids: string[], fields: Record<string, unknown>): Promise<void>;
};

/**
 * `value` with every local `_sanityAsset` image uploaded (through `upload`,
 * which dedupes files) and replaced by its asset reference.
 */
export async function withUploadedImages(
  value: unknown,
  upload: (file: string) => Promise<string>,
): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => withUploadedImages(item, upload)));
  }
  if (!value || typeof value !== "object") return value;
  const { _sanityAsset, ...fields } = value as Record<string, unknown>;
  const copy: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(fields)) {
    copy[key] = await withUploadedImages(field, upload);
  }
  if (typeof _sanityAsset !== "string") return copy;
  const file = assetFileOf(_sanityAsset);
  if (!file) throw new Error(`no local file for ${_sanityAsset}`);
  return { ...copy, asset: { _type: "reference", _ref: await upload(file) } };
}

/** Carries out `steps`; returns what it did and what failed. */
export async function applyPartnerMigration(
  steps: readonly MigrationStep[],
  client: MigrationClient,
): Promise<{ created: number; updated: number; failures: string[] }> {
  const uploads = new Map<string, Promise<string>>();
  const upload = (file: string) => {
    let id = uploads.get(file);
    if (!id) {
      id = client.uploadImage(file);
      uploads.set(file, id);
    }
    return id;
  };
  let created = 0;
  let updated = 0;
  const failures: string[] = [];
  for (const step of steps) {
    try {
      if (step.action === "create") {
        const document = (await withUploadedImages(
          step.document,
          upload,
        )) as Record<string, unknown>;
        if (await client.createIfNotExists(document)) created++;
      } else {
        const fields = (await withUploadedImages(step.set, upload)) as Record<
          string,
          unknown
        >;
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
  });
  const client: MigrationClient = {
    uploadImage: async (path) =>
      (
        await sanity.assets.upload("image", createReadStream(path), {
          filename: basename(path),
        })
      )._id,
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
      const transaction = sanity.transaction();
      for (const id of ids) {
        transaction.patch(id, (patch) => patch.setIfMissing(fields));
      }
      await transaction.commit();
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
