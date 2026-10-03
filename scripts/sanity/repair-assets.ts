/**
 * Recovery of image imports recorded in the pending-asset ledger.
 * `sanity dataset import` creates each document before it uploads the
 * document's images, so a failed upload (or an import that stopped) leaves
 * `{_type: "image"}` with no `asset`, and the next `--missing` import skips
 * the document because it exists. The dataset alone cannot tell that from an
 * editor's Remove in the Studio (which also keeps `alt`), so create-only copy
 * keeps a ledger of the uploads its own imports started,
 * `.sanity-backfill/<dataset>.pending-assets.json` (gitignored, per machine):
 *
 * - `BACKFILL_STAGE=before`, right before the import: adds every image of
 *   each planned document the create-only import will create to the ledger,
 *   keeping entries whose uploads are still unconfirmed.
 * - `BACKFILL_STAGE=after`, after the import (also a failed one): for each
 *   entry whose published document holds the image without `asset`, uploads
 *   the file and sets only that reference, on the published document and on
 *   its draft, so nothing an editor changed is touched. Entries drop once
 *   the image has its file or is gone; failed ones stay for the next run
 *   (only for the draft, `draftOnly`, when the published document's repair
 *   succeeded).
 *   An image without `asset` that is not in the ledger stays removed.
 *
 * `copy-production.ts` runs both stages through `sanity exec --with-user-token`.
 * The independent repair command runs only the after stage, with `BACKFILL_STAGE`, `BACKFILL_FILE` (the
 * NDJSON it imports), `BACKFILL_PENDING_FILE` (the ledger),
 * `BACKFILL_OVERWRITE`, `BACKFILL_DATASET` and
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` in the environment. Imports are relative:
 * the Sanity CLI runs this file without the `@/` alias.
 */
import {
  createReadStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  assetFileOf,
  type BackfillDocument,
  findUnattachedAssets,
  type PendingAsset,
  pendingAssetsBeforeImport,
  plannedAssets,
  settlePendingAssets,
} from "./asset-ledger";

/** A document as the dataset holds it. */
type StoredDocument = Record<string, unknown> & { _id: string; _rev: string };

/** What the recovery needs from Sanity; a fake in tests. */
export type RepairClient = {
  /** The ids among `ids` that exist. */
  existingIds(ids: string[]): Promise<string[]>;
  /** The documents among `ids` that exist. */
  fetchDocuments(ids: string[]): Promise<StoredDocument[]>;
  /** Uploads an image file and returns its asset document id. */
  uploadImage(file: string): Promise<string>;
  /**
   * Sets an image asset reference at each path (`{path: assetId}`), only
   * while the document is still at `rev`, so a concurrent Studio edit wins.
   */
  attach(
    id: string,
    rev: string,
    assets: Record<string, string>,
  ): Promise<void>;
};

/** Ids are queried in chunks, to keep each query's parameters small. */
const FETCH_CHUNK = 100;

async function inChunks<T>(
  ids: readonly string[],
  fetch: (chunk: string[]) => Promise<T[]>,
): Promise<T[]> {
  const results: T[] = [];
  for (let start = 0; start < ids.length; start += FETCH_CHUNK) {
    results.push(...(await fetch(ids.slice(start, start + FETCH_CHUNK))));
  }
  return results;
}

/**
 * The before stage: the ledger to write before importing `documents`. Asks
 * the dataset which of the documents that upload images exist already.
 */
export async function recordPendingAssets(
  documents: readonly BackfillDocument[],
  previous: readonly PendingAsset[],
  client: RepairClient,
  { overwrite }: { overwrite: boolean },
): Promise<PendingAsset[]> {
  const withImages = documents.filter(
    (document) => plannedAssets(document).length > 0,
  );
  const existingIds = overwrite
    ? new Set<string>()
    : new Set(
        await inChunks(
          withImages.map(({ _id }) => _id),
          (ids) => client.existingIds(ids),
        ),
      );
  return pendingAssetsBeforeImport(withImages, {
    existingIds,
    previous,
    overwrite,
  });
}

/**
 * The after stage: attaches the `pending` images the dataset holds without
 * a file, on each published document and its draft. Uploads each file once.
 * Returns how many images were attached, what failed (a failure never stops
 * the others) and the ledger entries to keep for the next run.
 */
