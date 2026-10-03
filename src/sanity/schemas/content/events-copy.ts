import { defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";

/**
 * The /events page's own copy (one document, `_id` `eventsCopy`): the hero's
 * empty lead, section headings and the closing. The events themselves are `event`
 * documents. Read by
 * `features/events/content.ts`, over the code copy in
 * `features/events/data/copy.ts`.
 */
export const eventsCopyType = defineType({
  name: "eventsCopy",
  title: "Events page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      description:
        "Beside the co-host lockup. While events are listed, the lead counts them instead.",
      fields: [
        copyString({
          name: "emptyLead",
          title: "Lead without events",
          description: "Shown while the page lists no event at all.",
          max: 80,
        }),
      ],
    }),
    defineField({
      name: "upcoming",
      title: "Upcoming",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyText({
          name: "empty",
          title: "Nothing scheduled",
          description: "Shown while no event is upcoming.",
          max: 200,
          rows: 2,
          pageTokens: {
            instagram: "a link to our Instagram",
            linkedin: "a link to our LinkedIn",
          },
        }),
      ],
    }),
    defineField({
      name: "past",
      title: "Past events",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyString({
          name: "lead",
          title: "Lead",
          max: 120,
          pageTokens: { since: "the month of the first event (March 2025)" },
        }),
      ],
    }),
    defineField({
      name: "posters",
      title: "Posters",
      type: "object",
      fields: [
        copyString({ name: "title", title: "Title", max: 30 }),
        copyString({ name: "lead", title: "Lead", max: 120 }),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      description: "The ink band at the end of the page.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description:
            "Set as a lockup, like the hero: a lowercase x between spaces becomes the lockup's cross. Display size, about 11 characters per line on a phone.",
          max: 40,
        }),
        copyText({ name: "lead", title: "Lead", max: 240 }),
        copyString({
          name: "studentsReader",
          title: "Label for students",
          max: 30,
        }),
        copyString({
          name: "nextUp",
          title: "Next event label",
          description: "Before the next event's title and date.",
          max: 20,
        }),
        copyText({
          name: "membership",
          title: "Membership text",
          description: "For students while nothing is scheduled.",
          max: 160,
          rows: 2,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Events page" }) },
});
