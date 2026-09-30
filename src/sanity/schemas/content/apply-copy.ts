import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

/** A list of named points (title and one or two sentences). */
function points(options: {
  name: string;
  title: string;
  description: string;
  titleMax: number;
  min: number;
  max: number;
}) {
  return defineField({
    name: options.name,
    title: options.title,
    type: "array",
    description: options.description,
    of: [
      defineArrayMember({
        name: "point",
        title: "Point",
        type: "object",
        fields: [
          copyString({ name: "title", title: "Title", max: options.titleMax }),
          copyText({
            name: "text",
            title: "Text",
            max: 200,
            rows: 2,
            placeholders: true,
          }),
        ],
        preview: { select: { title: "title", subtitle: "text" } },
      }),
    ],
    validation: (Rule) => Rule.required().min(options.min).max(options.max),
  });
}

/** Where a selection stage's date comes from (the membership round). */
const stageTimings = [
  { title: "Until the deadline", value: "deadline" },
  { title: "After the deadline", value: "after-deadline" },
  { title: "The interview dates", value: "interviews" },
  { title: "The onboarding dates", value: "onboarding" },
];

/**
 * The /apply page's own copy (one document, `_id` `applyCopy`). The FAQ,
 * the milestones and the member journey are documents of their own; the
 * round's dates and state come from the membership round. Read by
 * `features/apply/content.ts`, over the code copy in
 * `features/apply/data/apply.ts`.
 */
export const applyCopyType = defineType({
  name: "applyCopy",
  title: "Apply page",
  type: "document",
  fields: [
    copyString({
      name: "heroTitle",
      title: "Hero title",
      description:
        "The page's headline, above the call's status (which follows the membership round).",
      max: 40,
    }),
    copyText({
      name: "heroLead",
      title: "Hero lead",
      description: "The hero's second paragraph, under the call's status.",
      max: 200,
      rows: 2,
      placeholders: true,
    }),
    copyString({
      name: "faqLabel",
      title: "FAQ button",
      description: "The hero's second button, beside “Apply now”.",
      max: 30,
    }),
    copyString({
      name: "datesTitle",
      title: "Dates heading",
      description: "Over the round's important dates.",
      max: 60,
      pageTokens: {
        round: "the round's name in lower case (winter semester 2026/27)",
      },
    }),
    defineField({
      name: "scope",
      title: "Who should apply",
      type: "object",
      description:
        "The call's scope; its lead is the site's brand mission (site settings).",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyString({
          name: "inScopeTitle",
          title: "In scope heading",
          max: 30,
        }),
        copyString({
          name: "notRequiredTitle",
          title: "Not required heading",
          max: 30,
        }),
        copyString({ name: "valuesTitle", title: "Values heading", max: 40 }),
        points({
          name: "qualities",
          title: "In scope",
          description: "What we look for, the titles set large.",
          titleMax: 30,
          min: 2,
          max: 6,
        }),
        points({
          name: "notRequired",
          title: "Not required",
          description: "What an applicant doesn't need.",
          titleMax: 40,
          min: 1,
          max: 4,
        }),
        points({
          name: "values",
          title: "Values",
          description:
            "How members work together, one sentence each (four columns on wide screens).",
          titleMax: 40,
          min: 2,
          max: 4,
        }),
        contentImageField({
          name: "photo",
          title: "Photo",
          description: "A wide batch photo at the end of the section.",
          required: true,
        }),
      ],
    }),
    defineField({
      name: "tracks",
      title: "What you'll work on",
      type: "object",
      description:
        "The member journey's two tracks come from the Member journey steps.",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        copyString({
          name: "offeringsTitle",
          title: "Offerings heading",
          max: 50,
        }),
        points({
          name: "offerings",
          title: "Offerings",
          description:
            "What every member can join besides their track (three columns).",
          titleMax: 30,
          min: 1,
          max: 3,
        }),
        contentImageField({
          name: "photo",
          title: "Photo",
          description: "A wide event photo under the offerings.",
          required: true,
        }),
        copyString({
          name: "journeyLink",
          title: "Journey link",
          description: "The link to the full member journey on /community.",
          max: 60,
        }),
      ],
    }),
    defineField({
      name: "selection",
      title: "How selection works",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 160,
          rows: 2,
          pageTokens: {
            count: "the number of stages, as a capitalized word (Four)",
          },
        }),
        defineField({
          name: "stages",
          title: "Stages",
          type: "array",
          description: "The round's stages in order, numbered on the page.",
          of: [
            defineArrayMember({
              name: "selectionStage",
              title: "Stage",
              type: "object",
              fields: [
                copyString({ name: "title", title: "Title", max: 30 }),
                defineField({
                  name: "when",
                  title: "Date",
                  type: "string",
                  description: "Filled in from the membership round.",
                  options: { list: stageTimings },
                  validation: (Rule) => Rule.required(),
                }),
                copyText({
                  name: "text",
                  title: "Text",
                  max: 240,
                  rows: 3,
                  placeholders: true,
                }),
              ],
              preview: { select: { title: "title", subtitle: "when" } },
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(6),
        }),
      ],
    }),
    defineField({
      name: "history",
      title: "Since the founding",
      type: "object",
      description:
        "The milestone grid's heading; the entries are Milestone documents.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          max: 30,
          placeholders: true,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 200,
          rows: 2,
          pageTokens: {
            count: "the number of milestones, in digits",
            years: "the number of years the grid spans, in digits",
          },
        }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description:
        "The submission box at the end; its statement and dates follow the membership round.",
      fields: [
        copyString({
          name: "companiesReader",
          title: "Label for companies",
          description:
            "Over the partners' pitch beside the box (the pitch is edited on the partners page).",
          max: 30,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Apply page" }) },
});
