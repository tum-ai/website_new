import { isAbsolute, join, relative, sep } from "node:path";

/**
 * Helpers for the backfill builders: each content slice turns its code
 * fallback into Sanity documents (`build<X>Backfill()`), which
 * `pnpm sanity:backfill` writes as NDJSON for `sanity dataset import`, and
 * which the mock CMS evaluates with the real GROQ queries (parity tests).
 *
 * Node only (it resolves files under `public/`): import it from slices and
 * scripts, never from client components.
 */

/** A document as `sanity dataset import` reads it. */
export type BackfillDocument = {
  /** Deterministic, from {@link backfillId}, so a re-import replaces it. */
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
 * Base the parts on something that survives copy edits (a key or an anchor
 * id) where one exists; the text itself works for lists without keys, at
 * the cost of a new document when that text changes in code before launch.
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
