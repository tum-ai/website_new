import { defineArrayMember, defineField, defineType } from "sanity";
import {
  durationUnits,
  formatDuration,
  isDuration,
} from "../../../lib/program-duration";
import { copyString, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

/** The selection figures in the site settings, one per gate, in funnel order. */
const gateFigures = [
  { title: "Team applications", value: "applications" },
  { title: "Admitted to the cohort", value: "admitted" },
  { title: "Selection Day and Midterm Pitch", value: "midterm" },
  { title: "Final Pitch", value: "finalPitch" },
];

/** The ways in for partners of the program (`eLabInvolveKeys`), each with its icon. */
const involveKeys = [
  { title: "Join the jury", value: "jury" },
  { title: "Deliver a keynote", value: "keynote" },
  { title: "Host a workshop", value: "workshop" },
  { title: "Another idea", value: "other" },
];

/**
 * The gates must use each figure exactly once, in funnel order (applications,
 * admitted, midterm, finalPitch): the page draws every gate as
 * a share of the one before, the hero's field needs decreasing counts and
 * lights the last gate's teams as the Final Pitch, and rejects a list
 * with a gate missing, doubled or out of order
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
    return `Add a gate for ${missing.map(({ title }) => title).join(", ")}: the page needs all four.`;
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
 * their own content. Read and validated by `features/e-lab/content.ts`.
 */
export const eLabCopyType = defineType({
  name: "eLabCopy",
  title: "ELAB page",
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
                defineField({
                  name: "atLeast",
                  title: "At least",
                  type: "boolean",
                  description: "Shows the figure as a floor (500+).",
                  initialValue: false,
                }),
                defineField({
                  name: "photos",
                  title: "Photos",
                  type: "array",
                  description:
                    "Optional: one or two real photos from this gate, such as the pitch on stage, at 3:2.",
                  of: [
                    defineArrayMember({
                      name: "gatePhoto",
                      title: "Photo",
                      type: "object",
                      fields: [
                        contentImageField({
                          name: "image",
                          title: "Image",
                          required: true,
                        }),
                        copyString({
                          name: "caption",
                          title: "Caption",
                          description: "What, where and when, factually.",
                          max: 60,
                          required: false,
                        }),
                      ],
                      preview: {
                        select: { title: "caption", media: "image" },
                      },
                    }),
                  ],
                  validation: (Rule) => Rule.max(2),
                }),
              ],
              preview: {
                select: {
                  title: "name",
                  subtitle: "figure",
                  media: "photos.0.image",
                },
              },
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
                defineField({
                  name: "duration",
                  title: "Duration",
                  type: "object",
                  description:
                    "How long the phase runs; the page shows it as “4 weeks”. The phases together are the program length every page states (“12 weeks”), rounded to whole weeks.",
                  options: { columns: 2 },
                  fields: [
                    defineField({
                      name: "amount",
                      title: "Amount",
                      type: "number",
                      validation: (Rule) => Rule.required().integer().min(1),
                    }),
                    defineField({
                      name: "unit",
                      title: "Unit",
                      type: "string",
                      options: {
                        list: durationUnits.map((unit) => ({
                          title: unit,
                          value: unit,
                        })),
                        layout: "radio",
                        direction: "horizontal",
                      },
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  validation: (Rule) => Rule.required(),
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
                select: { title: "name", duration: "duration", media: "photo" },
                prepare: ({ title, duration, media }) => ({
                  title,
                  subtitle: isDuration(duration)
                    ? formatDuration(duration)
                    : undefined,
                  media,
                }),
              },
            }),
          ],
          validation: (Rule) => [
            Rule.required()
              .min(2)
              .custom((stages) => validateStages(stages)),
          ],
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
            "On a lit dot without a venture, before the cohort's name (ELAB FALL ’26).",
          max: 20,
        }),
      ],
    }),
    defineField({
      name: "ventures",
      title: "Traced venture and founders",
      type: "object",
      description:
        "The traced venture band: its headings and the founders of past batches. The traced venture and its trail are their own content.",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({
          name: "fundingNote",
          title: "Funding note",
          description:
            "Beside the funding figure (site settings), over the founders table. Starts in lower case.",
          max: 120,
          rows: 2,
          placeholders: true,
        }),
        copyString({
          name: "foundersTitle",
          title: "Founders title",
          description: "Over the founders table.",
          max: 50,
        }),
        defineField({
          name: "founders",
          title: "Founders from past batches",
          type: "array",
          description:
            "One row per alumni venture, in order. The figures are as the venture reported them.",
          of: [
            defineArrayMember({
              name: "founderRow",
              title: "Venture",
              type: "object",
              fields: [
                defineField({
                  name: "venture",
                  title: "Venture",
                  type: "reference",
                  to: [{ type: "organization" }],
                  description: "Its name and website.",
                  validation: (Rule) => Rule.required(),
                }),
                copyString({
                  name: "edition",
                  title: "Cohort",
                  description: "Only when confirmed, for example ELAB 4.0.",
                  max: 20,
                  required: false,
                }),
                copyString({
                  name: "summary",
                  title: "What it does",
                  max: 120,
                }),
                defineField({
                  name: "metrics",
                  title: "Figures",
                  type: "array",
                  description: "Up to four, such as $2.2M over pre-seed.",
                  of: [
                    defineArrayMember({
                      name: "founderMetric",
                      title: "Figure",
                      type: "object",
                      options: { columns: 2 },
                      fields: [
                        copyString({ name: "value", title: "Value", max: 24 }),
                        copyString({ name: "label", title: "Label", max: 32 }),
                      ],
                      preview: {
                        select: { title: "value", subtitle: "label" },
                      },
                    }),
                  ],
                  validation: (Rule) => Rule.required().min(1).max(4),
                }),
                defineField({
                  name: "backedBy",
                  title: "Backed by",
                  type: "object",
                  description:
                    "Optional: the lead backer and a note on the round.",
                  fields: [
                    copyString({
                      name: "name",
                      title: "Backer",
                      description: "For example Y Combinator F26.",
                      max: 40,
                    }),
                    copyString({
                      name: "note",
                      title: "Note",
                      description: "For example Round led by Vireo Ventures.",
                      max: 90,
                      required: false,
                    }),
                  ],
                }),
              ],
              preview: {
                select: { title: "venture.name", subtitle: "edition" },
              },
            }),
          ],
          validation: (Rule) => Rule.required().unique(),
        }),
      ],
    }),
    defineField({
      name: "partners",
      title: "Partners",
      type: "object",
      description:
        "The partners band. Its logos are the three ELAB logo lists (iteration, workshop and past partners).",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        copyString({
          name: "iterationLabel",
          title: "Iteration partners label",
          max: 40,
        }),
        copyString({
          name: "workshopLabel",
          title: "Workshop partners label",
          max: 40,
        }),
        copyString({
          name: "pastLabel",
          title: "Past partners label",
          max: 40,
        }),
      ],
    }),
    defineField({
      name: "involve",
      title: "Get involved",
      type: "object",
      description:
        "Ways for companies and investors to take part. Each card opens a mail to the Venture team (site settings).",
      fields: [
        copyString({ name: "eyebrow", title: "Eyebrow", max: 30 }),
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        defineField({
          name: "options",
          title: "Ways in",
          type: "array",
          of: [
            defineArrayMember({
              name: "involveOption",
              title: "Way in",
              type: "object",
              fields: [
                defineField({
                  name: "key",
                  title: "Kind",
                  type: "string",
                  description: "Sets the card's icon.",
                  options: { list: involveKeys },
                  validation: (Rule) => Rule.required(),
                }),
                copyString({ name: "title", title: "Title", max: 40 }),
                copyText({
                  name: "detail",
                  title: "Detail",
                  max: 200,
                  rows: 3,
                }),
              ],
              preview: { select: { title: "title", subtitle: "key" } },
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(4),
        }),
      ],
    }),
    defineField({
      name: "voices",
      title: "Voices",
      type: "object",
      description:
        "The testimonials band's headings; the quotes are ELAB testimonials (People).",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        ...["founders", "investors"].map((name) =>
          defineField({
            name,
            title: name === "founders" ? "Founder quotes" : "Investor quotes",
            type: "array",
            of: [
              defineArrayMember({
                type: "reference",
                to: [{ type: "person" }],
                options: { filter: 'placement == "e-lab-testimonial"' },
              }),
            ],
            validation: (Rule) => Rule.unique(),
          }),
        ),
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
        "The ink band at the end; its round status follows the ELAB application window.",
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
  preview: { prepare: () => ({ title: "ELAB page" }) },
});
