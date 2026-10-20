import { defineField, defineType } from "sanity";
import { logoListSurfaces } from "../../../lib/people-and-logos";

/**
 * The logos of one page section, in order: one document per section with a
 * fixed id (the Studio lists them under "Logos and people"). Order and
 * membership live here rather than on the organisation, because one
 * organisation appears in several sections, in a different place in each.
 * Read by `lib/organization-content.ts`.
 */
export const logoListType = defineType({
  name: "logoList",
  title: "Logo list",
  type: "document",
  description:
    "The organisations one page section shows, in order. Drag to reorder; add an organisation to show it.",
  fields: [
    defineField({
      name: "surface",
      title: "Section",
      type: "string",
      description: "The page section that reads this list. Fixed per list.",
      options: { list: [...logoListSurfaces], layout: "radio" },
      readOnly: ({ value }) => Boolean(value),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "organizations",
      title: "Organisations",
      type: "array",
      description:
        "In the order the section shows them. An empty list hides all logos in that section.",
      of: [{ type: "reference", to: [{ type: "organization" }] }],
      validation: (Rule) => Rule.required().unique(),
    }),
  ],
  preview: {
    select: { surface: "surface", organizations: "organizations" },
    prepare: ({ surface, organizations }) => ({
      title:
        logoListSurfaces.find(({ value }) => value === surface)?.title ??
        "Logo list",
      subtitle: `${Array.isArray(organizations) ? organizations.length : 0} organisations`,
    }),
  },
});
