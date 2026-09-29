/**
 * The backfill's recovery step: attaches the images an earlier import left
 * without a file. `sanity dataset import` creates each document before it
 * uploads the document's images, so a failed upload (or an import that
 * stopped) leaves `{_type: "image"}` with no `asset`, and the next
 * `--missing` import skips the document because it exists. This uploads
 * those files and sets only the missing `asset` references, on the
 * published document and on a draft of it, so nothing an editor changed is
 * touched.
 *
 * `backfill.ts` runs it after every `--apply` import, through
 * `sanity exec --with-user-token` (the same CLI login as the import), with
 * `BACKFILL_FILE` (the NDJSON it imported), `BACKFILL_DATASET` and
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` in the environment. Imports are relative:
 * the Sanity CLI runs this file without the `@/` alias.
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import {
  assetFileOf,
  type BackfillDocument,
  findUnattachedAssets,
} from "../../src/lib/cms-backfill";
import { sanityApiVersion } from "../../src/lib/sanity-config";

/** A document as the dataset holds it. */
type StoredDocument = Record<string, unknown> & { _id: string; _rev: string };

/** What the repair needs from Sanity; a fake in tests. */
export type RepairClient = {
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

/** Ids are fetched in chunks, to keep each query's parameters small. */
const FETCH_CHUNK = 100;

/**
 * Attaches the planned images the dataset holds without a file, on each
 * backfilled document and its draft. Uploads each file once. Returns how
 * many images were attached and what failed (a failure never stops the
 * others).
 */
export async function repairUnattachedAssets(
  documents: readonly BackfillDocument[],
  client: RepairClient,
): Promise<{ attached: number; failures: string[] }> {
  const planned = new Map(
    documents
      .filter((document) => JSON.stringify(document).includes("_sanityAsset"))
      .map((document) => [document._id, document]),
  );
  const ids = [...planned.keys()].flatMap((id) => [id, `drafts.${id}`]);
  const stored: StoredDocument[] = [];
  for (let start = 0; start < ids.length; start += FETCH_CHUNK) {
    stored.push(
      ...(await client.fetchDocuments(ids.slice(start, start + FETCH_CHUNK))),
    );
  }

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
  for (const document of stored) {
    const plan = planned.get(document._id.replace(/^drafts\./, ""));
    const missing = findUnattachedAssets(plan, document);
    if (missing.length === 0) continue;
    try {
      const assets: Record<string, string> = {};
      for (const { path, sanityAsset } of missing) {
        const file = assetFileOf(sanityAsset);
        if (!file) throw new Error(`no local file for ${sanityAsset}`);
        assets[path] = await upload(file);
      }
      await client.attach(document._id, document._rev, assets);
      attached += missing.length;
    } catch (error) {
      failures.push(
        `${document._id}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
  return { attached, failures };
}

async function main() {
  const file = process.env.BACKFILL_FILE;
  const dataset = process.env.BACKFILL_DATASET;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!file || !dataset || !projectId) {
    throw new Error(
      "repair-assets runs from `pnpm sanity:backfill --apply`, which sets BACKFILL_FILE, BACKFILL_DATASET and NEXT_PUBLIC_SANITY_PROJECT_ID.",
    );
  }
  const { getCliClient } = await import("sanity/cli");
  const sanity = getCliClient({
    projectId,
    dataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
  });
  const documents = readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as BackfillDocument);

  const { attached, failures } = await repairUnattachedAssets(documents, {
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
  });
  process.stdout.write(
    attached > 0
      ? `Attached ${attached} image(s) an earlier import left without a file.\n`
      : "Every imported image has its file.\n",
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
