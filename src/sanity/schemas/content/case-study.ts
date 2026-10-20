import { defineField, defineType } from "sanity";
import { photoField } from "./image-rules";

/**
 * A warning when neither the summary nor the story mentions the figure's
 * number. The three fields state one outcome for three places (the card's
 * counter, the homepage ledger, the card's story), and a figure changed
 * without its words leaves the page with two different numbers. Figures
 * without digits pass. Exported for tests.
 */
export function metricProblem(
  metric: unknown,
  { summary, copy }: Record<string, unknown>,
): true | string {
  const number = typeof metric === "string" && /\d+(?:[.,]\d+)?/.exec(metric);
  if (!number) return true;
  const digits = number[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mentions = new RegExp(`(?<![\\d.,])${digits}(?![\\d])`);
  const texts = [summary, copy].filter(
    (text): text is string => typeof text === "string",
  );
  if (texts.length === 0 || texts.some((text) => mentions.test(text))) {
    return true;
  }
  return `Neither the summary nor the story mentions ${number[0]}. They describe the same outcome: when the figure changes, update them too.`;
}

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
        "The outcome as a number with a short unit: “75%”, “48h”, “20+”. It counts up on the card and leads the homepage ledger row, so keep it short. The summary and the story describe the same outcome in words: change them together.",
      validation: (Rule) => [
        Rule.required().max(8),
        Rule.custom((metric, { document }) =>
          metricProblem(metric, document ?? {}),
        ).warning(),
      ],
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
      description:
        "The outcome in a few words, beside the figure in the homepage ledger (“3 of 4 project members hired full-time”). The figure already shows there, so add what it means rather than repeating it.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "copy",
      title: "Story",
      type: "text",
      rows: 3,
      description:
        "The story behind the figure on the /partners card: two or three sentences, or the partner's quote in quote marks.",
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description:
        "Who said it, when the story is a quote, as they sign: “Manuel, Head of Innovation, BMW Group”. Written out whole, since the company part can differ from the organisation's name (“BMW”). Optional.",
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
