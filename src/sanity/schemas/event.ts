import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "External Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "desc",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "event_date",
      title: "Start Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "end_date",
      title: "End Date & Time",
      type: "datetime",
      description:
        "Optional. Use this if the event spans multiple days or has a strict end time.",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      options: {
        list: [
          { title: "Munich", value: "Munich" },
          { title: "Online", value: "Online" },
        ],
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Hackathon", value: "Hackathon" },
          { title: "Speaker", value: "Speaker" },
          { title: "Event", value: "Event" },
          { title: "E-Lab", value: "E-Lab" },
        ],
      },
    }),
    defineField({
      name: "hosts",
      title: "Co-hosts",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        'Companies, labs and initiatives that ran or backed the event with TUM.ai: co-hosts, sponsors and challenge partners, one name each (e.g. "Anthropic"). Not speakers or jury members. /events lists every name in its hero.',
    }),
    defineField({
      name: "poster",
      title: "Poster",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "img",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sign_up",
      title: "Sign Up Link or Status",
      type: "string",
      description: 'Enter the URL, or type "closed".',
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "text",
    }),
  ],
});
