import { isAbsolute, join, relative, sep } from "node:path";

/** Node-only migration import and pending-asset ledger helpers. Runtime readers never import these. */

/** A document as `sanity dataset import` reads it. */
export type BackfillDocument = {
  /**
   * Deterministic, from {@link backfillId}, so a re-import finds the same
   * document (and skips it, unless the import overwrites).
   */
  _id: string;
  _type: string;
  [field: string]: unknown;
};

/**
 * An image field before import: `_sanityAsset` points at a local file, and
 * `sanity dataset import` uploads it and swaps in the asset reference.
 */
export type BackfillImage = {
  _type: "image";
  _sanityAsset: string;
  alt?: string;
  hotspot?: {
    _type: "sanity.imageHotspot";
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const maxIdLength = 128;

const slug = (part: string | number) =>
  String(part)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * A stable document id: `type` and the parts, slugged and joined with `-`
 * (`backfillId("faq", "apply", "Do I need …?")` is
 * `faq-apply-do-i-need-…`). Only `[a-z0-9-]`: a `.` would put the document
 * in a private path that published queries never return, and `drafts.` is
 * the draft prefix.
 *
 * Base the parts on an explicit key in the code data (a FAQ `id`, a
 * milestone or department `key`, a person's `key`), never on its visible
 * text: an id that follows the wording turns a copy edit in code into a
 * second document next to the imported one.
 */
export function backfillId(
  type: string,
  ...parts: (string | number)[]
): string {
  const id = [type, ...parts].map(slug).filter(Boolean).join("-");
  if (!id) throw new Error("backfillId needs a type");
  return id.slice(0, maxIdLength).replace(/-+$/, "");
}

/** The `public/` folder the site serves `/assets/...` from. */
export const publicDir = join(process.cwd(), "public");

const assetPrefix = "image@file://";

/**
 * An image field that uploads a shipped file on import. `src` is the path
 * the site uses (`/assets/...`); `objectPosition` (`"<x>% <y>%"`) becomes
 * the Studio hotspot, which `toContentImage` turns back into the same
 * string.
 */
export function backfillImage(
  src: string,
  options: { alt?: string; objectPosition?: string } = {},
): BackfillImage {
  if (!src.startsWith("/assets/")) {
    throw new Error(`backfillImage takes a /assets/ path, got "${src}"`);
  }
  const image: BackfillImage = {
    _type: "image",
    _sanityAsset: `${assetPrefix}${join(publicDir, src)}`,
  };
  if (options.alt !== undefined) image.alt = options.alt;
  if (options.objectPosition !== undefined) {
    const match = /^(\d+(?:\.\d+)?)% (\d+(?:\.\d+)?)%$/.exec(
      options.objectPosition,
    );
    if (!match) {
      throw new Error(
        `objectPosition must be "<x>% <y>%" to become a hotspot, got "${options.objectPosition}"`,
      );
    }
    image.hotspot = {
      _type: "sanity.imageHotspot",
      x: Number(match[1]) / 100,
      y: Number(match[2]) / 100,
      width: 1,
      height: 1,
    };
  }
  return image;
}

/** The absolute file of a `_sanityAsset` value, or `null` for anything else. */
export function assetFileOf(sanityAsset: string): string | null {
  if (!sanityAsset.startsWith(assetPrefix)) return null;
  const file = sanityAsset.slice(assetPrefix.length);
  return isAbsolute(file) ? file : null;
}

/** An image a backfill document uploads: where it goes and which file. */
export type PlannedAsset = {
  /** Patch path of the image, e.g. `hero` or `items[_key=="ada"].portrait`. */
  path: string;
  /** The `_sanityAsset` the import uploads there. */
  sanityAsset: string;
};

/**
 * An image upload an `--apply` import on this machine started and nobody has
 * seen finish: `sanity dataset import` creates each document before it
 * uploads the document's images, so a failed upload (or an import that
 * stopped) leaves `{_type: "image"}` with no `asset`, and a re-run with
 * `--missing` skips the document. The backfill keeps these in a ledger
 * (`.sanity-backfill/<dataset>.pending-assets.json`) because the dataset
 * alone cannot tell such an image from one an editor removed: the Studio's
 * Remove also drops only `asset` and keeps `alt`.
 */
export type PendingAsset = PlannedAsset & {
  /** The published document's `_id`. */
  documentId: string;
  /**
   * The published document has its file; only its draft still lacks it
   * (the draft's repair failed after the published one succeeded).
   */
  draftOnly?: true;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Every image `planned` (a backfill document) uploads, with its patch path.
 * List items are addressed by `_key`, or by position when they have none.
 */
export function plannedAssets(planned: unknown, path = ""): PlannedAsset[] {
  if (Array.isArray(planned)) {
    return planned.flatMap((item, index) => {
      const key = isRecord(item) ? item._key : undefined;
      return plannedAssets(
        item,
        typeof key === "string"
          ? `${path}[_key=="${key}"]`
          : `${path}[${index}]`,
      );
    });
  }
  if (!isRecord(planned)) return [];
  if (typeof planned._sanityAsset === "string") {
    return [{ path, sanityAsset: planned._sanityAsset }];
  }
  return Object.entries(planned).flatMap(([key, value]) =>
    key.startsWith("_")
      ? []
      : plannedAssets(value, path ? `${path}.${key}` : key),
  );
}

/**
 * The ledger an `--apply` import starts from: the `previous` entries (still
 * unconfirmed, their file refreshed from the plan when it still has that
 * image) plus every image of each planned document the import is about to
 * create, which is every planned document with `overwrite` (`--replace`
 * recreates them all) and otherwise those not among `existingIds`
 * (`--missing` skips the rest). One entry per document and path.
 */
export function pendingAssetsBeforeImport(
  documents: readonly BackfillDocument[],
  options: {
    existingIds: ReadonlySet<string>;
    previous: readonly PendingAsset[];
    overwrite: boolean;
  },
): PendingAsset[] {
  const planned = new Map(
    documents.map((document) => [document._id, plannedAssets(document)]),
  );
  const entries = new Map<string, PendingAsset>();
  const add = (entry: PendingAsset) =>
    entries.set(`${entry.documentId}\n${entry.path}`, entry);
  for (const entry of options.previous) {
    const current = planned
      .get(entry.documentId)
      ?.find(({ path }) => path === entry.path);
    add(current ? { ...entry, sanityAsset: current.sanityAsset } : entry);
  }
  for (const [documentId, assets] of planned) {
    if (!options.overwrite && options.existingIds.has(documentId)) continue;
    for (const asset of assets) add({ documentId, ...asset });
  }
  return [...entries.values()];
}

/** The value at a patch path from {@link plannedAssets}, if there is one. */
function valueAt(document: unknown, path: string): unknown {
  const segment = /(?:^|\.)([^.[\]]+)|\[_key=="([^"]*)"\]|\[(\d+)\]/y;
  let value = document;
  while (segment.lastIndex < path.length) {
    const match = segment.exec(path);
    if (!match) throw new Error(`Unsupported image path "${path}"`);
    const [, field, key, index] = match;
    if (field !== undefined) {
      value = isRecord(value) ? value[field] : undefined;
    } else if (!Array.isArray(value)) {
      value = undefined;
    } else if (key !== undefined) {
      value = value.find((item) => isRecord(item) && item._key === key);
    } else {
      value = value[Number(index)];
    }
  }
  return value;
}

const isUnattached = (document: unknown, path: string) => {
  const image = valueAt(document, path);
  return isRecord(image) && !image.asset;
};

/**
 * Which ledger entries still need their file, given the dataset's `stored`
 * published documents and drafts. An entry is `open` while its published
 * document holds the image without `asset`; the repair then sets it there
 * and on the draft if the draft lacks it too. A `draftOnly` entry is `open`
 * while the draft holds the image without `asset`, and repairs only the
 * draft. Every other entry is settled: the import (or an earlier repair)
 * attached it, or the image or document is gone. An image without `asset`
 * that is not in `pending` is an editor's removal and never appears here.
 */
export function findUnattachedAssets<Stored extends { _id: string }>(
  pending: readonly PendingAsset[],
  stored: readonly Stored[],
): {
  open: PendingAsset[];
  repairs: { document: Stored; assets: PendingAsset[] }[];
} {
  const byId = new Map(stored.map((document) => [document._id, document]));
  const repairs = new Map<Stored, PendingAsset[]>();
  const open = pending.filter((entry) => {
    const published = byId.get(entry.documentId);
    const draft = byId.get(`drafts.${entry.documentId}`);
    const targets = entry.draftOnly ? [draft] : [published, draft];
    if (!isUnattached(targets[0], entry.path)) return false;
    for (const document of targets) {
      if (document && isUnattached(document, entry.path)) {
        repairs.set(document, [...(repairs.get(document) ?? []), entry]);
      }
    }
    return true;
  });
  return {
    open,
    repairs: [...repairs].map(([document, assets]) => ({ document, assets })),
  };
}

/**
 * The ledger after a repair: the `open` entries of a document (published or
 * draft) whose repair failed, so the next run retries them. An entry whose
 * published repair succeeded and whose draft's failed becomes `draftOnly`:
 * the published image now has its file, so only the draft is retried.
 */
export function settlePendingAssets(
  open: readonly PendingAsset[],
  failedIds: ReadonlySet<string>,
): PendingAsset[] {
  return open.flatMap((entry): PendingAsset[] => {
    if (failedIds.has(entry.documentId)) return [entry];
    if (failedIds.has(`drafts.${entry.documentId}`)) {
      return [{ ...entry, draftOnly: true }];
    }
    return [];
  });
}

/** The `/assets/...` path the site serves `file` under. */
export function publicPathOf(file: string): string {
  return `/${relative(publicDir, file).split(sep).join("/")}`;
}

/** Every `_sanityAsset` value in `documents`, deduplicated, in order. */
export function collectSanityAssets(documents: readonly unknown[]): string[] {
  const assets = new Set<string>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (typeof value === "object" && value !== null) {
      for (const [key, field] of Object.entries(value)) {
        if (key === "_sanityAsset" && typeof field === "string") {
          assets.add(field);
        } else {
          visit(field);
        }
      }
    }
  };
  visit(documents);
  return [...assets];
}
