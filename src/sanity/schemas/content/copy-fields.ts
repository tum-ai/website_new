import { defineArrayMember, defineField, type StringRule } from "sanity";
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
};

const help = (
  description: string | undefined,
  limit: string,
  placeholders: boolean | undefined,
) =>
  [description, limit, placeholders ? placeholderHelp : undefined]
    .filter(Boolean)
    .join(" ");

function textRule(
  Rule: StringRule,
  { max, required, placeholders }: CopyFieldOptions,
) {
  const limited = (required === false ? Rule : Rule.required()).max(max);
  return placeholders
    ? limited.custom((value) => validatePlaceholders(value))
    : limited;
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
      options.placeholders,
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
      options.placeholders,
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
      options.placeholders,
    ),
    validation: (Rule) => {
      let rule = options.required === false ? Rule : Rule.required();
      if (options.minItems !== undefined) rule = rule.min(options.minItems);
      if (options.maxItems !== undefined) rule = rule.max(options.maxItems);
      return rule;
    },
  });
}
