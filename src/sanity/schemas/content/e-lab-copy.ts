import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

/** The selection figures in the site settings, one per gate, in funnel order. */
const gateFigures = [
  { title: "Team applications", value: "applications" },
  { title: "Admitted to the cohort", value: "admitted" },
  { title: "Midterm Pitch", value: "midterm" },
  { title: "Selection Day", value: "selectionDay" },
  { title: "Final Pitch", value: "finalPitch" },
];

/** The gates must open on the applications and use each figure once. */
function validateStages(stages: unknown): true | string {
  if (!Array.isArray(stages)) return true;
  const figures = stages
    .filter((stage) => stage?._type === "gateStage")
    .map((stage) => stage.figure);
  if (stages[0]?._type !== "gateStage" || figures[0] !== "applications") {
    return "Start with the Team applications gate: every bar is drawn as a share of it.";
  }
  if (new Set(figures).size !== figures.length) {
    return "Each figure can be one gate only.";
  }
  return true;
}

/**
 * The /e-lab page's own copy (one document, `_id` `eLabCopy`): the hero and
 * the gates band, one cohort drawn to scale. The gates' figures come from
 * the site settings; the application state, the ventures and the voices are
 * their own content. Read by `features/e-lab/content.ts`, over the code
 * copy in `features/e-lab/data/copy.ts`.
 */
export const eLabCopyType = defineType({
  name: "eLabCopy",
  title: "E-Lab page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description:
            "The page's headline, beside the dot field: at most three lines.",
          max: 60,
          placeholders: true,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          description: "The program's terms in two or three sentences.",
          max: 320,
          rows: 4,
          placeholders: true,
        }),
      ],
    }),
    defineField({
      name: "gates",
      title: "The gates",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 240, rows: 2 }),
        copyString({
          name: "scaleLabel",
          title: "Scale label",
          description: "Beside the tick scale over the bars.",
          max: 20,
        }),
        defineField({
          name: "stages",
          title: "Gates and phases",
          type: "array",
          description:
            "One cohort in order: gates, where teams are selected (their team counts come from the site settings), and the phases between them.",
          of: [
            defineArrayMember({
              name: "gateStage",
              title: "Gate",
              type: "object",
              fields: [
                defineField({
                  name: "figure",
                  title: "Figure",
                  type: "string",
                  description: "Which selection figure the gate shows.",
                  options: { list: gateFigures },
                  validation: (Rule) => Rule.required(),
                }),
                copyString({ name: "name", title: "Name", max: 40 }),
                copyText({
                  name: "description",
                  title: "Description",
                  description: "What happens at the gate, in one sentence.",
                  max: 160,
                  rows: 2,
                }),
                defineField({
                  name: "approximate",
                  title: "Approximate",
                  type: "boolean",
                  description: "Shows the figure as about (~500).",
                  initialValue: false,
                }),
              ],
              preview: { select: { title: "name", subtitle: "figure" } },
            }),
            defineArrayMember({
              name: "phaseStage",
              title: "Phase",
              type: "object",
              fields: [
                defineField({
                  name: "key",
                  title: "Key",
                  type: "string",
                  description: "A stable id, lowercase (kickoff, phase-one).",
                  validation: (Rule) =>
                    Rule.required().regex(/^[a-z0-9-]+$/, { name: "key" }),
                }),
                copyString({ name: "name", title: "Name", max: 50 }),
                copyString({
                  name: "duration",
                  title: "Duration",
                  description: "As shown, like 4 weeks.",
                  max: 20,
                }),
                copyText({
                  name: "description",
                  title: "Description",
                  max: 240,
                  rows: 3,
                }),
                contentImageField({
                  name: "photo",
                  title: "Photo",
                  description:
                    "Optional: a real photo from this phase, at 3:2.",
                }),
                copyString({
                  name: "photoCaption",
                  title: "Photo caption",
                  description:
                    "What, where and when, factually. Only with a photo.",
                  max: 60,
                  required: false,
                }),
              ],
              preview: {
                select: { title: "name", subtitle: "duration", media: "photo" },
              },
            }),
          ],
          validation: (Rule) =>
            Rule.required()
              .min(2)
              .custom((stages) => validateStages(stages)),
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "E-Lab page" }) },
});
