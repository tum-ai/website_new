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

/**
 * The gates must use each figure exactly once, in funnel order (applications,
 * admitted, midterm, selectionDay, finalPitch): the page draws every gate as
 * a share of the one before, the hero's field needs decreasing counts and
 * lights the last gate's teams as the Final Pitch, and it renders the code
 * cohort instead of a list with a gate missing, doubled or out of order
 * (`selectStages` in features/e-lab/content.ts). Phases may sit anywhere
 * between them. Exported for tests.
 */
export function validateStages(stages: unknown): true | string {
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
  const missing = gateFigures.filter(({ value }) => !figures.includes(value));
  if (missing.length > 0) {
    return `Add a gate for ${missing.map(({ title }) => title).join(", ")}: the page needs all five.`;
  }
  if (figures.some((figure, index) => figure !== gateFigures[index]?.value)) {
    return `Put the gates in funnel order: ${gateFigures.map(({ title }) => title).join(", ")}.`;
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
    defineField({
      name: "field",
      title: "Dot field",
      type: "object",
      description: "The hero's field of team applications.",
      fields: [
        copyText({
          name: "caption",
          title: "Caption",
          max: 240,
          rows: 3,
          pageTokens: {
            finalists: "the dots still lit (the Final Pitch figure)",
            ventures: "how many of them open into alumni ventures",
            open: "how many are left for new teams",
          },
        }),
        copyString({
          name: "inviteLabel",
          title: "Open place label",
          description:
            "On a lit dot without a venture, before the cohort's name (E-Lab 6.0).",
          max: 20,
        }),
      ],
    }),
    defineField({
      name: "ventures",
      title: "Traced venture",
      type: "object",
      description:
        "The traced venture band's headings; the venture, its trail and the other ventures are their own content.",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({
          name: "fundingNote",
          title: "Funding note",
          description:
            "Beside the funding figure (site settings), over the other ventures' logos. Starts in lower case.",
          max: 120,
          rows: 2,
          placeholders: true,
        }),
        copyString({
          name: "logosLabel",
          title: "Logos label",
          description: "The ventures' logo wall, read by screen readers.",
          max: 60,
        }),
      ],
    }),
    defineField({
      name: "voices",
      title: "Voices",
      type: "object",
      description:
        "The testimonials band's headings; the quotes are E-Lab testimonials (People).",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        copyString({
          name: "foundersLabel",
          title: "Founders column",
          max: 30,
        }),
        copyString({
          name: "investorsLabel",
          title: "Investors column",
          max: 30,
        }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description:
        "The ink band at the end; its round status follows the E-Lab application window.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          max: 90,
          pageTokens: {
            applications: "the team applications of a round (site settings)",
          },
        }),
        copyString({
          name: "followLabel",
          title: "Button while closed",
          description:
            "Leads to TUM.ai on LinkedIn while applications are closed.",
          max: 40,
        }),
        copyString({
          name: "partnersReader",
          title: "Label for partners",
          max: 40,
        }),
        copyText({
          name: "partnersText",
          title: "Text for partners",
          max: 160,
          rows: 2,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "E-Lab page" }) },
});
