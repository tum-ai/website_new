import { contentError, contentProjectedImage } from "./cms-content-model";
import {
  type ContentTokens,
  templateTokenNames,
  unknownTokenNames,
} from "./content-tokens";

/** Fill CMS placeholders per render and normalize image projections without changing
 * optional blanks or dropping list entries. Page tokens declared in `keep` remain
 * available for the renderer to insert text or an element.
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
  tokens: Partial<ContentTokens>,
  keep: readonly string[],
): string | null {
  const unresolved = templateTokenNames(template).filter(
    (name) =>
      !keep.includes(name) &&
      typeof tokens[name as keyof ContentTokens] !== "string",
  );
  if (unresolved.length) return null;
  return template.replace(placeholder, (match, name: string) =>
    keep.includes(name)
      ? match
      : (tokens[name as keyof ContentTokens] ?? match),
  );
}

/**
 * `copy` with every string's placeholders filled, deeply (objects and lists
 * keep their shape), except the page tokens in `keep`. An unknown placeholder throws.
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

/**
 * `template` split around each `{{name}}` page token, with whitespace inside
 * the braces allowed as the Studio allows it (`{{ format }}`): the text
 * before, between and after the tokens, so a page can put an element where a
 * token was. Other placeholders stay text; without the token, `[template]`.
 */
export function splitAtPageToken(template: string, name: string): string[] {
  const parts: string[] = [];
  let start = 0;
  for (const match of template.matchAll(placeholder)) {
    if (match[1] !== name) continue;
    parts.push(template.slice(start, match.index));
    start = match.index + match[0].length;
  }
  parts.push(template.slice(start));
  return parts;
}

/** Fill CMS text without dropping fields, blank values, or list items. */
export function fillCmsCopy(
  value: unknown,
  tokens: Partial<ContentTokens>,
  label: string,
  keep: readonly string[] = [],
): unknown {
  function visit(value: unknown, path: string): unknown {
    if (typeof value === "string") {
      const filled = fill(value, tokens, keep);
      if (filled === null)
        return contentError(
          label,
          path,
          `unknown placeholder ${templateTokenNames(value)
            .filter(
              (name) =>
                !keep.includes(name) &&
                typeof tokens[name as keyof ContentTokens] !== "string",
            )
            .join(", ")}`,
        );
      return filled;
    }
    if (Array.isArray(value))
      return value.map((item, index) => visit(item, `${path}[${index}]`));
    if (isPlainObject(value)) {
      if (
        "src" in value &&
        "width" in value &&
        "height" in value &&
        "hotspot" in value
      ) {
        return contentProjectedImage(value, label, path);
      }
      return Object.fromEntries(
        Object.entries(value).map(([key, field]) => [
          key,
          visit(field, path ? `${path}.${key}` : key),
        ]),
      );
    }
    return value;
  }
  return visit(value, "");
}
