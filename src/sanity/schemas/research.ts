import { defineField, defineType } from "sanity";

export const researchType = defineType({
  name: "research",
  title: "Research",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "desc",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Ongoing", value: "ongoing" },
          { title: "Completed", value: "completed" },
        ],
      },
    }),
    defineField({
      name: "publication",
      title: "Publication Link",
      type: "url",
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "img",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
