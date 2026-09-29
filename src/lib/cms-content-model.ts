/**
 * Shapes and pure helpers for page content that can come from code or from
 * the content dataset (see `lib/cms-content.ts` and
 * docs/adr/0009-cms-content-source.md). Isomorphic and free of Next or
 * Sanity runtime imports, so client components may import the types and
 * tests need no mocks.
 */

/**
 * An image as pages receive it, from either source: a local `/assets/...`
 * path in code, or the Sanity CDN URL of an uploaded asset. `width` and
 * `height` are the file's intrinsic size (Sanity reports exactly that), so
 * next/image can reserve the space; how large it renders is the
 * component's choice (`sizes`, classes). Serialisable, so it can be passed
 * to client islands as is.
 */
export type ContentImage = {
  src: string;
  width: number;
  height: number;
  /** Alternative text; `""` marks a decorative image. */
  alt: string;
  /** CSS `object-position` as `"<x>% <y>%"`, from the Studio hotspot. */
  objectPosition?: string;
};

/**
 * GROQ projection of an `image` field into the fields {@link toContentImage}
 * reads. Use it after the field name, and let TypeGen type the result:
 *
 * ```ts
 * defineQuery(`*[_type == "organization"]{ name, "logo": logo${CONTENT_IMAGE_PROJECTION} }`)
 * ```
 *
 * The schema field needs an `alt` string subfield and `options.hotspot`
 * (which also gives editors the crop tool; {@link toContentImage} applies
 * the crop).
 */
