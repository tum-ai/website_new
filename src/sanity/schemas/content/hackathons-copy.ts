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
      name: "event",
      title: "Event",
      type: "reference",
      to: [{ type: "event" }],
      description:
        "The Makeathon's event: the ribbon and the list take its dates and city from it, so they always match the events page.",
      validation: (Rule) => Rule.required(),
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
  preview: { select: { title: "name", subtitle: "event.event_date" } },
});

/**
 * The /hackathons page's own copy (one document, `_id` `hackathonsCopy`),
 * including the Makeathon editions the ribbon draws. League facts are in
 * siteSettings; logos are in the ehl-partners logo list. Other hackathons are events.
 */
export const hackathonsCopyType = defineType({
  name: "hackathonsCopy",
  title: "Hackathons page",
  type: "document",
  fields: [
    defineField({
      name: "voiceCaseStudy",
      title: "Partner voice",
      type: "reference",
      to: [{ type: "caseStudy" }],
      weak: true,
      description:
        "Optional case study whose quote appears beside the partner hackathons.",
    }),
    defineField({
      name: "outcomeCaseStudy",
      title: "Challenge outcome",
      type: "reference",
      to: [{ type: "caseStudy" }],
      weak: true,
      description:
        "Optional case study whose result supports the challenge offer.",
    }),
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
            "The page's headline, over the ribbon of every hackathon: one sentence per flagship, each set on its own line.",
          max: 90,
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
          name: "leagueAction",
          title: "League button",
          description: "The button to the league's own site.",
          max: 40,
        }),
        copyString({
          name: "makeathonAction",
          title: "Makeathon button",
          description: "The button to the Makeathon's own site.",
          max: 40,
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
          name: "eyebrow",
          title: "Eyebrow",
          max: 40,
          pageTokens: { since: "the year of the first Makeathon" },
        }),
        copyString({ name: "title", title: "Title", max: 40 }),
        copyText({ name: "lead", title: "Lead", max: 400, placeholders: true }),
        copyString({ name: "linkLabel", title: "Link label", max: 40 }),
        defineField({
          name: "figures",
          title: "Figures",
          type: "object",
          description: "Three figures beside the opener, each with its label.",
          fields: (
            [
              ["latest", "The latest edition"],
              ["editions", "Editions"],
              ["league", "The league"],
            ] as const
          ).map(([name, title]) =>
            defineField({
              name,
              title,
              type: "object",
              fields: [
                copyString({
                  name: "value",
                  title: "Figure",
                  max: 12,
                  placeholders: true,
                  pageTokens: { editions: "the editions so far" },
                }),
                copyString({
                  name: "label",
                  title: "Label",
                  max: 60,
                  pageTokens: { since: "the year of the first Makeathon" },
                }),
              ],
            }),
          ),
        }),
        copyString({
          name: "editionsTitle",
          title: "Editions title",
          max: 40,
        }),
        contentImageField({
          name: "editionsPhoto",
          title: "Editions photo",
          required: true,
        }),
        copyString({
          name: "editionsPhotoCaption",
          title: "Editions photo caption",
          description: "What, where and when the photo shows, factually.",
          max: 80,
        }),
        defineField({
          name: "editions",
          title: "Editions",
          type: "array",
          description:
            "Every Makeathon, oldest first. The ribbon draws them all: incomplete editions fail the page content validation.",
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
        copyString({
          name: "moreLabel",
          title: "More link",
          description:
            "Under the latest few hackathons, the link to the rest on the events page.",
          max: 60,
        }),
      ],
    }),
    defineField({
      name: "league",
      title: "League",
      type: "object",
      description:
        "The league's name, season, partners and site are site facts; this is the band's wording.",
      fields: [
        copyString({
          name: "eyebrow",
          title: "Eyebrow",
          max: 40,
          placeholders: true,
        }),
        copyString({
          name: "tagline",
          title: "Tagline",
          description: "The season in one line, under the league's name.",
          max: 80,
          placeholders: true,
        }),
        copyText({ name: "lead", title: "Lead", max: 320, placeholders: true }),
        copyString({ name: "linkLabel", title: "Link label", max: 40 }),
        copyString({
          name: "routeLabel",
          title: "Route label",
          description: "Read by screen readers for the season's route.",
          max: 60,
        }),
        copyString({
          name: "makeathonDetail",
          title: "Makeathon match note",
          description: "Under the match that was a Makeathon.",
          max: 30,
        }),
        defineField({
          name: "finale",
          title: "Grand Finale",
          type: "object",
          fields: [
            copyString({ name: "label", title: "Label", max: 30 }),
            copyText({
              name: "text",
              title: "Before the finale",
              max: 160,
              rows: 2,
              placeholders: true,
            }),
            copyString({
              name: "liveLabel",
              title: "While it runs",
              description: "In place of the countdown during the finale.",
              max: 20,
            }),
            copyText({
              name: "pastText",
              title: "After the finale",
              description: "Shown until the champion is entered below.",
              max: 160,
              rows: 2,
              placeholders: true,
            }),
            copyString({ name: "actionLabel", title: "Button", max: 40 }),
            copyString({
              name: "standingsLabel",
              title: "Button after the finale",
              max: 40,
            }),
            contentImageField({
              name: "poster",
              title: "Poster",
              required: true,
            }),
            copyString({
              name: "championLabel",
              title: "Champion label",
              max: 40,
            }),
            copyString({
              name: "champion",
              title: "Champion",
              description:
                "The winning team, once the finale is over. Filling it in shows the result instead of the poster.",
              max: 40,
              required: false,
            }),
            copyString({
              name: "runnersUpLabel",
              title: "Runners-up label",
              max: 30,
            }),
            copyStringList({
              name: "runnersUp",
              title: "Runners-up",
              description: "Second and third place, in order.",
              max: 40,
              maxItems: 2,
              required: false,
            }),
            contentImageField({
              name: "recapPhoto",
              title: "Recap photo",
              description:
                "A photo from the finale; it replaces the poster once the champion is entered.",
            }),
            copyString({
              name: "recapCaption",
              title: "Recap photo caption",
              description: "What, where and when the photo shows, factually.",
              max: 80,
              required: false,
            }),
          ],
        }),
        copyString({
          name: "partnersTitle",
          title: "Partners title",
          max: 40,
        }),
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
