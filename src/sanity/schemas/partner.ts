import { defineField, defineType } from "sanity";

/**
 * The old site's partner type, registered on every dataset because `main`
 * reads it on `production`. On the new site's dataset partners are
 * organisations with a partner tier (`content/organization.ts`); the Studio
 * there hides this type, and `pnpm sanity:migrate-partners` moves its
 * documents' tier, category and id onto the organisations.
 */
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
        "Groups partners under the Gold, Silver, or Bronze heading and controls logo prominence. The new site reads the tier from the partner's organisation instead.",
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
