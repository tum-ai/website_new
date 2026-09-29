import {
  isEmptyContent,
  type ProjectedImage,
  toContentImage,
} from "./cms-content-model";
import {
  type ContentTokens,
  fillCodeTemplate,
  fillTemplate,
  unknownTokenNames,
} from "./content-tokens";

/**
 * Placeholder filling and cleanup for page copy: the `<page>Copy` singletons
 * and the copy lists (departments, task forces, ...) that the content slices
 * serve. Isomorphic and free of Next or Sanity runtime imports, so data
 * files (the code fallbacks) and slices share it.
 *
 * Code copy is written as templates with `{{placeholders}}`
 * (`lib/content-tokens.ts`) and filled once per render; CMS copy is the same
 * template text, filled by {@link fillCmsCopy} before it is merged over the
 * code fallback (`mergeOverFallback`).
 */

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * `copy` with every string filled by `fillCodeTemplate`, deeply (objects and
 * lists keep their shape). For code fallbacks, which a developer controls:
 * an unknown placeholder throws.
 */
export function fillCodeCopy<T>(copy: T, tokens: ContentTokens): T {
  if (typeof copy === "string") return fillCodeTemplate(copy, tokens) as T;
  if (Array.isArray(copy)) {
    return copy.map((item) => fillCodeCopy(item, tokens)) as T;
  }
  if (isPlainObject(copy)) {
    return Object.fromEntries(
      Object.entries(copy).map(([key, value]) => [
        key,
        fillCodeCopy(value, tokens),
      ]),
    ) as T;
  }
  return copy;
}

/** A value {@link fillCmsCopy} drops because it holds an unknown placeholder. */
const rejected = Symbol("rejected");

/**
 * An image as `CONTENT_IMAGE_PROJECTION` projects it: `src`, `width`,
 * `height` and `hotspot` are always present (possibly `null`).
 */
const isProjectedImage = (value: PlainObject) =>
  "src" in value && "width" in value && "height" in value && "hotspot" in value;

function clean(value: unknown, tokens: ContentTokens, label: string): unknown {
  if (typeof value === "string") {
    const filled = fillTemplate(value, tokens);
    if (filled === null) {
      console.warn(
        `[cms-content] Skipping text in ${label}: unknown placeholder ${unknownTokenNames(value).join(", ")}.`,
      );
      return rejected;
    }
    return filled;
  }
  if (Array.isArray(value)) {
    // A list item with a broken placeholder is dropped as a whole: a list
    // replaces the code list wholesale, so a half item would render as is.
    return value
      .map((item) => clean(item, tokens, label))
      .filter((item) => item !== rejected && !isEmptyContent(item));
  }
  if (isPlainObject(value)) {
    if (isProjectedImage(value)) {
      return toContentImage(value as ProjectedImage) ?? null;
    }
    const entries: [string, unknown][] = [];
    for (const [key, field] of Object.entries(value)) {
      const cleaned = clean(field, tokens, label);
      if (cleaned === rejected) return rejected;
      if (!isEmptyContent(cleaned)) entries.push([key, cleaned]);
    }
    return entries.length > 0 ? Object.fromEntries(entries) : null;
  }
  return value;
}

/**
 * A copy query result, ready for `mergeOverFallback`:
 *
 * - strings are filled with `fillTemplate`;
 * - unset values (`null`, blank strings, empty lists and objects) are left
 *   out, so the code value shows and optional fields stay absent, as in code;
 * - projected images become `ContentImage`s (`toContentImage`);
 * - text with an unknown placeholder is dropped (and logged): a field then
 *   shows the code copy; an object or list item that holds it is dropped as a
 *   whole, so no half-filled item reaches the page.
 *
 * `label` names the content in the log line.
 */
export function fillCmsCopy(
  value: unknown,
  tokens: ContentTokens,
  label: string,
): unknown {
  if (!isPlainObject(value) || isProjectedImage(value)) {
    const cleaned = clean(value, tokens, label);
    return cleaned === rejected ? null : cleaned;
  }
  // Outside lists (a singleton and its groups of fields), a broken field
  // falls back on its own instead of taking its neighbours with it.
  const entries: [string, unknown][] = [];
  for (const [key, field] of Object.entries(value)) {
    const cleaned = fillCmsCopy(field, tokens, label);
    if (cleaned !== rejected && !isEmptyContent(cleaned)) {
      entries.push([key, cleaned]);
    }
  }
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}
