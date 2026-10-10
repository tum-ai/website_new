import type { ContentImage } from "../../src/lib/cms-content-model";
import { type BackfillImage, backfillImage } from "./asset-ledger";

/**
 * Focused historical migration helpers (Node only): source
 * images and lists of inline objects in the form `sanity dataset import`
 * expects.
 */

/** A code `ContentImage` as an image field that uploads the shipped file. */
export function backfillContentImage(image: ContentImage): BackfillImage {
  return backfillImage(image.src, {
    alt: image.alt,
    objectPosition: image.objectPosition,
  });
}

/**
 * The items of an array field of inline objects, each with the `_type` the
 * schema names and a `_key` unique in the list (the Studio needs both to
 * edit the list). `keyOf` gives a key that survives reordering; without
 * one, the position is the key.
 */
export function keyedItems<T extends object>(
  type: string,
  items: readonly T[],
  keyOf: (item: T, index: number) => string = (_, index) => String(index),
): (T & { _key: string; _type: string })[] {
  return items.map((item, index) => ({
    _key: keyOf(item, index)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    _type: type,
    ...item,
  }));
}
