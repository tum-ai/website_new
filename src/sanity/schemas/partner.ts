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
      description:
        "Legacy partner category, retained for existing integrations.",
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
    defineField({
      name: "tier",
      title: "Partner tier",
      type: "string",
      description:
        "Groups partners under the Gold, Silver, or Bronze heading and controls logo prominence. These partners also appear in the hero marquee. Leave empty to use the partner-page launch defaults.",
      options: {
        list: [
          { title: "Gold", value: "gold" },
          { title: "Silver", value: "silver" },
          { title: "Bronze", value: "bronze" },
          { title: "Supporter", value: "supporter" },
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Featured within tier",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
