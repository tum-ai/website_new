import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  assertSingleSourceTarget,
  completeMigrationStep,
  type MigrationCompletion,
  type MigrationDocument,
  type MigrationTarget,
  migrationCompleted,
  readMigrationCompletion,
  type SingleSourcePlan,
  singleSourceCompletionId,
  singleSourceFields,
} from "./single-source-migration";

/** Only completed uploads are cached; document images are never stored unattached. */
export type UploadLedger = MigrationTarget & { assets: Record<string, string> };
export type SingleSourceClient = {
  fetchDocuments(ids: string[]): Promise<MigrationDocument[]>;
  uploadImage(file: string): Promise<string>;
  /** Atomically creates the target and stores its receipt, guarding the completion revision. */
  createIfNotExists(
    document: MigrationDocument,
    completion: MigrationCompletion,
  ): Promise<void>;
  /** Revision-guarded final handoff, including fields/documents that already existed. */
  finish(completion: MigrationCompletion): Promise<void>;
  /** Atomically patches published/draft fields and their receipt, guarding every revision. */
  fill(
    documents: {
      id: string;
      revision: string;
      fields: Record<string, unknown>;
    }[],
    completion: MigrationCompletion,
  ): Promise<void>;
};

/** Validate a persisted plan again before a credentialed command can write. */
export function validateSingleSourcePlan(
  plan: SingleSourcePlan,
  target: MigrationTarget,
): void {
  assertSingleSourceTarget(target);
  if (
    plan.projectId !== target.projectId ||
    plan.dataset !== target.dataset ||
    plan.migration !== "single-source-2026-10"
  ) {
    throw new Error(
      "Migration plan target or version does not match this invocation",
    );
  }
  if (plan.draftVisibility !== "verified" && plan.draftVisibility !== "unknown")
    throw new Error("Invalid draft visibility boundary in plan");
  if (!Array.isArray(plan.blocked) || plan.blocked.length)
    throw new Error("Resolve all blocked migration prerequisites before apply");
  if (!Array.isArray(plan.steps)) throw new Error("Invalid migration steps");
  for (const step of plan.steps) {
    if (step.action === "create") {
      const allowed = new Map([
        ["hackathonsCopy", "hackathonsCopy"],
        ["organization-atira", "organization"],
        ["logolist-ehl-partners", "logoList"],
      ]);
      if (allowed.get(step.document._id) !== step.document._type)
        throw new Error("Unexpected create document in migration plan");
    } else if (step.action === "fill") {
      if (
        !step.revision ||
        !step.id ||
        step.id.includes(".") ||
        !singleSourceFields[step.type]
      )
        throw new Error("Invalid revision-guarded fill step");
      if (
        Object.keys(step.fields).some(
          (field) => !singleSourceFields[step.type].includes(field),
        )
      )
        throw new Error("Unexpected fill field in migration plan");
      if (step.type !== "organization" && step.id !== step.type)
        throw new Error("Unexpected singleton id in migration plan");
    } else throw new Error("Unexpected migration action");
  }
}

/**
 * Upload-before-link avoids the ambiguous empty-image state of dataset imports.
 * Persisting each completed upload lets a revision conflict retry without upload duplication.
 * The existing pending-assets repair ledger is intentionally a separate recovery mechanism.
 */
