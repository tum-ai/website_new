import { defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";

const audience = (name: string, title: string, extra = {}) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      copyString({
        name: "audience",
        title: "Audience",
        description: "The small label over the text.",
        max: 30,
      }),
      copyText({
        name: "text",
        title: "Text",
        description: "One sentence, at heading size.",
        max: 140,
        rows: 2,
        ...extra,
      }),
    ],
  });

/**
 * The /projects page's own copy (one document, `_id` `projectsCopy`). The
 * task forces are documents of their own; the figure's geometry is code.
 * Read by `features/projects/content.ts`, over the code copy in
 * `features/projects/data/copy.ts`.
 */
export const projectsCopyType = defineType({
  name: "projectsCopy",
  title: "Projects page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        copyString({ name: "eyebrow", title: "Eyebrow", max: 30 }),
        copyString({
          name: "title",
          title: "Title",
          description:
            "The page's headline, at display size beside the figure: at most three lines on a laptop.",
          max: 40,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 320,
          rows: 4,
          placeholders: true,
          pageTokens: {
            count: "the number of task forces, as a capitalized word (Five)",
          },
        }),
        copyString({
          name: "figureLabel",
          title: "Figure label",
          description:
            "Read by screen readers for the figure's list of circles, which link to the chapters.",
          max: 40,
        }),
      ],
    }),
    defineField({
      name: "openSeat",
      title: "Open circle",
      type: "object",
      description:
        "The figure's last circle, kept open for the next task force; it links to the closing.",
      fields: [
        copyString({ name: "name", title: "Label", max: 24 }),
        copyString({ name: "field", title: "Field label", max: 24 }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description: "The ink band at the end of the page, beside the figure.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description:
            "Display size, about 10 characters per line on a phone: keep it short.",
          max: 40,
        }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
        audience("student", "For students"),
        defineField({
          name: "partner",
          title: "For partners",
          type: "object",
          fields: [
            copyString({ name: "audience", title: "Audience", max: 30 }),
            copyText({
              name: "text",
              title: "Text",
              description:
                "One sentence, at heading size, shown while a task force names a partner.",
              max: 140,
              rows: 2,
              pageTokens: {
                partner: "the partner of the first task force with named work",
              },
            }),
            copyText({
              name: "textWithoutPartner",
              title: "Text without a partner",
              description: "Shown instead while no task force names a partner.",
              max: 140,
              rows: 2,
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Projects page" }) },
});
