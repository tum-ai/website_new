import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { evaluate, parse } from "groq-js";
import {
  assetFileOf,
  type BackfillDocument,
  publicPathOf,
} from "./cms-backfill";

/**
 * The page content under the mock CMS (`USE_MOCK_CMS=1` with
 * `CMS_CONTENT_SOURCE=sanity`): the slices' backfill documents, queried with
 * the real GROQ through groq-js. So unit, E2E and visual runs are
 * deterministic, and a parity test proves that a query plus its mapping
 * rebuilds exactly the code fallback from the documents the backfill would
 * import.
 *
 * `lib/cms-content.ts` loads this module with a dynamic `import()` behind
 * the mock gate (like `lib/mock-cms.ts`), so a normal build contains neither
 * it nor groq-js, which is a devDependency.
 */

type Json = unknown;

type ImageAssetDocument = {
  _id: string;
  _type: "sanity.imageAsset";
  url: string;
  path: string;
  extension: string;
  metadata: {
    _type: "sanity.imageMetadata";
    dimensions: {
      _type: "sanity.imageDimensions";
      width: number;
      height: number;
      aspectRatio: number;
    };
  };
};

/**
 * The intrinsic size of a PNG, JPEG, WebP or SVG file, read from its header
 * (the formats under `public/assets`). SVG sizes come from `width` and
 * `height`, else the `viewBox`, rounded like Sanity's metadata.
 */
export function readImageSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(file);
  const extension = extname(file).toLowerCase();
  const size =
    extension === ".svg"
      ? svgSize(bytes.toString("utf8"))
      : extension === ".png"
        ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
        : extension === ".webp"
          ? webpSize(bytes)
          : extension === ".jpg" || extension === ".jpeg"
            ? jpegSize(bytes)
            : null;
  if (!size || !(size.width > 0 && size.height > 0)) {
    throw new Error(`Cannot read the image size of ${file}`);
  }
  return size;
}

function svgSize(source: string) {
  const root = /<svg\b[^>]*>/i.exec(source)?.[0] ?? "";
  const attribute = (name: string) =>
    new RegExp(`\\s${name}=["']\\s*([\\d.]+)(?:px)?\\s*["']`).exec(root)?.[1];
  const width = attribute("width");
  const height = attribute("height");
  if (width && height) {
    return { width: Math.round(+width), height: Math.round(+height) };
  }
  const viewBox = /\sviewBox=["']([^"']+)["']/
    .exec(root)?.[1]
    ?.trim()
    .split(/[\s,]+/);
  if (viewBox?.length !== 4) return null;
  return { width: Math.round(+viewBox[2]), height: Math.round(+viewBox[3]) };
}

function webpSize(bytes: Buffer) {
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }
  return null;
}

function jpegSize(bytes: Buffer) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    // Start-of-frame markers (C0 to CF, except DHT C4, JPG C8 and DAC CC).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function imageAssetOf(file: string): ImageAssetDocument {
  const { width, height } = readImageSize(file);
  const url = publicPathOf(file);
  const extension = extname(file).slice(1).toLowerCase();
  const hash = createHash("sha1").update(url).digest("hex");
  return {
    _id: `image-${hash}-${width}x${height}-${extension}`,
    _type: "sanity.imageAsset",
    url,
    path: url.slice(1),
    extension,
    metadata: {
      _type: "sanity.imageMetadata",
      dimensions: {
        _type: "sanity.imageDimensions",
        width,
        height,
        aspectRatio: width / height,
      },
    },
  };
}

/**
 * The documents as Sanity holds them after `sanity dataset import`: each
 * `_sanityAsset` image becomes a reference to a `sanity.imageAsset`
 * document whose `url` is the shipped `/assets/...` path, so code and mock
 * render the same file with the same size.
 */
export function toMockDataset(documents: readonly BackfillDocument[]): Json[] {
  const assets = new Map<string, ImageAssetDocument>();

  const resolve = (value: Json): Json => {
    if (Array.isArray(value)) return value.map(resolve);
    if (typeof value !== "object" || value === null) return value;
    const { _sanityAsset, ...rest } = value as Record<string, Json>;
    const fields = Object.fromEntries(
      Object.entries(rest).map(([key, field]) => [key, resolve(field)]),
    );
    if (typeof _sanityAsset !== "string") return fields;
    const file = assetFileOf(_sanityAsset);
    if (!file) throw new Error(`Unsupported _sanityAsset "${_sanityAsset}"`);
    const asset = assets.get(file) ?? imageAssetOf(file);
    assets.set(file, asset);
    return { ...fields, asset: { _type: "reference", _ref: asset._id } };
  };

  const resolved = documents.map(resolve);
  return [...resolved, ...assets.values()];
}

/** `query` with `params`, evaluated over the mock dataset of `documents`. */
export async function evaluateMockQuery<T>(
  query: string,
  params: Record<string, unknown>,
  documents: readonly BackfillDocument[],
): Promise<T> {
  const tree = parse(query, { params });
  const result = await evaluate(tree, {
    dataset: toMockDataset(documents),
    params,
  });
  return (await result.get()) as T;
}