export async function applySingleSourceMigration(
  plan: SingleSourcePlan,
  target: MigrationTarget,
  client: SingleSourceClient,
  uploads: {
    ledger: UploadLedger;
    resolveFile(path: string): string;
    digest(file: string): string;
    save(ledger: UploadLedger): Promise<void>;
  },
): Promise<{
  created: number;
  filled: number;
  skipped: number;
  failures: string[];
}> {
  validateSingleSourcePlan(plan, target);
  if (
    uploads.ledger.projectId !== target.projectId ||
    uploads.ledger.dataset !== target.dataset
  )
    throw new Error("Upload ledger target mismatch");
  const uploaded = new Map<string, Promise<string>>();
  const resolveImages = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) {
      const resolved = [];
      for (const child of value) resolved.push(await resolveImages(child));
      return resolved;
    }
    if (!value || typeof value !== "object") return value;
    const { _localAsset, ...rest } = value as Record<string, unknown>;
    const resolved: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(rest))
      resolved[key] = await resolveImages(child);
    if (_localAsset === undefined) return resolved;
    if (
      typeof _localAsset !== "string" ||
      !/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/.test(_localAsset) ||
      resolved._type !== "image"
    )
      throw new Error("Invalid local migration image");
    const file = uploads.resolveFile(_localAsset);
    const key = `${_localAsset}:${uploads.digest(file)}`;
    let promise = uploaded.get(key);
    if (!promise) {
      promise = (async () => {
        const cached = uploads.ledger.assets[key];
        if (cached) return cached;
        const id = await client.uploadImage(file);
        uploads.ledger.assets[key] = id;
        await uploads.save(uploads.ledger);
        return id;
      })();
      uploaded.set(key, promise);
    }
    return { ...resolved, asset: { _type: "reference", _ref: await promise } };
  };
  const result = {
    created: 0,
    filled: 0,
    skipped: 0,
    failures: [] as string[],
  };
  for (const step of plan.steps) {
    const id = step.action === "create" ? step.document._id : step.id;
    try {
      const stored = await client.fetchDocuments([
        id,
        `drafts.${id}`,
        singleSourceCompletionId,
      ]);
      const completion = readMigrationCompletion(stored, target);
      if (migrationCompleted(completion, id)) {
        result.skipped++;
        continue;
      }
      const published = stored.find((doc) => doc._id === id);
      const draft = stored.find((doc) => doc._id === `drafts.${id}`);
      if (step.action === "create") {
        if (published) {
          result.skipped++;
          continue;
        }
        if (draft)
          throw new Error(
            "Unpublished draft appeared since planning; resolve it in Studio",
          );
        const document = (await resolveImages(
          step.document,
        )) as MigrationDocument;
        await client.createIfNotExists(
          document,
          completeMigrationStep(completion, step),
        );
        result.created++;
      } else {
        const incomplete = Object.fromEntries(
          Object.entries(step.fields).filter(
            ([path]) => !migrationCompleted(completion, id, path),
          ),
        );
        if (!Object.keys(incomplete).length) {
          result.skipped++;
          continue;
        }
        if (
          !published ||
          published._type !== step.type ||
          published._rev !== step.revision
        )
          throw new Error(
            "Published revision changed since planning; rerun the dry run",
          );
        if (draft && (draft._type !== step.type || !draft._rev))
          throw new Error("Invalid draft type or revision");
        const fields = (await resolveImages(incomplete)) as Record<
          string,
          unknown
        >;
        // Sanity setIfMissing also replaces null. Filter each raw document
        // first, then guard its revision so a deliberate Studio clear wins.
        const revisions = [published, ...(draft ? [draft] : [])].flatMap(
          (doc) => {
            const missing = Object.fromEntries(
              Object.entries(fields).filter(([path]) => {
                const segments = path.split(".");
                let parent: unknown = doc;
                for (const field of segments.slice(0, -1)) {
                  if (!parent || typeof parent !== "object") return false;
                  parent = (parent as Record<string, unknown>)[field];
                }
                return Boolean(
                  parent &&
                    typeof parent === "object" &&
                    (parent as Record<string, unknown>)[
                      segments.at(-1) as string
                    ] === undefined,
                );
              }),
            );
            return Object.keys(missing).length
              ? [{ id: doc._id, revision: doc._rev as string, fields: missing }]
              : [];
          },
        );
        if (!revisions.length) {
          result.skipped++;
          continue;
        }
        await client.fill(
          revisions,
          completeMigrationStep(completion, { ...step, fields: incomplete }),
        );
        result.filled++;
      }
    } catch (error) {
      result.failures.push(
        `${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (!result.failures.length) {
    try {
      const current = readMigrationCompletion(
        await client.fetchDocuments([singleSourceCompletionId]),
        target,
      );
      if (!current.complete)
        await client.finish({ ...current, complete: true });
    } catch (error) {
      result.failures.push(
        `${singleSourceCompletionId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return result;
}

async function main() {
  const planFile = process.env.SINGLE_SOURCE_PLAN;
  const ledgerFile = process.env.SINGLE_SOURCE_UPLOAD_LEDGER;
  const dataset = process.env.SINGLE_SOURCE_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (
    !planFile ||
    !ledgerFile ||
    !dataset ||
    !projectId ||
    process.env.SINGLE_SOURCE_APPLY !== "1"
  )
    throw new Error(
      "Run through sanity:migrate-single-source --dataset redesign --apply",
    );
  const target = { projectId, dataset };
  const plan = JSON.parse(readFileSync(planFile, "utf8")) as SingleSourcePlan;
  validateSingleSourcePlan(plan, target);
  const ledger = existsSync(ledgerFile)
    ? (JSON.parse(readFileSync(ledgerFile, "utf8")) as UploadLedger)
    : { ...target, assets: {} };
  if (
    !ledger.assets ||
    typeof ledger.assets !== "object" ||
    Array.isArray(ledger.assets) ||
    Object.values(ledger.assets).some(
      (id) => typeof id !== "string" || !id.startsWith("image-"),
    )
  )
    throw new Error(
      "Invalid upload ledger; preserve it and resolve its format before applying",
    );
  const { getCliClient } = await import("sanity/cli");
  const sanity = getCliClient({
    ...target,
    apiVersion: sanityApiVersion,
    useCdn: false,
    perspective: "raw",
  });
  const root = join(import.meta.dirname, "..", "..");
  const result = await applySingleSourceMigration(
    plan,
    target,
    {
      fetchDocuments: (ids) =>
        sanity.fetch<MigrationDocument[]>("*[_id in $ids]", { ids }),
      uploadImage: async (file) =>
        (
          await sanity.assets.upload("image", createReadStream(file), {
            filename: basename(file),
          })
        )._id,
      createIfNotExists: async (doc, completion) => {
        const transaction = sanity.transaction().createIfNotExists(doc);
        if (completion._rev)
          transaction.patch(completion._id, (patch) =>
            patch
              .ifRevisionId(completion._rev as string)
              .set({ entries: completion.entries }),
          );
        else transaction.create(completion);
        await transaction.commit();
      },
      finish: async (completion) => {
        const transaction = sanity.transaction();
        if (completion._rev)
          transaction.patch(completion._id, (patch) =>
            patch
              .ifRevisionId(completion._rev as string)
              .set({ complete: true }),
          );
        else transaction.create(completion);
        await transaction.commit();
      },
      fill: async (docs, completion) => {
        const transaction = sanity.transaction();
        for (const doc of docs)
          transaction.patch(doc.id, (patch) =>
            patch.ifRevisionId(doc.revision).setIfMissing(doc.fields),
          );
        if (completion._rev)
          transaction.patch(completion._id, (patch) =>
            patch
              .ifRevisionId(completion._rev as string)
              .set({ entries: completion.entries }),
          );
        else transaction.create(completion);
        await transaction.commit();
      },
    },
    {
      ledger,
      resolveFile: (path) => join(root, "public", path),
      digest: (file) =>
        createHash("sha256").update(readFileSync(file)).digest("hex"),
      save: async (value) => {
        const temporary = `${ledgerFile}.${process.pid}.tmp`;
        writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
        renameSync(temporary, ledgerFile);
      },
    },
  );
  process.stdout.write(
    `Created ${result.created}, filled ${result.filled}, skipped ${result.skipped}.\n`,
  );
  if (result.failures.length) {
    process.stderr.write(
      `${result.failures.join("\n")}\nRerun the dry run after resolving conflicts.\n`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
