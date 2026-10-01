import { defineArrayMember, defineField, defineType } from "sanity";
import { copyString, copyStringList, copyText } from "./copy-fields";
import { contentImageField } from "./fields";

const isHttps = (value: unknown) =>
  typeof value !== "string" || value === "" || value.startsWith("https://")
    ? true
    : "Use an https:// address.";

/** One Makeathon in the editions list. */
const makeathonEdition = defineArrayMember({
  type: "object",
  name: "makeathonEdition",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description:
        "A short, unique id that never changes: the year, or the year and season (2022-autumn).",
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9-]+$/, { name: "lowercase id" }),
    }),
    copyString({
      name: "name",
      title: "Name",
      description: "The edition's name or theme: “AI for everyone”.",
      max: 40,
    }),
    defineField({
      name: "start",
      title: "First day",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "end",
      title: "Last day",
      type: "date",
      description: "The same as the first day for a one-day event.",
      validation: (Rule) =>
        Rule.required().custom((end, context) => {
          const start = (context.parent as { start?: string } | undefined)
            ?.start;
          return !start || !end || end >= start
            ? true
            : "The last day can't be before the first.";
        }),
    }),
    copyString({
      name: "city",
      title: "City",
      description:
        "Where it took place. An event in the same city on the same days is this edition.",
      max: 30,
    }),
    copyText({
      name: "note",
      title: "Note",
      description: "One or two sentences: where, and who brought challenges.",
      max: 200,
      rows: 2,
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      description: "Optional: a source worth reading, after the note.",
      fields: [
        copyString({ name: "label", title: "Label", max: 30 }),
        defineField({
          name: "href",
          title: "Address",
          type: "url",
          validation: (Rule) => Rule.required().custom(isHttps),
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", subtitle: "start" } },
});

/**
 * The /hackathons page's own copy (one document, `_id` `hackathonsCopy`),
 * including the Makeathon editions the ribbon draws. The league season is a
 * site fact in code, and the other hackathons are events. Read by
 * `features/hackathons/content.ts`, over the code copy in
 * `features/hackathons/data/copy.ts`.
 */
export const hackathonsCopyType = defineType({
  name: "hackathonsCopy",
  title: "Hackathons page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        copyString({ name: "eyebrow", title: "Eyebrow", max: 30 }),
        copyString({
          name: "title",
          title: "Title",
          description:
            "The page's headline, over the ribbon of every hackathon: at most two lines on a laptop.",
          max: 60,
        }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 320,
          rows: 4,
          placeholders: true,
          pageTokens: { since: "the year of the first Makeathon" },
        }),
        copyString({
          name: "ribbonLabel",
          title: "Ribbon label",
          description: "Read by screen readers for the ribbon's list.",
          max: 60,
        }),
        copyString({
          name: "sliderLabel",
          title: "Slider label",
          description:
            "Read by screen readers for the ribbon, which the arrow keys step through.",
          max: 40,
        }),
        copyString({
          name: "nextLabel",
          title: "Next label",
          description: "Before the next hackathon, under the ribbon: “Next”.",
          max: 20,
        }),
        defineField({
          name: "legend",
          title: "Legend",
          type: "object",
          description: "The ribbon's key: one label per kind of hackathon.",
          fields: [
            copyString({ name: "makeathon", title: "Makeathon", max: 24 }),
            copyString({ name: "league", title: "League match", max: 24 }),
            copyString({ name: "partner", title: "Other hackathon", max: 24 }),
          ],
        }),
      ],
    }),
    defineField({
      name: "makeathon",
      title: "Makeathon",
      type: "object",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          max: 60,
          pageTokens: { since: "the year of the first Makeathon" },
        }),
        copyText({ name: "lead", title: "Lead", max: 400, placeholders: true }),
        copyString({ name: "linkLabel", title: "Link label", max: 40 }),
        contentImageField({ name: "photo", title: "Photo", required: true }),
        copyString({
          name: "photoCaption",
          title: "Photo caption",
          description: "What, where and when the photo shows, factually.",
          max: 80,
        }),
        defineField({
          name: "editions",
          title: "Editions",
          type: "array",
          description:
            "Every Makeathon, oldest first. The ribbon draws them all: if one is incomplete, the page shows the built-in list.",
          of: [makeathonEdition],
          validation: (Rule) => Rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "partners",
      title: "Other hackathons",
      type: "object",
      description:
        "The band that lists the hackathon events between Makeathons.",
      fields: [
        copyString({ name: "title", title: "Title", max: 60 }),
        copyText({
          name: "lead",
          title: "Lead",
          max: 240,
          placeholders: true,
          pageTokens: {
            count: "the number of these hackathons so far",
            since: "the month of the first",
          },
        }),
        copyString({
          name: "hostsPrefix",
          title: "Co-hosts prefix",
          description:
            "Before an event's co-hosts: “with” (… with BMW and CDTM).",
          max: 20,
        }),
      ],
    }),
    defineField({
      name: "league",
      title: "League",
      type: "object",
      description:
        "The league's season and site are site facts; this is the band's wording.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          max: 80,
          placeholders: true,
        }),
        copyText({ name: "lead", title: "Lead", max: 320, placeholders: true }),
        copyString({ name: "linkLabel", title: "Link label", max: 40 }),
      ],
    }),
    defineField({
      name: "offer",
      title: "Bring a challenge",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 240 }),
        copyStringList({
          name: "items",
          title: "What a challenge comes with",
          max: 60,
          minItems: 2,
          maxItems: 6,
        }),
        copyString({ name: "addOns", title: "Add-ons", max: 100 }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 240 }),
        defineField({
          name: "student",
          title: "For students",
          type: "object",
          fields: [
            copyString({ name: "audience", title: "Audience", max: 30 }),
            copyText({ name: "text", title: "Text", max: 140, rows: 2 }),
            copyString({ name: "actionLabel", title: "Button", max: 30 }),
          ],
        }),
        defineField({
          name: "partner",
          title: "For partners",
          type: "object",
          fields: [
            copyString({ name: "audience", title: "Audience", max: 30 }),
            copyText({ name: "text", title: "Text", max: 140, rows: 2 }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Hackathons page" }) },
});
