import {
  type CustomValidator,
  defineArrayMember,
  defineField,
  type StringRule,
} from "sanity";
import { placeholderHelp, validatePlaceholders } from "./fields";

/**
 * Field builders for page copy (the `<page>Copy` singletons and the copy
 * lists), so every text field states its limit and placeholder rules the
 * same way.
 */

type CopyFieldOptions = {
  name: string;
  title: string;
  /** What the text is for and where it shows, for editors. */
  description?: string;
  /**
   * Maximum length in characters. Pick it from the layout: how many lines
   * the text may take at its type size before the design breaks.
   */
  max: number;
  /** Required unless `false`; an empty optional field shows the code copy. */
  required?: boolean;
  /** Allows `{{placeholders}}` for site facts, validated by name. */
  placeholders?: boolean;
  /**
   * Placeholders only this text accepts, which the page fills itself (see
   * `fillPageTokens` in `lib/content-copy.ts`): name and what it becomes.
   */
  pageTokens?: Readonly<Record<string, string>>;
  /** A further check of the text, an error when it fails. */
  validate?: CustomValidator<string | undefined>;
};

const help = (
  description: string | undefined,
  limit: string,
  { placeholders, pageTokens }: CopyFieldOptions,
) =>
  [
    description,
    limit,
    pageTokens &&
      Object.entries(pageTokens)
        .map(([name, meaning]) => `{{${name}}} becomes ${meaning}.`)
        .join(" "),
    placeholders ? placeholderHelp : undefined,
  ]
    .filter(Boolean)
    .join(" ");

/** Placeholder validation that also accepts the field's page tokens. */
function validateCopy(value: unknown, pageTokens: readonly string[]) {
  if (typeof value !== "string" || pageTokens.length === 0) {
    return validatePlaceholders(value);
  }
  return validatePlaceholders(
    value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name: string) =>
      pageTokens.includes(name) ? "" : match,
    ),
  );
}

function textRule(Rule: StringRule, options: CopyFieldOptions) {
  const { max, required, placeholders, pageTokens = {}, validate } = options;
  const limited = (required === false ? Rule : Rule.required()).max(max);
  const names = Object.keys(pageTokens);
  // Without `placeholders`, page tokens are still validated (an unknown
  // name would reach the page as raw braces).
  const rule =
    placeholders || names.length > 0
      ? limited.custom((value) => validateCopy(value, names))
      : limited;
  return validate ? [rule, Rule.custom(validate)] : rule;
}

/** A single line of copy: a title, a label, a short lead. */
export function copyString(options: CopyFieldOptions) {
  return defineField({
    name: options.name,
    title: options.title,
    type: "string",
    description: help(
      options.description,
      `At most ${options.max} characters.`,
      options,
    ),
    validation: (Rule) => textRule(Rule, options),
  });
}

/** A paragraph of plain text. */
export function copyText(options: CopyFieldOptions & { rows?: number }) {
  return defineField({
    name: options.name,
    title: options.title,
    type: "text",
    rows: options.rows ?? 3,
    description: help(
      options.description,
      `At most ${options.max} characters.`,
      options,
    ),
    validation: (Rule) => textRule(Rule, options),
  });
}

/** A list of short lines (points, items), each within `max` characters. */
export function copyStringList(
  options: CopyFieldOptions & { minItems?: number; maxItems?: number },
) {
  return defineField({
    name: options.name,
    title: options.title,
    type: "array",
    of: [
      defineArrayMember({
        type: "string",
        validation: (Rule) => textRule(Rule, { ...options, required: true }),
      }),
    ],
    description: help(
      options.description,
      `Each at most ${options.max} characters.`,
      options,
    ),
    validation: (Rule) => {
      let rule = options.required === false ? Rule : Rule.required();
      if (options.minItems !== undefined) rule = rule.min(options.minItems);
      if (options.maxItems !== undefined) rule = rule.max(options.maxItems);
      return rule;
    },
  });
}

/** The position of a document in its page list, ascending. */
export function orderField() {
  return defineField({
    name: "order",
    title: "Order",
    type: "number",
    description:
      "Position on the page, ascending. Leave gaps (10, 20, 30) to insert entries later.",
    validation: (Rule) => Rule.required().integer(),
  });
}
