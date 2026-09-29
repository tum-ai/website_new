import { defineField } from "sanity";
import {
  contentTokenNames,
  unknownTokenNames,
} from "../../../lib/content-tokens";

/**
 * Shared field builders for the content workspace's schemas. Keep editor
 * help text here, so every type explains the same mechanisms the same way.
 */

const tokenList = contentTokenNames.map((name) => `{{${name}}}`).join(", ");

/**
 * Validation for text that may hold `{{name}}` placeholders for site facts
 * (`lib/content-tokens.ts`): an unknown name is an error, because the page
 * would drop that text and show the code copy instead.
 */
export function validatePlaceholders(value: unknown): true | string {
  if (typeof value !== "string") return true;
  const unknown = unknownTokenNames(value);
  return unknown.length === 0
    ? true
    : `Unknown placeholder ${unknown.map((name) => `{{${name}}}`).join(", ")}. Available: ${tokenList}.`;
}

/** Help text for fields that accept placeholders. */
export const placeholderHelp = `Placeholders in double braces are filled from the site config when the page renders, so dates and emails stay current. Keep them as they are. Available: ${tokenList}.`;

/**
 * An image with alt text and a hotspot, in the shape
 * `CONTENT_IMAGE_PROJECTION` (lib/cms-content-model.ts) reads.
 */
export function contentImageField(options: {
  name: string;
  title: string;
  description?: string;
  required?: boolean;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    description: options.description,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alternative text",
        type: "string",
        description:
          "What the image shows, for screen readers. Leave empty only for decorative images.",
      }),
    ],
    validation: options.required ? (Rule) => Rule.required() : undefined,
  });
}
