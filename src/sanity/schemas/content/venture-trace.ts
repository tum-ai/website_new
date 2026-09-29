import { defineField, defineType } from "sanity";

/**
 * The venture /e-lab follows through the gates ("One team, all the way
 * through."): a singleton. The lead sentence is built in code from the
 * venture's name, the cohort, the first milestone and "now". Read by
 * `features/e-lab/venture-content.ts`.
 */
export const ventureTraceType = defineType({
  name: "ventureTrace",
  title: "E-Lab traced venture",
  type: "document",
  description:
    "The alumni venture /e-lab follows through the gates, with its founder's quote and what it did next.",
  fields: [
    defineField({
      name: "venture",
      title: "Venture",
      type: "reference",
      to: [{ type: "organization" }],
      description:
        "Pick one of the organisations in the E-Lab ventures logo list; the section hides if the venture is not in that list.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "person",
      title: "Founder quote",
      type: "reference",
      to: [{ type: "person" }],
      options: { filter: 'placement == "e-lab-testimonial"' },
      description:
        "An E-Lab testimonial by one of the venture's founders. Its context should name the cohort below.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "cohort",
      title: "Cohort",
      type: "string",
      description:
        "The cohort the venture came out of, as the lead names it: “E-Lab 1.0”.",
      validation: (Rule) => Rule.required().max(20),
    }),
    defineField({
      name: "now",
      title: "What it does now",
      type: "string",
      description:
        "Completes the lead's “… and now …”, lower case, no full stop: “plans supply chains for consumer brands”. Optional.",
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: "milestones",
      title: "After the E-Lab",
      type: "array",
      description:
        "What the venture did next, newest facts last. The first one completes the lead's “went on to …”. Each needs a source the company or its investors publish.",
      of: [
        {
          type: "object",
          name: "milestone",
          fields: [
            defineField({
              name: "text",
              title: "Milestone",
              type: "string",
              validation: (Rule) => Rule.required().max(100),
            }),
            defineField({
              name: "source",
              title: "Source",
              type: "url",
              description: "Where the fact is stated. Not shown on the page.",
              validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "text", subtitle: "source" } },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "venture.name", subtitle: "cohort" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "E-Lab traced venture",
      subtitle,
    }),
  },
});
