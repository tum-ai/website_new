import { defineField, defineType } from "sanity";
import { kebabKey, logoArtworkField, uniqueKey } from "./image-rules";

/**
 * A company, lab or institution the site shows a logo for. Pages never list
 * organisations on their own: a `logoList` places them in a section, and a
 * case study or a testimonial references the one it is about. One document
 * per organisation, reused everywhere it appears, so a new logo file is
 * changed once. Read by `lib/organization-content.ts`.
 */
export const organizationType = defineType({
  name: "organization",
  title: "Organisation",
  type: "document",
  description:
    "A company, lab or institution with its logos. Add it to a logo list to show it in a page section.",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "As the organisation writes it: “Hudson River Trading”, “Entire.io”. Pages set it when the logo is missing or symbol-only.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description:
        "Stable id the site uses to match this organisation (partner names, event co-hosts compare its letters and digits). The name in lowercase with hyphens: “hudson-river-trading”. Don't change it once published.",
      validation: (Rule) =>
        Rule.required()
          .regex(kebabKey, { name: "lowercase words joined by hyphens" })
          .custom(uniqueKey("organization")),
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      description:
        "How running text names it, if shorter: “Harvard” for Harvard University. Optional.",
      validation: (Rule) => Rule.max(30),
    }),
    defineField({
      name: "href",
      title: "Website",
      type: "url",
      description: "Where the logo links to, when the section links logos.",
      validation: (Rule) => Rule.uri({ scheme: ["https", "http"] }),
    }),
    logoArtworkField({
      name: "logo",
      title: "Logo for light backgrounds",
      description:
        "The official logo in its colours, for white and light bands. An SVG is best; trim transparent margins.",
    }),
    logoArtworkField({
      name: "logoOnDark",
      title: "Logo for dark backgrounds",
      description:
        "The official variant for dark bands (partner marquee, events hero), never a recoloured copy. Leave empty if there is none: dark bands then set the name.",
    }),
  ],
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "key", media: "logo" },
  },
});
