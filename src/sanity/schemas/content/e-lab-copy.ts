import {
  defineArrayMember,
  defineField,
  defineType,
  type ValidationContext,
} from "sanity";
import {
  durationInWeeks,
  durationUnits,
  formatDuration,
  isDuration,
} from "../../../lib/program-duration";
import { sanityApiVersion } from "../../../lib/sanity-config";
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
 * How far the phases may add up away from the program length, in weeks:
 * the gates between them (a pitch day) take a few days of their own.
 */
const PROGRAM_WEEKS_TOLERANCE = 1;

/**
 * Whether the phases fill the program: their durations add up to
 * `programWeeks` (the site settings) within {@link PROGRAM_WEEKS_TOLERANCE}.
 * The page states both, the program length in its headline and each
 * phase's duration, so a gap reads as a contradiction. A warning, not an
 * error: the facts may legitimately be in review. Exported for tests.
 */
export function phaseWeeksProblem(
  stages: unknown,
  programWeeks: unknown,
): true | string {
  if (!Array.isArray(stages) || typeof programWeeks !== "number") return true;
  const durations = stages
    .filter((stage) => stage?._type === "phaseStage")
    .map((stage) => stage.duration)
    .filter(isDuration);
  if (durations.length === 0) return true;
  const weeks = durations.reduce(
    (sum, duration) => sum + durationInWeeks(duration),
    0,
  );
  if (Math.abs(weeks - programWeeks) <= PROGRAM_WEEKS_TOLERANCE) return true;
  const total = Number.isInteger(weeks) ? weeks : `about ${weeks.toFixed(1)}`;
  return `The phases add up to ${total} weeks (${durations.map(formatDuration).join(" + ")}), but the site settings give the program ${programWeeks} weeks. The page states both: adjust a phase or the program length.`;
}

/** {@link phaseWeeksProblem} against the published site settings. */
async function validatePhaseWeeks(stages: unknown, context: ValidationContext) {
  const programWeeks = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<number | null>(
      `*[_id == "siteSettings" && !(_id in path("drafts.**"))][0].eLab.programWeeks`,
    );
  return phaseWeeksProblem(stages, programWeeks);
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
                defineField({
                  name: "duration",
                  title: "Duration",
                  type: "object",
                  description:
                    "How long the phase runs; the page shows it as “4 weeks”. The phases together should fill the program length in the site settings.",
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
            Rule.custom(validatePhaseWeeks).warning(),
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
