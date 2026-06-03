import { defineField, defineType } from "sanity";

export const partnerType = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "link",
      title: "Website URL",
      type: "url",
    }),
    defineField({
      name: "image",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Used to group partners into sections on the frontend.",
      options: {
        list: [
          { title: "Technical Partner", value: "Technical Partners" },
          { title: "Industry Partner", value: "Industry Partners" },
          { title: "Research Partner", value: "Research Partners" },
          { title: "Venture Capital", value: "Venture Capital" },
          { title: "Initiative", value: "Initiatives" },
        ],
      },
    }),
  ],
});
