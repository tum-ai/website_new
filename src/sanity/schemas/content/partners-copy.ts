import { defineField, defineType } from "sanity";
import { copyString, copyStringList, copyText } from "./copy-fields";
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

/** An optional single line of section copy: empty shows the code copy. */
const line = (name: string, title: string, max: number, description?: string) =>
  copyString({ name, title, max, description, required: false });

/**
 * A heading or lead set on fixed lines, one item per line (the page joins
 * them with line breaks). The limits keep each line on one line of the
 * layout on a phone.
 */
const lines = (
  name: string,
  title: string,
  {
    max,
    maxLines,
    description,
  }: { max: number; maxLines: number; description?: string },
) =>
  copyStringList({
    name,
    title,
    max,
    maxItems: maxLines,
    required: false,
    description: [
      description,
      `One item per line, at most ${maxLines} ${maxLines === 1 ? "line" : "lines"}.`,
    ]
      .filter(Boolean)
      .join(" "),
  });

/** One band's copy, collapsed in the Studio. */
const band = (
  name: string,
  title: string,
  fields: ReturnType<typeof defineField>[],
) =>
  defineField({
    name,
    title,
    type: "object",
    group: "sections",
    options: { collapsible: true, collapsed: true },
    fields,
  });

/**
 * The /partners copy that is not a document of its own: the finder's
 * answers, recommendations and prompts, the reasons, the proof figures, the
 * three pillars, every band's headings (lines kept as lists), plus the
 * one-sentence partner pitch other pages' closings quote.
 * A singleton; a field left empty shows the code copy. The finder's answers
 * and formats are fixed (the recommendation logic maps them), so only their
 * wording is editable. Read by `features/partners/content.ts`.
 */
export const partnersCopyType = defineType({
  name: "partnersCopy",
  title: "Partners page copy",
  type: "document",
  description:
    "Copy for /partners: the finder, reasons, figures, pillars and the section headings. Empty fields show the built-in copy.",
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
    defineField({
      name: "prompts",
      title: "Finder questions and booking dialog",
      type: "object",
      group: "finder",
      options: { collapsible: true, collapsed: true },
      fields: [
        line("intentQuestion", "First question", 60),
        line("durationQuestion", "Second question", 90),
        copyString({
          name: "resultQuestion",
          title: "Result",
          max: 60,
          required: false,
          pageTokens: { format: "the recommended format's name, highlighted" },
        }),
        line(
          "firstChoice",
          "Hackathon extra",
          60,
          "Under the hackathon format when the partner wants an ongoing relationship.",
        ),
        line("bookingTitle", "Booking dialog title", 50),
        copyString({
          name: "bookingLead",
          title: "Booking dialog lead",
          max: 90,
          required: false,
          pageTokens: {
            host: "who the booking page books (site settings)",
          },
        }),
        line(
          "bookingSlow",
          "Calendar slow note",
          100,
          "Shown when the calendar has not loaded after 15 seconds.",
        ),
      ],
    }),
    defineField({
      name: "sections",
      title: "Section headings",
      type: "object",
      group: "sections",
      description:
        "The bands' headings, leads and labels. Headings set on fixed lines keep their line breaks; the buttons' own labels stay in code.",
      fields: [
        band("hero", "Hero", [
          line("eyebrow", "Eyebrow", 50),
          lines("title", "Title", {
            max: 16,
            maxLines: 3,
            description: "Each line animates in on its own.",
          }),
          copyText({
            name: "lead",
            title: "Lead",
            max: 140,
            rows: 2,
            required: false,
          }),
          line("contactLabel", "Email button", 24),
          line("fitLabel", "Finder button", 24),
          lines("caption", "Photo caption", { max: 32, maxLines: 2 }),
        ]),
        band("marquee", "Partner rail", [
          line("label", "Label", 30),
          line("link", "Link to the directory", 30),
        ]),
        band("finder", "Finder", [
          line("eyebrow", "Eyebrow", 24),
          lines("title", "Title", { max: 28, maxLines: 2 }),
          copyText({
            name: "lead",
            title: "Lead",
            max: 120,
            rows: 2,
            required: false,
          }),
          line("note", "Note", 80),
        ]),
        band("reasons", "Reasons", [
          lines("title", "Title", { max: 24, maxLines: 2 }),
          copyText({
            name: "lead",
            title: "Lead",
            max: 120,
            rows: 2,
            required: false,
          }),
          line("contact", "Contact row", 40),
        ]),
        band("proof", "Figures", [line("title", "Title", 60)]),
        band("pillars", "Pillars", [
          lines("title", "Title", { max: 24, maxLines: 2 }),
          copyText({
            name: "lead",
            title: "Lead",
            max: 120,
            rows: 2,
            required: false,
          }),
        ]),
        band("people", "People", [
          line("title", "Title", 30),
          lines("lead", "Lead", { max: 32, maxLines: 2 }),
          line("statLabel", "Under the member count", 30),
          lines("tagline", "Tagline", { max: 28, maxLines: 2 }),
          line("alumniTitle", "Alumni heading", 40),
        ]),
        band("directory", "Directory", [
          lines("title", "Title", { max: 24, maxLines: 2 }),
          lines("lead", "Lead", { max: 32, maxLines: 2 }),
          line("supportersTitle", "Supporters heading", 40),
        ]),
        band("cases", "Case studies", [
          lines("title", "Title", { max: 24, maxLines: 2 }),
          lines("lead", "Lead", { max: 36, maxLines: 2 }),
          line("contact", "Contact row", 50),
        ]),
        band("contact", "Closing", [
          lines("title", "Title", { max: 20, maxLines: 2 }),
          lines("lead", "Lead", { max: 60, maxLines: 2 }),
          line("emailLabel", "Email button", 24),
        ]),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Partners page copy" }) },
});
