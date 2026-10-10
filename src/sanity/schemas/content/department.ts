import { defineType } from "sanity";
import { copyString, copyText, orderField } from "./copy-fields";
import { contentImageField } from "./fields";

/**
 * One core department on /community (the roster under "The departments that
 * run TUM.ai"); the homepage counts them. Read by `lib/community-content.ts`,
 * which preserves an intentionally empty department collection.
 */
export const departmentType = defineType({
  name: "department",
  title: "Department",
  type: "document",
  fields: [
    orderField(),
    copyString({
      name: "name",
      title: "Name",
      description: "The team's name, as a heading beside its description.",
      max: 30,
    }),
    copyText({
      name: "description",
      title: "Description",
      description: "What the team does, in its own words: one paragraph.",
      max: 600,
      rows: 5,
      placeholders: true,
    }),
    contentImageField({
      name: "photo",
      title: "Photo",
      description:
        "Optional: a real photo of the team or its work, shown at 4:3 beside the description. Set the hotspot on the people.",
    }),
    copyString({
      name: "photoCaption",
      title: "Photo caption",
      description:
        "What, where and when the photo shows, factually. Only with a photo.",
      max: 80,
      required: false,
    }),
  ],
  orderings: [
    {
      title: "Page order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "name", media: "photo", subtitle: "order" } },
});
