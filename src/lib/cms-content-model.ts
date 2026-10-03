/**
 * Shapes and pure helpers for page content that can come from code or from
 * the CMS (see `lib/cms-content.ts` and
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
  if (
    !image?.src ||
    !Number.isFinite(image.width) ||
    !Number.isFinite(image.height) ||
    !image.width ||
    !image.height ||
    image.width <= 0 ||
    image.height <= 0
  )
    return undefined;
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

/** Reader failure naming the invalid CMS document and field. */
export class ContentError extends Error {
  constructor(
    label: string,
    path: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(
      `[cms-content] ${label}${path ? `.${path}` : ""}: ${message}`,
      options,
    );
    this.name = "ContentError";
  }
}
/** Reject malformed required content at the reader boundary. */
export function contentError(
  label: string,
  path: string,
  message: string,
): never {
  throw new ContentError(label, path, message);
}
/** Required object, including singleton results. */
export function requireObject(
  value: unknown,
  label: string,
  path = "",
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return contentError(label, path, "required object is missing or malformed");
  return value as Record<string, unknown>;
}
/** Required nonblank text, preserving the editor's whitespace. */
export function requireString(
  value: unknown,
  label: string,
  path = "",
): string {
  if (typeof value !== "string" || value.trim() === "")
    return contentError(label, path, "required text is missing or blank");
  return value;
}
/** Optional text preserves intentional blanks. */
export function optionalString(
  value: unknown,
  label: string,
  path = "",
): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string")
    return contentError(label, path, "expected optional text");
  return value;
}
/** Required finite numeric fact. */
export function requireNumber(
  value: unknown,
  label: string,
  path = "",
): number {
  if (typeof value !== "number" || !Number.isFinite(value))
    return contentError(
      label,
      path,
      "required finite number is missing or malformed",
    );
  return value;
}
/** Required boolean, retaining false. */
export function requireBoolean(
  value: unknown,
  label: string,
  path = "",
): boolean {
  if (typeof value !== "boolean")
    return contentError(
      label,
      path,
      "required boolean is missing or malformed",
    );
  return value;
}
/** Required array, retaining explicit empty lists. */
export function requireArray(
  value: unknown,
  label: string,
  path = "",
): unknown[] {
  if (!Array.isArray(value))
    return contentError(label, path, "expected an array");
  return value;
}
/** Enumerated value, validated before narrowing. */
export function requireEnum<const T extends readonly string[]>(
  value: unknown,
  choices: T,
  label: string,
  path = "",
): T[number] {
  if (typeof value !== "string" || !choices.includes(value))
    return contentError(label, path, `expected one of ${choices.join(", ")}`);
  return value as T[number];
}
/** Explicit structural descriptor; no local content values serve as shapes. */
export type ContentParser<T> = (
  value: unknown,
  label: string,
  path: string,
) => T;
export const contentString: ContentParser<string> = requireString;
export const contentNumber: ContentParser<number> = requireNumber;
export const contentBoolean: ContentParser<boolean> = requireBoolean;
/** Text that may intentionally be blank, such as decorative image alt. */
export const contentText: ContentParser<string> = (value, label, path) => {
  if (typeof value !== "string")
    return contentError(label, path, "expected text");
  return value;
};
/** Optional field descriptor. */
export function contentOptional<T>(
  parser: ContentParser<T>,
): ContentParser<T | undefined> {
  return (value, label, path) =>
    value == null ? undefined : parser(value, label, path);
}
/** List descriptor validates each item with its indexed field path. */
export function contentArray<T>(parser: ContentParser<T>): ContentParser<T[]> {
  return (value, label, path) =>
    requireArray(value, label, path).map((item, index) =>
      parser(item, label, `${path}[${index}]`),
    );
}
/** Object descriptor validates each declared field and returns precisely that shape. */
export function contentObject<S extends Record<string, ContentParser<unknown>>>(
  shape: S,
): ContentParser<{ [K in keyof S]: ReturnType<S[K]> }> {
  return (value, label, path) => {
    const record = requireObject(value, label, path);
    return Object.fromEntries(
      Object.entries(shape).map(([key, parser]) => [
        key,
        parser(record[key], label, path ? `${path}.${key}` : key),
      ]),
    ) as { [K in keyof S]: ReturnType<S[K]> };
  };
}
/** Execute an explicit descriptor at a CMS boundary. */
export function parseContent<T>(
  value: unknown,
  parser: ContentParser<T>,
  label: string,
): T {
  return parser(value, label, "");
}

/** A complete normalized image after fillCmsCopy applies Sanity crop/hotspot. */
export const contentImage: ContentParser<ContentImage> = (
  value,
  label,
  path,
) => {
  const image = contentObject({
    src: contentString,
    width: contentNumber,
    height: contentNumber,
    alt: contentText,
    objectPosition: contentOptional(contentString),
  })(value, label, path);
  if (image.width <= 0 || image.height <= 0)
    return contentError(label, path, "image dimensions must be positive");
  return image;
};

/** Validate a present Sanity image projection before applying crop and hotspot. */
export const contentProjectedImage: ContentParser<ContentImage> = (
  value,
  label,
  path,
) => {
  const coordinate: ContentParser<number> = (value, label, path) => {
    const n = requireNumber(value, label, path);
    if (n < 0 || n > 1)
      return contentError(label, path, "expected fraction in 0..1");
    return n;
  };
  const image = contentObject({
    src: contentString,
    width: contentNumber,
    height: contentNumber,
    alt: contentOptional(contentText),
    hotspot: contentOptional(contentObject({ x: coordinate, y: coordinate })),
    crop: contentOptional(
      contentObject({
        top: coordinate,
        bottom: coordinate,
        left: coordinate,
        right: coordinate,
      }),
    ),
  })(value, label, path);
  if (
    image.crop &&
    (image.crop.top + image.crop.bottom >= 1 ||
      image.crop.left + image.crop.right >= 1)
  )
    return contentError(label, path, "crop must retain some image area");
  const parsed = toContentImage(image);
  if (!parsed)
    return contentError(
      label,
      path,
      "present image requires valid URL and positive dimensions",
    );
  return parsed;
};
