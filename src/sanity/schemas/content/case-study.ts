import { defineField, defineType } from "sanity";
import { photoField } from "./image-rules";

/**
 * A partner case on /partners ("Real partnerships. Real outcomes.") and a
 * row of the homepage's partner ledger: one measured outcome per
 * partnership. Read by `features/partners/content.ts`.
 */
export const caseStudyType = defineType({
  name: "caseStudy",
  title: "Partner case study",
  type: "document",
  description:
    "One partnership outcome: a figure, a quote and a photo. Shown on /partners and as a row on the homepage.",
  fields: [
    defineField({
      name: "organization",
      title: "Partner",
      type: "reference",
      to: [{ type: "organization" }],
      description: "Its name heads the card.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Position on the page, ascending (10, 20, 30).",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "metric",
      title: "Figure",
      type: "string",
      description:
        "The outcome as a number with a short unit: “75%”, “48h”, “20+”. It counts up on the page, so keep it short.",
      validation: (Rule) => Rule.required().max(8),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "What the figure measures, one line under it.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "string",
      description: "The outcome in a few words, for the homepage ledger.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "copy",
      title: "Story",
      type: "text",
      rows: 3,
      description:
        "Two or three sentences, or the partner's quote in quote marks.",
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description:
        "Who said it, when the story is a quote: “Manuel, Head of Innovation, BMW Group”. Optional.",
      validation: (Rule) => Rule.max(80),
    }),
    photoField({
      name: "image",
      title: "Photo",
      description:
        "A photo from the partnership, shown at the top of the card.",
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "organization.name",
      metric: "metric",
      label: "label",
      media: "image",
    },
    prepare: ({ title, metric, label, media }) => ({
      title: title ?? "Case study",
      subtitle: [metric, label].filter(Boolean).join(" · "),
      media,
    }),
  },
});