export async function repairPendingAssets(
  pending: readonly PendingAsset[],
  client: RepairClient,
): Promise<{ attached: number; failures: string[]; pending: PendingAsset[] }> {
  const ids = [...new Set(pending.map(({ documentId }) => documentId))];
  const stored = await inChunks(
    ids.flatMap((id) => [id, `drafts.${id}`]),
    (chunk) => client.fetchDocuments(chunk),
  );
  const { open, repairs } = findUnattachedAssets(pending, stored);

  const uploads = new Map<string, Promise<string>>();
  const upload = (file: string) => {
    let assetId = uploads.get(file);
    if (!assetId) {
      assetId = client.uploadImage(file);
      uploads.set(file, assetId);
    }
    return assetId;
  };

  let attached = 0;
  const failures: string[] = [];
  const failedIds = new Set<string>();
  for (const { document, assets } of repairs) {
    try {
      const references: Record<string, string> = {};
      for (const { path, sanityAsset } of assets) {
        const file = assetFileOf(sanityAsset);
        if (!file) throw new Error(`no local file for ${sanityAsset}`);
        references[path] = await upload(file);
      }
      await client.attach(document._id, document._rev, references);
      attached += assets.length;
    } catch (error) {
      failedIds.add(document._id);
      failures.push(
        `${document._id}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
  return { attached, failures, pending: settlePendingAssets(open, failedIds) };
}

function readLedger(file: string): PendingAsset[] {
  if (!existsSync(file)) return [];
  const entries: unknown = JSON.parse(readFileSync(file as string, "utf8"));
  if (
    !Array.isArray(entries) ||
    !entries.every(
      (entry) =>
        typeof entry?.documentId === "string" &&
        typeof entry.path === "string" &&
        typeof entry.sanityAsset === "string" &&
        (entry.draftOnly === undefined || entry.draftOnly === true),
    )
  ) {
    throw new Error(
      `${file} is not a list of {documentId, path, sanityAsset, draftOnly?}: fix or delete it.`,
    );
  }
  return entries;
}

function writeLedger(file: string, entries: readonly PendingAsset[]) {
  writeFileSync(file, `${JSON.stringify(entries, null, 2)}\n`);
}

async function main() {
  const stage = process.env.BACKFILL_STAGE;
  const file = process.env.BACKFILL_FILE;
  const ledger = process.env.BACKFILL_PENDING_FILE;
  const dataset = process.env.BACKFILL_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (
    (stage !== "before" && stage !== "after") ||
    (stage === "before" && !file) ||
    !ledger ||
    !dataset ||
    !projectId ||
    dataset === "production"
  ) {
    throw new Error(
      "Run through sanity:copy-production --apply or sanity:repair-assets --apply; stage, ledger, dataset and project are required, with an import file for the before stage.",
    );
  }
  const { getCliClient } = await import("sanity/cli");
  const sanity = getCliClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
  });
  const client: RepairClient = {
    existingIds: (ids) => sanity.fetch<string[]>("*[_id in $ids]._id", { ids }),
    fetchDocuments: (ids) =>
      sanity.fetch<StoredDocument[]>("*[_id in $ids]", { ids }),
    uploadImage: async (path) =>
      (
        await sanity.assets.upload("image", createReadStream(path), {
          filename: basename(path),
        })
      )._id,
    attach: async (id, rev, assets) => {
      await sanity
        .patch(id)
        .ifRevisionId(rev)
        .set(
          Object.fromEntries(
            Object.entries(assets).map(([path, assetId]) => [
              `${path}.asset`,
              { _type: "reference", _ref: assetId },
            ]),
          ),
        )
        .commit();
    },
  };

  if (stage === "before") {
    const documents = readFileSync(file as string, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as BackfillDocument);
    const pending = await recordPendingAssets(
      documents,
      readLedger(ledger),
      client,
      { overwrite: process.env.BACKFILL_OVERWRITE === "1" },
    );
    writeLedger(ledger, pending);
    process.stdout.write(
      `Recorded ${pending.length} image upload(s) to confirm after the import.\n`,
    );
    return;
  }

  const { attached, failures, pending } = await repairPendingAssets(
    readLedger(ledger),
    client,
  );
  writeLedger(ledger, pending);
  process.stdout.write(
    attached > 0
      ? `Attached ${attached} image(s) an import left without a file.\n`
      : "Every image this machine imported has its file.\n",
  );
  if (failures.length > 0) {
    process.stderr.write(
      `Could not attach the images of ${failures.length} document(s); run the backfill again:\n${failures.join("\n")}\n`,
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
