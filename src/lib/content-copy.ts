import {
  isEmptyContent,
  type ProjectedImage,
  toContentImage,
} from "./cms-content-model";
import {
  type ContentTokens,
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
 *
 * **Page tokens.** A few templates state a figure only the page knows, such
 * as how many task forces it lists (`{{count}}`). Those names are passed as
 * `keep`: filling leaves them in place, and the page fills them with
 * {@link fillPageTokens} once it has the content. The Studio accepts them
 * only on the fields that declare them (`copy-fields.ts`).
 */

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const placeholder = /\{\{\s*([\w.-]+)\s*\}\}/g;

/** `fillTemplate`, leaving the page tokens in `keep` as they are. */
function fill(
  template: string,
  tokens: ContentTokens,
  keep: readonly string[],
): string | null {
  if (keep.length === 0) return fillTemplate(template, tokens);
  const unknown = unknownTokenNames(template).filter(
    (name) => !keep.includes(name),
  );
  if (unknown.length > 0) return null;
  return template.replace(placeholder, (match, name: string) =>
    keep.includes(name) ? match : tokens[name as keyof ContentTokens],
  );
}

/**
 * `copy` with every string's placeholders filled, deeply (objects and lists
 * keep their shape), except the page tokens in `keep`. For code fallbacks,
 * which a developer controls: an unknown placeholder throws.
 */
export function fillCodeCopy<T>(
  copy: T,
  tokens: ContentTokens,
  keep: readonly string[] = [],
): T {
  if (typeof copy === "string") {
    const filled = fill(copy, tokens, keep);
    if (filled === null) {
      throw new Error(
        `Unknown content token(s) ${unknownTokenNames(copy).join(", ")} in "${copy}"; add them to lib/content-tokens.ts`,
      );
    }
    return filled as T;
  }
  if (Array.isArray(copy)) {
    return copy.map((item) => fillCodeCopy(item, tokens, keep)) as T;
  }
  if (isPlainObject(copy)) {
    return Object.fromEntries(
      Object.entries(copy).map(([key, value]) => [
        key,
        fillCodeCopy(value, tokens, keep),
      ]),
    ) as T;
  }
  return copy;
}

/**
 * `template` with the page tokens in `values` filled (`{{count}}` becomes
 * `values.count`); other text stays as it is.
 */
export function fillPageTokens(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(placeholder, (match, name: string) =>
    Object.hasOwn(values, name) ? values[name] : match,
  );
}

/** A value {@link fillCmsCopy} drops because it holds an unknown placeholder. */
const rejected = Symbol("rejected");

/**
 * An image as `CONTENT_IMAGE_PROJECTION` projects it: `src`, `width`,
 * `height` and `hotspot` are always present (possibly `null`).
 */
const isProjectedImage = (value: PlainObject) =>
  "src" in value && "width" in value && "height" in value && "hotspot" in value;

function clean(
  value: unknown,
  tokens: ContentTokens,
  label: string,
  keep: readonly string[],
): unknown {
  if (typeof value === "string") {
    const filled = fill(value, tokens, keep);
    if (filled === null) {
      console.warn(
        `[cms-content] Skipping text in ${label}: unknown placeholder ${unknownTokenNames(
          value,
        )
          .filter((name) => !keep.includes(name))
          .join(", ")}.`,
      );
      return rejected;
    }
    return filled;
  }
  if (Array.isArray(value)) {
    // A list item with a broken placeholder is dropped as a whole: a list
    // replaces the code list wholesale, so a half item would render as is.
    return value
      .map((item) => clean(item, tokens, label, keep))
      .filter((item) => item !== rejected && !isEmptyContent(item));
  }
  if (isPlainObject(value)) {
    if (isProjectedImage(value)) {
      return toContentImage(value as ProjectedImage) ?? null;
    }
    const entries: [string, unknown][] = [];
    for (const [key, field] of Object.entries(value)) {
      const cleaned = clean(field, tokens, label, keep);
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
 * `label` names the content in the log line; `keep` lists the page tokens
 * to leave for {@link fillPageTokens}.
 */
export function fillCmsCopy(
  value: unknown,
  tokens: ContentTokens,
  label: string,
  keep: readonly string[] = [],
): unknown {
  if (!isPlainObject(value) || isProjectedImage(value)) {
    const cleaned = clean(value, tokens, label, keep);
    return cleaned === rejected ? null : cleaned;
  }
  // Outside lists (a singleton and its groups of fields), a broken field
  // falls back on its own instead of taking its neighbours with it.
  const entries: [string, unknown][] = [];
  for (const [key, field] of Object.entries(value)) {
    const cleaned = fillCmsCopy(field, tokens, label, keep);
    if (cleaned !== rejected && !isEmptyContent(cleaned)) {
      entries.push([key, cleaned]);
    }
  }
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}
