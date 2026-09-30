import { defineField, defineType } from "sanity";
import {
  copyString,
  copyStringList,
  copyText,
  orderField,
} from "./copy-fields";
import { contentImageField } from "./fields";

/**
 * A task force on /projects: a small team of members that takes AI into one
 * other field. The hero figure draws one circle per task force in `order`,
 * clockwise from the top, and a chapter per task force follows. Read by
 * `features/projects/content.ts`, over `features/projects/data/projects.ts`.
 */
export const taskForceType = defineType({
  name: "taskForce",
  title: "Task force",
  type: "document",
  fields: [
    orderField(),
    copyString({
      name: "name",
      title: "Name",
      description:
        "The chapter's heading and the circle's label in the figure.",
      max: 30,
    }),
    defineField({
      name: "slug",
      title: "Anchor",
      type: "slug",
      description:
        "The chapter's link target, as in /projects#med-ai. Changing it breaks existing links.",
      options: { source: "name", maxLength: 40 },
      validation: (Rule) =>
        Rule.required().custom((slug) =>
          slug?.current === "your-field"
            ? "your-field is the open circle's anchor."
            : true,
        ),
    }),
    copyString({
      name: "field",
      title: "Field",
      description:
        "The field the task force brings AI into: its circle's label in the small figure, so keep it short.",
      max: 24,
    }),
    copyText({
      name: "description",
      title: "Description",
      description: "One sentence: what the task force does, in a large size.",
      max: 160,
      rows: 2,
      placeholders: true,
    }),
    copyText({
      name: "detailedDescription",
      title: "Detailed description",
      description: "The paragraph under the description.",
      max: 600,
      rows: 5,
      placeholders: true,
    }),
    defineField({
      name: "work",
      title: "Work with a partner",
      type: "object",
      description:
        "Optional: named projects the task force does with one partner, listed under its chapter. The page's closing names the first such partner.",
      fields: [
        defineField({
          name: "partner",
          title: "Partner",
          type: "reference",
          to: [{ type: "organization" }],
          description:
            "The organisation, named as in 'Research projects with … include' and in the page's closing.",
          validation: (Rule) => Rule.required(),
        }),
        copyStringList({
          name: "items",
          title: "Projects",
          description: "One line per project, in the task force's own words.",
          max: 120,
          minItems: 1,
          maxItems: 8,
        }),
      ],
    }),
    contentImageField({
      name: "photo",
      title: "Photo",
      description:
        "Optional: a real photo of the task force's people or work, shown at 4:3 beside the chapter.",
    }),
    copyString({
      name: "photoCaption",
      title: "Photo caption",
      description: "What, where and when the photo shows, factually.",
      max: 80,
      required: false,
    }),
  ],
  orderings: [
    {
      title: "Figure order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "name", subtitle: "field", media: "photo" } },
});
