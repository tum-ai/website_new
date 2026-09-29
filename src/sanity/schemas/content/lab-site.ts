import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, orderField } from "./copy-fields";

/**
 * A city on the /research hero globe and the organisations TUM.ai works
 * with there. The research projects' institutions, the research partners
 * and the REX institutions are placed on the site that references their
 * organisation; the globe draws the sites with any, plus the home site.
 * Read by `features/research/content.ts`, over
 * `features/research/data/lab-sites.ts`.
 */
export const labSiteType = defineType({
  name: "labSite",
  title: "Lab site",
  type: "document",
  fields: [
    orderField(),
    copyString({
      name: "city",
      title: "City",
      description: "The marker's label on the globe.",
      max: 24,
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "slug",
      description:
        "A stable id for the marker (the globe's CSS anchor). Set it once.",
      options: { source: "city", maxLength: 32 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "geopoint",
      description:
        "Where the marker sits. One site per city: labs a few kilometres apart would draw one marker anyway.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "home",
      title: "TUM.ai's home",
      type: "boolean",
      description:
        "Every arc on the globe starts here, and it shows even when no institution matches. Set it on exactly one site.",
      initialValue: false,
    }),
    defineField({
      name: "organizations",
      title: "Organisations",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "organization" }],
        }),
      ],
      description:
        "The institutions, labs and partners here (TUM CAMP, Helmholtz Munich, ...). A research project, research partner or REX institution that is one of them puts this site on the globe. One organisation belongs to one site.",
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
  ],
  orderings: [
    {
      title: "Globe order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "city", subtitle: "organizations.0.name" } },
});
