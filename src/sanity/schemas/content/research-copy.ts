import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, copyStringList, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

const fork = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      copyString({ name: "audience", title: "Audience", max: 40 }),
      copyText({
        name: "text",
        title: "Text",
        description: "One sentence, at heading size.",
        max: 120,
        rows: 2,
      }),
    ],
  });

/**
 * The /research page's own copy (one document, `_id` `researchCopy`), set
 * like a paper's first page. The projects come from the `research`
 * documents, the REX band from its own copy, and the
 * globe from Lab site documents. Read by `features/research/content.ts`, over the code copy in
 * `features/research/data/research-copy.ts`.
 */
export const researchCopyType = defineType({
  name: "researchCopy",
  title: "Research page",
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
          description: "The page's headline, at display size beside the globe.",
          max: 30,
        }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
      ],
    }),
    copyString({
      name: "partnersLabel",
      title: "Research partners label",
      description:
        "The small label over the research partners' logos, also read by screen readers.",
      max: 40,
    }),
    defineField({
      name: "abstract",
      title: "Abstract",
      type: "object",
      fields: [
        copyString({
          name: "label",
          title: "Label",
          description: "The section's small heading, like a paper's.",
          max: 30,
        }),
        copyText({
          name: "statement",
          title: "Statement",
          description: "One sentence at display size, about 16 words.",
          max: 120,
          rows: 2,
        }),
        copyText({
          name: "body",
          title: "Body",
          max: 400,
          rows: 4,
          placeholders: true,
          pageTokens: {
            running:
              "the running sentence below, for the number of ongoing projects",
          },
        }),
        copyString({
          name: "runningOne",
          title: "Running sentence, one project",
          description: "No full stop: the body continues after it.",
          max: 60,
        }),
        copyString({
          name: "runningMany",
          title: "Running sentence, several projects",
          description: "No full stop: the body continues after it.",
          max: 60,
          pageTokens: { count: "the number of ongoing projects, in digits" },
        }),
      ],
    }),
    defineField({
      name: "figurePanels",
      title: "Figure 1",
      type: "array",
      description:
        "Photos of research as it happens, in one row beside the abstract, labelled a, b, c. Two to four panels.",
      of: [
        defineArrayMember({
          name: "figurePanel",
          title: "Panel",
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
              description:
                "The panel's part of the figure caption, a short sentence.",
              max: 80,
            }),
          ],
          preview: { select: { title: "caption", media: "image" } },
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: "ongoing",
      title: "Ongoing projects",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyString({
          name: "empty",
          title: "Empty state",
          description: "Shown while no project is ongoing.",
          max: 60,
        }),
      ],
    }),
    defineField({
      name: "completed",
      title: "Completed projects",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyText({ name: "lead", title: "Lead", max: 160, rows: 2 }),
      ],
    }),
    defineField({
      name: "rex",
      title: "Research abroad (REX)",
      type: "object",
      description:
        "The REX band. Its institutions are the “REX institutions” logo list.",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyText({
          name: "lead",
          title: "Lead",
          description: "What REX offers; name the institutions the logos show.",
          max: 240,
          rows: 3,
        }),
        copyString({
          name: "logosLabel",
          title: "Logos label",
          description:
            "Over the institutions' logos, also read by screen readers.",
          max: 60,
        }),
        copyString({ name: "processTitle", title: "Process heading", max: 40 }),
        copyStringList({
          name: "process",
          title: "Process steps",
          description:
            "One step per item, in order: each starts with a capital letter and what we do (“Collect …”), without closing punctuation.",
          max: 120,
          minItems: 2,
          maxItems: 7,
        }),
        copyText({
          name: "origin",
          title: "Origin",
          description: "Why REX exists, beside the steps.",
          max: 280,
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description:
        "The ink band: the affiliation list again, with one open slot for the next lab.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description: "Display size, about 12 characters per line on a phone.",
          max: 40,
        }),
        copyString({
          name: "openSlot",
          title: "Open slot",
          description: "The last, open entry of the affiliation list.",
          max: 24,
        }),
        fork("partner", "For labs"),
        fork("student", "For students"),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Research page" }) },
});
