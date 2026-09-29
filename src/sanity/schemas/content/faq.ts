import { defineField, defineType } from "sanity";
import { placeholderHelp, validatePlaceholders } from "./fields";
import { validateEntrySpans } from "./qanda-spans";

/** The pages a FAQ entry can appear on. */
export const faqCollections = [
  { title: "Apply (/apply)", value: "apply" },
  { title: "E-Lab (/e-lab)", value: "e-lab" },
  { title: "Q&A (/qanda)", value: "qanda" },
] as const;

/** Hides the Q&A-only fields on entries of other pages. */
const unlessQanda = ({ document }: { document?: Record<string, unknown> }) =>
  document?.collection !== "qanda";

/**
 * One question and answer on a page's FAQ. A page shows the entries of its
 * `collection`, sorted by `order`; `lib/faq-content.ts` reads them and falls
 * back to the code list when the collection is empty.
 *
 * Answers are plain text (the page renders them as one paragraph) with
 * `{{placeholders}}` for site facts. The Q&A-only fields (anchor, points,
 * mission spans, evidence) mirror `QandaEntry` in
 * `features/qanda/data/qanda.ts`, read by `features/qanda/content.ts`.
 */
export const faqType = defineType({
  name: "faq",
  title: "FAQ entry",
  type: "document",
  fields: [
    defineField({
      name: "collection",
      title: "Page",
      type: "string",
      options: { list: [...faqCollections], layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Position on the page, ascending. Leave gaps (10, 20, 30) to insert entries later.",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 5,
      description: `One paragraph of plain text. ${placeholderHelp}`,
      validation: (Rule) =>
        Rule.required().custom((value) => validatePlaceholders(value)),
    }),
    defineField({
      name: "anchor",
      title: "Anchor id",
      type: "string",
      description:
        "Q&A only: the link target, as in /qanda#<anchor>. Lowercase letters, digits and hyphens.",
      hidden: unlessQanda,
      validation: (Rule) =>
        Rule.regex(/^[a-z0-9-]+$/, { name: "anchor id" }).custom(
          (value, { document }) =>
            document?.collection === "qanda" && !value
              ? "The Q&A page needs an anchor id for every entry."
              : true,
        ),
    }),
    defineField({
      name: "points",
      title: "Points",
      type: "array",
      of: [
        {
          type: "string",
          validation: (Rule) =>
            Rule.custom((value) => validatePlaceholders(value)),
        },
      ],
      description: `Q&A only: points listed after the answer's first sentence. ${placeholderHelp}`,
      hidden: unlessQanda,
    }),
    defineField({
      name: "spans",
      title: "Mission phrases",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Q&A only: the words of the Q&A page's mission passage that answer the question, quoted exactly; the page marks them while the question is open. Each must occur once in the passage and must not overlap another entry's phrase. Leave empty when the passage doesn't answer the question: the page then links to it under the passage.",
      hidden: unlessQanda,
      validation: (Rule) => Rule.custom(validateEntrySpans),
    }),
    defineField({
      name: "evidence",
      title: "Evidence",
      type: "object",
      description:
        "Q&A only: a fact that shows the answer, and where to see it.",
      hidden: unlessQanda,
      fields: [
        defineField({
          name: "text",
          title: "Text",
          type: "string",
          description: placeholderHelp,
          validation: (Rule) =>
            Rule.custom((value) => validatePlaceholders(value)),
        }),
        defineField({ name: "label", title: "Link label", type: "string" }),
        defineField({ name: "href", title: "Link", type: "string" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Page, then order",
      name: "collectionOrder",
      by: [
        { field: "collection", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "question", collection: "collection", order: "order" },
    prepare: ({ title, collection, order }) => ({
      title,
      subtitle: [collection, order]
        .filter((part) => part !== undefined)
        .join(" · "),
    }),
  },
});
