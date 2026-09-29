import { defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

/**
 * The /community page's own copy (one document, `_id` `communityCopy`). The
 * journey steps, departments and member stories are documents of their own.
 * Read by `features/community/content.ts`, over the code copy in
 * `features/community/data/copy.ts`.
 */
export const communityCopyType = defineType({
  name: "communityCopy",
  title: "Community page",
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
            "The page's headline, at display size: at most two lines on a laptop.",
          max: 40,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 320,
          placeholders: true,
        }),
        contentImageField({
          name: "photo",
          title: "Photo",
          description: "Beside the headline; the page's first image.",
          required: true,
        }),
        copyString({
          name: "photoCaption",
          title: "Photo caption",
          description: "What, where and when the photo shows, factually.",
          max: 80,
        }),
      ],
    }),
    defineField({
      name: "journey",
      title: "Member journey",
      type: "object",
      description:
        "The timetable's heading; the steps are Member journey steps.",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
      ],
    }),
    defineField({
      name: "departments",
      title: "Departments",
      type: "object",
      description: "The roster's heading; the teams are Department documents.",
      fields: [
        copyString({ name: "title", title: "Title", max: 50 }),
        copyText({ name: "lead", title: "Lead", max: 240, placeholders: true }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description: "The ink band at the end of the page.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description:
            "Display size, about 11 characters per line on a phone: keep it short.",
          max: 50,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          description:
            "The latest recruiting round. Keep its dates as placeholders, so they follow the membership round.",
          max: 240,
          placeholders: true,
        }),
        copyString({
          name: "companiesReader",
          title: "Label for companies",
          description:
            "Over the partners' pitch beside the closing (the pitch is edited on the partners page).",
          max: 30,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Community page" }) },
});
