/** Live published production documents copied without local editorial enrichment. */

import { legacyDataset } from "@/lib/sanity-config";
import type { BackfillDocument } from "./asset-ledger";

/** The document types the old site has, copied as they are. */
export const copiedTypes = ["event", "partner", "research"] as const;

/** A document as the Sanity API returns it. */
export type SourceDocument = {
  _id: string;
  _type: string;
  [field: string]: unknown;
};

/** Reads the published documents of `copiedTypes` from `dataset`. */
export type FetchDocuments = (source: {
  projectId: string;
  dataset: string;
}) => Promise<SourceDocument[]>;

/** Published documents only: drafts and release versions are skipped. */
const PUBLISHED_QUERY = `*[_type in $types && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_type asc, _id asc)`;

/**
 * Reads the documents over the public HTTP API: no token, so only published
 * documents of a public dataset, and not the API CDN, so a run right before
 * launch sees the latest edits. Throws on any failure: a partial copy must
 * never reach the import.
 */
const fetchPublishedDocuments: FetchDocuments = async ({
  projectId,
  dataset,
}) => {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`,
  );
  url.searchParams.set("query", PUBLISHED_QUERY);
  url.searchParams.set("$types", JSON.stringify(copiedTypes));
  url.searchParams.set("perspective", "published");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Could not read "${dataset}" of project "${projectId}": HTTP ${response.status} ${await response.text()}`,
    );
  }
  const { result } = (await response.json()) as { result?: unknown };
  if (!Array.isArray(result)) {
    throw new Error(`Unexpected response from "${dataset}": no result list`);
  }
  return result as SourceDocument[];
};

/** Fields the source dataset sets on its own revision; the import sets them anew. */
const serverFields = new Set(["_rev", "_updatedAt", "_system"]);

/**
 * The CDN URL of an image asset (`image-<sha1>-<w>x<h>-<ext>`) in
 * `dataset`. Anything else throws: the import could not upload it.
 */
export function imageAssetUrl(
  ref: string,
  projectId: string,
  dataset: string,
): string {
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-([a-z0-9]+)$/.exec(ref);
  if (!match) throw new Error(`Not an image asset reference: "${ref}"`);
  const [, hash, size, extension] = match;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-${size}.${extension}`;
}

/**
 * `value` with every image's `asset` reference swapped for an
 * `_sanityAsset` the import uploads; all other fields (hotspot, crop, alt,
 * `_key`) stay.
 */
function withImportableAssets(
  value: unknown,
  source: { projectId: string; dataset: string },
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withImportableAssets(item, source));
  }
  if (!value || typeof value !== "object") return value;
  const { asset, ...fields } = value as { asset?: unknown };
  const copy = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [
      key,
      withImportableAssets(field, source),
    ]),
  );
  if (asset === undefined) return copy;
  const ref = (asset as { _ref?: unknown } | null)?._ref;
  if (typeof ref !== "string") {
    throw new Error(`An asset without a reference: ${JSON.stringify(asset)}`);
  }
  return {
    ...copy,
    _sanityAsset: `image@${imageAssetUrl(ref, source.projectId, source.dataset)}`,
  };
}

/** Published create-only import payload, without locally authored enrichment. */
export type ProductionCopy = { documents: BackfillDocument[] };

/**
 * Importable published source documents: preserve IDs and editorial fields, remove
 * server revision fields and resolve image references to original CDN asset URLs.
 * No local hosts, organizations or editorial catalog is consulted.
 */
export function copyProductionDocuments(
  documents: readonly SourceDocument[],
  {
    projectId,
    dataset = legacyDataset,
  }: {
    projectId: string;
    dataset?: string;
  },
): ProductionCopy {
  const types = new Set<string>(copiedTypes);
  const copies = documents
    .filter(({ _id, _type }) => types.has(_type) && !_id.includes("."))
    .map((document) => {
      const fields = Object.fromEntries(
        Object.entries(document).filter(([key]) => !serverFields.has(key)),
      );
      return withImportableAssets(fields, {
        projectId,
        dataset,
      }) as BackfillDocument;
    });

  return { documents: copies };
}

/**
 * The live copy of `production`: `fetchDocuments` (the public
 * API by default; a fixture in tests), then {@link copyProductionDocuments}.
 */
export async function copyFromProduction({
  projectId,
  fetchDocuments = fetchPublishedDocuments,
}: {
  projectId: string;
  fetchDocuments?: FetchDocuments;
}): Promise<ProductionCopy> {
  const documents = await fetchDocuments({ projectId, dataset: legacyDataset });
  return copyProductionDocuments(documents, { projectId });
}

/**
 * What Sanity's image CDN is asked for when the copy downloads an original.
 * Without `image/webp` in `Accept`, the CDN converts WebP originals to JPEG
 * or PNG, and the import rejects a `.webp` file holding JPEG data ("Invalid
 * image, could not process").
 */
const imageAccept = "image/webp,image/avif,image/svg+xml,image/*;q=0.8";

/** Whether `bytes` hold the image format the file extension names. */
export function matchesExtension(
  bytes: Uint8Array,
  extension: string,
): boolean {
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...bytes.subarray(from, to));
  switch (extension) {
    case "png":
      return ascii(1, 4) === "PNG";
    case "jpg":
    case "jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "gif":
      return ascii(0, 3) === "GIF";
    case "svg":
      return /<svg[\s>]/.test(
        new TextDecoder().decode(bytes.subarray(0, 4096)),
      );
    default:
      return false;
  }
}

/** Downloads one image; the default fetches the CDN URL with `imageAccept`. */
export type FetchImage = (url: string) => Promise<Uint8Array>;

const fetchImage: FetchImage = async (url) => {
  const response = await fetch(url, { headers: { accept: imageAccept } });
  if (!response.ok) {
    throw new Error(`Could not download ${url}: HTTP ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

/**
 * `documents` with every `image@https://cdn.sanity.io/...` asset downloaded
 * into `dir` and pointed at as a local `image@file://` asset, so the import
 * uploads exactly the checked bytes instead of fetching the URL itself (and
 * getting whatever format the CDN negotiates). A file whose bytes don't match
 * its extension throws.
 */
export async function localizeCdnAssets(
  documents: readonly BackfillDocument[],
  {
    dir,
    writeFile,
    download = fetchImage,
  }: {
    dir: string;
    writeFile: (path: string, bytes: Uint8Array) => void;
    download?: FetchImage;
  },
): Promise<{ documents: BackfillDocument[]; downloaded: number }> {
  const cdnPrefix = "image@https://cdn.sanity.io/images/";
  const local = new Map<string, string>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      for (const [key, field] of Object.entries(value)) {
        if (key === "_sanityAsset" && typeof field === "string") {
          if (field.startsWith(cdnPrefix)) local.set(field, "");
        } else visit(field);
      }
    }
  };
  visit(documents);

  for (const asset of local.keys()) {
    const url = asset.slice("image@".length);
    const name = url.slice(url.lastIndexOf("/") + 1);
    const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
    const bytes = await download(url);
    if (!matchesExtension(bytes, extension)) {
      throw new Error(
        `${url} did not download as a .${extension} file; the import would reject it.`,
      );
    }
    const path = `${dir}/${name}`;
    writeFile(path, bytes);
    local.set(asset, `image@file://${path}`);
  }

  const rewrite = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rewrite);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [
        key,
        key === "_sanityAsset" && typeof field === "string"
          ? (local.get(field) ?? field)
          : rewrite(field),
      ]),
    );
  };
  return {
    documents: documents.map(
      (document) => rewrite(document) as BackfillDocument,
    ),
    downloaded: local.size,
  };
}
