import {
  type ConditionalPropertyCallbackContext,
  defineField,
  defineType,
} from "sanity";
import { partnerCategories, partnerTiers } from "../../../lib/people-and-logos";
import { kebabKey, logoArtworkField, uniqueKey } from "./image-rules";

/** Whether the edited organisation has a partner tier (the partner fields show then). */
const isPartner = ({ document }: ConditionalPropertyCallbackContext) =>
  Boolean(document?.partnerTier);

/**
 * A company, lab or institution the site shows a logo for, and, when it has
 * a partner tier, a TUM.ai partner. One document per organisation, reused
 * everywhere it appears, so a new logo file is changed once:
 *
 * - a `logoList` places organisations in a page section, and a case study or
 *   a testimonial references the one it is about;
 * - the "Partnership" group makes it a partner: the /partners directory, the
 *   homepage's partner logos, /research (research partners) and
 *   `/api/getPartners` list every organisation with `partnerTier` set. It
 *   replaces the old site's `partner` type on the new site's dataset
 *   (`pnpm sanity:migrate-partners`).
 *
 * Read by `lib/organization-content.ts`.
 */
export const organizationType = defineType({
  name: "organization",
  title: "Organisation",
  type: "document",
  description:
    "A company, lab or institution with its logos. Add it to a logo list to show it in a page section; give it a partner tier to list it as a TUM.ai partner.",
  groups: [
    { name: "organization", title: "Organisation", default: true },
    { name: "partnership", title: "Partnership" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "organization",
      description:
        "As the organisation writes it: “Hudson River Trading”, “Entire.io”. Pages set it when the logo is missing or symbol-only.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      group: "organization",
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
      group: "organization",
      description:
        "How running text names it, if shorter: “Harvard” for Harvard University. Optional.",
      validation: (Rule) => Rule.max(30),
    }),
    defineField({
      name: "href",
      title: "Website",
      type: "url",
      group: "organization",
      description:
        "Where the logo links to, when the section links logos (the partner directory does).",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),
    {
      ...logoArtworkField({
        name: "logo",
        title: "Logo for light backgrounds",
        description:
          "The official logo in its colours, for white and light bands (the partner directory's tiles). An SVG is best; trim transparent margins.",
      }),
      group: "organization",
    },
    {
      ...logoArtworkField({
        name: "logoOnDark",
        title: "Logo for dark backgrounds",
        description:
          "The official variant for dark bands (partner marquee, events hero), never a recoloured copy. Leave empty if there is none: dark bands then set the name.",
      }),
      group: "organization",
    },
    defineField({
      name: "partnerTier",
      title: "Partner tier",
      type: "string",
      group: "partnership",
      description:
        "Set it to list this organisation as a TUM.ai partner on /partners. Gold, Silver and Bronze partners get their own rows and also appear on the homepage and in the /partners hero; supporters share the board below. Leave empty for an organisation that is not a partner.",
      options: { list: [...partnerTiers] },
    }),
    defineField({
      name: "partnerFeatured",
      title: "Lead its tier",
      type: "boolean",
      group: "partnership",
      description:
        "Shows this partner before the others in its tier. Leave off for the usual order.",
      hidden: (context) => !isPartner(context),
      // No initialValue: it would write `false` on every new organisation,
      // partner or not. The site reads empty as off.
    }),
    defineField({
      name: "partnerCategory",
      title: "Partner category",
      type: "string",
      group: "partnership",
      description:
        "What kind of partner this is. Research partners also appear on /research; the public partner API (/api/getPartners) returns the category.",
      options: { list: [...partnerCategories] },
      hidden: (context) => !isPartner(context),
    }),
    defineField({
      name: "legacyPartnerId",
      title: "Old partner document",
      type: "string",
      group: "partnership",
      description:
        "The id of the old site's partner document this organisation replaces, set by the migration. /api/getPartners returns it as the partner's id, so outside consumers keep theirs.",
      hidden: true,
      readOnly: true,
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
    select: {
      title: "name",
      key: "key",
      tier: "partnerTier",
      media: "logo",
    },
    prepare: ({ title, key, tier, media }) => ({
      title,
      subtitle: tier
        ? `${key} · ${partnerTiers.find(({ value }) => value === tier)?.title ?? tier} partner`
        : key,
      media,
    }),
  },
});
