import { defineField, defineType } from "sanity";
import { anchorIdPattern, reservedQandaIds } from "../../../lib/page-anchors";
import { sanityApiVersion } from "../../../lib/sanity-config";
import {
  placeholderHelp,
  validatePlaceholders,
  validateSiteOrHttpsLink,
} from "./fields";
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
 * What is wrong with a Q&A entry's anchor id, without asking the dataset:
 * missing, malformed, or an id the layout or /qanda already renders
 * (`reservedQandaIds`). Entries of other pages need none.
 */
export function anchorProblem(
  value: unknown,
  collection: unknown,
): true | string {
  if (collection !== "qanda") return true;
  if (typeof value !== "string" || value === "") {
    return "The Q&A page needs an anchor id for every entry.";
  }
  if (!anchorIdPattern.test(value)) {
    return "Use lowercase letters, digits and hyphens.";
  }
  if (reservedQandaIds.includes(value)) {
    return `The page itself uses the id “${value}”; pick another anchor id.`;
  }
  return true;
}

/** Other Q&A entries (drafts included) that use `anchor`. */
const ANCHOR_TAKEN_QUERY = `count(*[_type == "faq" && collection == "qanda" && anchor == $anchor && !(_id in [$id, $draft])])`;

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
      // The anchor is the question's element id and link target on /qanda,
      // so it must be unique there; the page also drops a duplicate.
      validation: (Rule) =>
        Rule.custom(async (value, { document, getClient }) => {
          const problem = anchorProblem(value, document?.collection);
          if (problem !== true || document?.collection !== "qanda") {
            return problem;
          }
          const id = document._id.replace(/^drafts\./, "");
          const taken = await getClient({
            apiVersion: sanityApiVersion,
          }).fetch<number>(ANCHOR_TAKEN_QUERY, {
            anchor: value,
            id,
            draft: `drafts.${id}`,
          });
          return taken > 0
            ? "Another Q&A entry already uses this anchor id."
            : true;
        }),
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
        defineField({
          name: "href",
          title: "Link",
          type: "string",
          description:
            "A page of this site (/research) or an https:// address.",
          validation: (Rule) =>
            Rule.custom((value) => validateSiteOrHttpsLink(value)),
        }),
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
