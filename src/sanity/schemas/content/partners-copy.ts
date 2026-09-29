import { defineField, defineType } from "sanity";
import { placeholderHelp, validatePlaceholders } from "./fields";
import { photoField } from "./image-rules";

const text = (name: string, title: string, description?: string, max = 80) =>
  defineField({
    name,
    title,
    type: "string",
    description,
    validation: (Rule) => Rule.max(max),
  });

const templateText = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "text",
    rows: 3,
    description: `${description} ${placeholderHelp}`,
    validation: (Rule) => Rule.custom((value) => validatePlaceholders(value)),
  });

/** One answer of the finder's first question ("What matters most?"). */
const intentField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      text("label", "Answer", "The option as the finder lists it."),
      text(
        "shortLabel",
        "Short label",
        "Used in the email subject: “Partnership request: …”.",
        40,
      ),
      text("detail", "Detail", "One line under the answer."),
    ],
  });

/** One answer of the finder's second question (the timeframe). */
const durationField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      text("label", "Answer", "The option as the finder lists it."),
      text("detail", "Detail", "One line under the answer."),
    ],
  });

/** A format the finder recommends. */
const recommendationField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      text(
        "name",
        "Format name",
        "Also written into the email and booking notes.",
      ),
      defineField({
        name: "description",
        title: "Description",
        type: "text",
        rows: 5,
        validation: (Rule) => Rule.max(700),
      }),
    ],
  });

/**
 * The /partners copy that is not a document of its own: the finder's
 * answers and recommendations, the reasons, the proof figures and the three
 * pillars, plus the one-sentence partner pitch other pages' closings quote.
 * A singleton; a field left empty shows the code copy. The finder's answers
 * and formats are fixed (the recommendation logic maps them), so only their
 * wording is editable. Read by `features/partners/content.ts`.
 */
export const partnersCopyType = defineType({
  name: "partnersCopy",
  title: "Partners page copy",
  type: "document",
  description:
    "Copy for /partners: the finder, reasons, figures and pillars. Empty fields show the built-in copy.",
  groups: [
    { name: "finder", title: "Finder", default: true },
    { name: "sections", title: "Sections" },
  ],
  fields: [
    defineField({
      name: "pitch",
      title: "Partner pitch",
      type: "string",
      group: "sections",
      description:
        "How partners meet the members, in one sentence. The closing bands of /apply, /community and /qanda quote it.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "intents",
      title: "Goals (first question)",
      type: "object",
      group: "finder",
      fields: [
        intentField("talent", "Hiring"),
        intentField("hackathon", "Hackathon"),
        intentField("brand", "Brand"),
        intentField("research", "Research"),
      ],
    }),
    defineField({
      name: "durations",
      title: "Timeframes (second question)",
      type: "object",
      group: "finder",
      fields: [
        durationField("oneOff", "One-off"),
        durationField("ongoing", "Ongoing"),
      ],
    }),
    defineField({
      name: "recommendations",
      title: "Recommended formats",
      type: "object",
      group: "finder",
      description:
        "Research goals get the research format; any other ongoing goal the long-term partnership; a one-off goal its own format.",
      fields: [
        recommendationField("longTerm", "Long-term partnership"),
        recommendationField("hackathon", "Hackathon"),
        recommendationField("talent", "Talent"),
        recommendationField("brand", "Community and brand"),
        recommendationField("research", "Research"),
      ],
    }),
    defineField({
      name: "reasons",
      title: "Reasons to partner",
      type: "array",
      group: "sections",
      description:
        "The three cards under “Your next advantage is already here.”",
      of: [
        {
          type: "object",
          name: "reason",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "People", value: "users" },
                  { title: "Briefcase", value: "briefcase" },
                  { title: "Network", value: "network" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              validation: (Rule) => Rule.required(),
            }),
            text("name", "Label", "Beside the icon: “Talent”.", 30),
            text("title", "Title"),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.max(300),
            }),
          ],
          preview: { select: { title: "title", subtitle: "name" } },
        },
      ],
    }),
    defineField({
      name: "stats",
      title: "Proof figures",
      type: "array",
      group: "sections",
      description:
        "The figures on violet (“Small acceptance rate. Outsized potential.”). Figures that are site facts stay placeholders, so they follow the site settings.",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              title: "Figure",
              type: "string",
              description: `Counts up on the page: “2100+”, “2.3%”. ${placeholderHelp}`,
              validation: (Rule) =>
                Rule.required().custom((value) => validatePlaceholders(value)),
            }),
            text("label", "Label"),
            defineField({
              name: "detail",
              title: "Detail",
              type: "string",
              description: `Optional line under the label. ${placeholderHelp}`,
              validation: (Rule) =>
                Rule.custom((value) => validatePlaceholders(value)),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "pillars",
      title: "Pillars",
      type: "array",
      group: "sections",
      description:
        "The three linked cards under “Three pillars. One ecosystem.” Each card's figure is a site fact, chosen by its pillar.",
      of: [
        {
          type: "object",
          name: "pillar",
          fields: [
            defineField({
              name: "key",
              title: "Pillar",
              type: "string",
              description:
                "Picks the figure: publications, venture funding or hackathon participants.",
              options: {
                list: [
                  { title: "Research", value: "research" },
                  { title: "Venture (E-Lab)", value: "venture" },
                  { title: "Hackathons", value: "hackathons" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              validation: (Rule) => Rule.required(),
            }),
            text("title", "Title", undefined, 40),
            text(
              "metricLabel",
              "Figure label",
              "Beside the figure: “Publications”.",
              30,
            ),
            templateText(
              "description",
              "Description",
              "Two or three sentences.",
            ),
            photoField({ name: "image", title: "Photo" }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "The page the card links to: “/research”.",
              validation: (Rule) =>
                Rule.regex(/^\/[a-z0-9/#-]*$/, { name: "site path" }),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "key", media: "image" },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Partners page copy" }) },
});
