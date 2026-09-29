import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";
import { storyExcerptField } from "./excerpt-rules";
import { contentImageField, validateSitePath } from "./fields";

/** The ledger's figures; their values come from the site settings in code. */
const ledgerFigures = [
  { title: "Founding year", value: "founded" },
  { title: "Official members", value: "members" },
  { title: "Nationalities", value: "nationalities" },
  { title: "Raised by E-Lab startups (€M)", value: "funding" },
  { title: "Makeathon participants", value: "makeathon" },
  { title: "Publications", value: "publications" },
];

const programTokens = {
  rexInstitutions:
    "the REX institutions' short names as a list (Harvard, MIT, Cambridge and Inria)",
  departments: "how many departments the community page lists, as a word",
};

/**
 * The homepage's copy (one document, `_id` `homeCopy`). The figures in the
 * ledger come from the site settings; the quotes reference people, and the
 * partner band's outcomes and logos are partner content. Read by `features/home/content.ts`, over the code copy
 * in `features/home/data/homepage.ts`.
 */
export const homeCopyType = defineType({
  name: "homeCopy",
  title: "Homepage",
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
            "The site's headline, at display size, about 9 characters per line on a phone: keep it to a few words.",
          max: 50,
        }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
        copyString({
          name: "partnersLabel",
          title: "Partners label",
          description: "Before the partners' logos at the bottom of the hero.",
          max: 30,
        }),
        defineField({
          name: "photos",
          title: "Photos through the logomark",
          type: "array",
          description:
            "Event photos seen through the logomark, cycling in order; stage-lit rooms read best. The first one loads with the page, so keep it light. Decorative: no alternative text needed.",
          of: [
            defineArrayMember({
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative text",
                  type: "string",
                }),
              ],
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(5),
        }),
      ],
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "object",
      fields: [
        copyText({
          name: "statement",
          title: "Statement",
          description:
            "At display size, about 13 characters per line: one sentence.",
          max: 90,
          rows: 2,
        }),
        copyText({
          name: "body",
          title: "Body",
          max: 400,
          rows: 4,
          placeholders: true,
        }),
      ],
    }),
    defineField({
      name: "ledger",
      title: "Ledger",
      type: "array",
      description:
        "The figures beside the mission, in order. Each row picks a figure from the site settings and labels it.",
      of: [
        defineArrayMember({
          name: "ledgerRow",
          title: "Figure",
          type: "object",
          fields: [
            defineField({
              name: "key",
              title: "Figure",
              type: "string",
              options: { list: ledgerFigures },
              validation: (Rule) => Rule.required(),
            }),
            copyString({ name: "label", title: "Label", max: 30 }),
            copyString({
              name: "note",
              title: "Note",
              description: "One short line of context under the label.",
              max: 70,
              placeholders: true,
            }),
          ],
          preview: { select: { title: "label", subtitle: "note" } },
        }),
      ],
      validation: (Rule) => Rule.required().min(3).max(8),
    }),
    defineField({
      name: "programs",
      title: "Programs",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        defineField({
          name: "items",
          title: "Programs",
          type: "array",
          of: [
            defineArrayMember({
              name: "program",
              title: "Program",
              type: "object",
              fields: [
                defineField({
                  name: "key",
                  title: "Key",
                  type: "string",
                  description: "A stable id, lowercase (research, events).",
                  validation: (Rule) =>
                    Rule.required().regex(/^[a-z0-9-]+$/, { name: "key" }),
                }),
                copyString({
                  name: "title",
                  title: "Title",
                  description: "Set large in the index.",
                  max: 30,
                }),
                copyText({
                  name: "description",
                  title: "Description",
                  description: "One sentence with one concrete proof point.",
                  max: 180,
                  rows: 2,
                  placeholders: true,
                  pageTokens: programTokens,
                }),
                defineField({
                  name: "href",
                  title: "Link",
                  type: "string",
                  description: "The page it leads to, like /research.",
                  validation: (Rule) =>
                    Rule.required().custom((value) => validateSitePath(value)),
                }),
                contentImageField({
                  name: "image",
                  title: "Photo",
                  description: "The row's preview; decorative.",
                  required: true,
                }),
              ],
              preview: { select: { title: "title", media: "image" } },
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(7),
        }),
      ],
    }),
    defineField({
      name: "room",
      title: "In the room",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        defineField({
          name: "photos",
          title: "Photos",
          type: "array",
          description:
            "The editorial spread, in layout order: exactly five photos (the third one runs as a panorama).",
          of: [
            defineArrayMember({
              name: "roomPhoto",
              title: "Photo",
              type: "object",
              fields: [
                contentImageField({
                  name: "image",
                  title: "Photo",
                  required: true,
                }),
                copyString({
                  name: "caption",
                  title: "Caption",
                  description: "What, where and when, factually.",
                  max: 60,
                }),
              ],
              preview: { select: { title: "caption", media: "image" } },
            }),
          ],
          validation: (Rule) => Rule.required().length(5),
        }),
      ],
    }),
    defineField({
      name: "join",
      title: "Join band",
      type: "object",
      description: "The member call to action at the end of the page.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description: "Display size, about 9 characters per line on a phone.",
          max: 40,
        }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
        copyString({ name: "stepsTitle", title: "Steps heading", max: 40 }),
        defineField({
          name: "steps",
          title: "Recruiting steps",
          type: "array",
          description:
            "The steps of a recruiting round, numbered in order. Keep the dates as placeholders so they follow the round.",
          of: [
            defineArrayMember({
              name: "recruitingStep",
              title: "Step",
              type: "object",
              fields: [
                copyString({ name: "title", title: "Title", max: 20 }),
                copyString({
                  name: "dates",
                  title: "Dates",
                  max: 60,
                  placeholders: true,
                }),
              ],
              preview: { select: { title: "title", subtitle: "dates" } },
            }),
          ],
          validation: (Rule) => Rule.required().min(1).max(4),
        }),
        defineField({
          name: "quote",
          title: "Member quote",
          type: "object",
          description:
            "A sentence from a member's story on the community page; the story supplies the name, role and portrait.",
          fields: [
            defineField({
              name: "person",
              title: "Member",
              type: "reference",
              to: [{ type: "person" }],
              options: { filter: 'placement == "member-story"' },
              description: "One of the member stories.",
              validation: (Rule) => Rule.required(),
            }),
            storyExcerptField(),
          ],
        }),
      ],
    }),
    defineField({
      name: "partners",
      title: "Partners band",
      type: "object",
      description:
        "The case for partners: a partner's quote, the case-study outcomes and every current partner's logo (partner content).",
      fields: [
        copyString({ name: "title", title: "Title", max: 60 }),
        copyText({ name: "lead", title: "Lead", max: 200, rows: 2 }),
        copyString({
          name: "moreLabel",
          title: "Second button",
          description: "Beside “Become a Partner”; leads to the partners page.",
          max: 30,
        }),
        defineField({
          name: "quote",
          title: "Partner quote",
          type: "reference",
          to: [{ type: "person" }],
          options: { filter: 'placement == "e-lab-testimonial"' },
          description:
            "An E-Lab testimonial by an investor or partner; it supplies the quote, name, portrait and logo.",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});
