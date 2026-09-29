import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, orderField } from "./copy-fields";

/**
 * A city on the /research hero globe and the institutions TUM.ai works with
 * there. Institution names from the research projects, research partners
 * and REX copy are matched against each site's names (case-insensitive);
 * the globe draws the sites that match, plus the home site. Read by
 * `features/research/content.ts`, over `features/research/data/lab-sites.ts`.
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
      name: "institutions",
      title: "Institution names",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          validation: (Rule) => Rule.required().max(80),
        }),
      ],
      description:
        "Every name the projects, partners and REX copy use for a lab here (TUM, TUM CAMP, Helmholtz Munich, ...). A name matches case-insensitively.",
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: "Globe order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "city", subtitle: "institutions.0" } },
});