export const CONTENT_IMAGE_PROJECTION = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt,
  "hotspot": hotspot{ x, y },
  "crop": crop{ top, bottom, left, right }
}`;

/** The result of {@link CONTENT_IMAGE_PROJECTION}, as TypeGen types it. */
export type ProjectedImage =
  | {
      src: string | null;
      width: number | null;
      height: number | null;
      alt?: string | null;
      hotspot?: { x: number | null; y: number | null } | null;
      crop?: {
        top: number | null;
        bottom: number | null;
        left: number | null;
        right: number | null;
      } | null;
    }
  | null
  | undefined;

const percent = (fraction: number) => `${Number((fraction * 100).toFixed(2))}%`;

const fraction = (value: number | null | undefined) =>
  typeof value === "number" && value > 0 && value < 1 ? value : 0;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The Studio crop as a pixel rectangle of the file, or `null` when nothing
 * is cropped (or the crop leaves no area). Rounded like Sanity's image URL
 * builder does it.
 */
function cropRect(
  crop: NonNullable<ProjectedImage>["crop"],
  width: number,
  height: number,
) {
  const left = Math.round(fraction(crop?.left) * width);
  const top = Math.round(fraction(crop?.top) * height);
  const cropWidth = Math.round(width - fraction(crop?.right) * width - left);
  const cropHeight = Math.round(height - fraction(crop?.bottom) * height - top);
  if (cropWidth <= 0 || cropHeight <= 0) return null;
  if (left === 0 && top === 0 && cropWidth === width && cropHeight === height) {
    return null;
  }
  return { left, top, width: cropWidth, height: cropHeight };
}

/**
 * A projected image as a {@link ContentImage}, or `undefined` when the field
 * is empty or its asset has no URL or size yet (the merge then keeps the
 * code image).
 *
 * - The Studio **crop** is applied through the CDN (`rect=` on the image
 *   URL), and `width`/`height` become the cropped size, so the page shows
 *   what the editor cropped to.
 * - The **hotspot** becomes `objectPosition`, measured within the cropped
 *   image (Sanity stores it relative to the whole file).
 */
export function toContentImage(
  image: ProjectedImage,
): ContentImage | undefined {
  if (!image?.src || !image.width || !image.height) return undefined;
  const rect = cropRect(image.crop, image.width, image.height);
  const src = rect
    ? `${image.src}${image.src.includes("?") ? "&" : "?"}rect=${rect.left},${rect.top},${rect.width},${rect.height}`
    : image.src;
  const result: ContentImage = {
    src,
    width: rect?.width ?? image.width,
    height: rect?.height ?? image.height,
    alt: image.alt ?? "",
  };
  const { x, y } = image.hotspot ?? {};
  if (typeof x === "number" && typeof y === "number") {
    const relative = (
      at: number,
      offset: number,
      size: number,
      full: number,
    ) => (rect ? clamp01((at * full - offset) / size) : at);
    result.objectPosition = `${percent(
      relative(x, rect?.left ?? 0, rect?.width ?? 1, image.width),
    )} ${percent(relative(y, rect?.top ?? 0, rect?.height ?? 1, image.height))}`;
  }
  return result;
}

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const isContentImage = (value: unknown): value is ContentImage =>
  isPlainObject(value) && typeof value.src === "string" && value.src !== "";

/**
 * A group of fields that belong together, marked by a slice's `select` so
 * {@link mergeOverFallback} takes it whole: the fetched group replaces the
 * code group, optional fields included, instead of being merged field by
 * field. For groups whose fields describe one thing (a quote and who said
 * it, a venture and what it does now): mixed with the code group, the CMS
 * quote would be attributed to the code person. `select` returns
 * `whole(group)` only when the group is complete, otherwise leaves it out,
 * so the code group shows as a whole.
 *
 * The marker never reaches a page: the merge unwraps it. Use it where the
 * fallback has an object (a singleton or a group), not inside lists, which
 * replace the fallback wholesale anyway.
 */
export class Whole<T> {
  constructor(readonly value: T) {}
}

/** Marks `group` to replace the fallback group as a whole; see {@link Whole}. */
export function whole<T>(group: T): Whole<T> {
  return new Whole(group);
}

/** `null`, `undefined`, a blank string and an empty list count as "not set". */
export function isEmptyContent(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * The fetched CMS value laid over the code fallback, so a missing, empty or
 * malformed field never breaks a page:
 *
 * - **Not set** (`null`, `undefined`, blank string, empty list): the fallback.
 * - **Lists** replace the fallback wholesale when non-empty. Items are not
 *   merged one by one: an editor's list is the list (shape each item in the
 *   slice's `select` before merging).
 * - **Plain objects** (singletons, groups of fields) merge field by field,
 *   recursively. A fetched field that is not in the fallback is added when
 *   it is set. Consequence: the CMS cannot clear a field that code fills;
 *   remove it from the code fallback instead.
 * - **Images** (objects with a non-empty `src`, see {@link ContentImage})
 *   are atomic: a fetched image replaces the fallback image as a whole, so
 *   the code `alt` or position never mixes with an uploaded file.
 * - **Whole groups** (`whole(group)` from the slice's `select`, see
 *   {@link Whole}) replace the fallback as they are, never mixed with it.
 * - **Primitives** (strings, numbers, booleans; `false` and `0` count as
 *   set): the fetched value when its type matches the fallback's, otherwise
 *   the fallback.
 */
export function mergeOverFallback<T>(fallback: T, fetched: unknown): T {
  if (fetched instanceof Whole) return fetched.value as T;
  if (isEmptyContent(fetched)) return fallback;

  if (Array.isArray(fallback)) {
    return (Array.isArray(fetched) ? fetched : fallback) as T;
  }

  if (isPlainObject(fallback)) {
    if (!isPlainObject(fetched)) return fallback;
    if (isContentImage(fallback)) {
      return (isContentImage(fetched) ? fetched : fallback) as T;
    }
    const merged: PlainObject = { ...fallback };
    for (const [key, value] of Object.entries(fetched)) {
      if (key in fallback) {
        merged[key] = mergeOverFallback(fallback[key], value);
      } else if (value instanceof Whole) {
        merged[key] = value.value;
      } else if (!isEmptyContent(value)) {
        merged[key] = value;
      }
    }
    return merged as T;
  }

  if (fallback === null || fallback === undefined) return fetched as T;
  return (typeof fetched === typeof fallback ? fetched : fallback) as T;
}
