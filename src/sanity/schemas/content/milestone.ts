import { defineField, defineType } from "sanity";
import { copyString, orderField } from "./copy-fields";

/** The rows of the /apply programme grid (the labels are set in code). */
const milestoneKinds = [
  { title: "Research", value: "research" },
  { title: "Programs", value: "programs" },
  { title: "Events and hackathons", value: "events" },
  { title: "Organization", value: "organization" },
];

/**
 * One thing TUM.ai's members started, in the year they started it: a cell
 * entry of the "Since 2020" programme grid on /apply (a row per kind, a
 * column per year). Read and validated by `features/apply/content.ts`.
 */
export const milestoneType = defineType({
  name: "milestone",
  title: "Milestone",
  type: "document",
  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      description:
        "The grid gets a column for every year from the earliest milestone to the latest.",
      validation: (Rule) => Rule.required().integer().min(2020).max(2100),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description: "The grid's row.",
      options: { list: milestoneKinds, layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    orderField(),
    copyString({
      name: "title",
      title: "Title",
      description:
        "A few words, set in the grid cell. Unique within its year (it keys the cell's list).",
      max: 40,
    }),
    copyString({
      name: "detail",
      title: "Detail",
      description: "Optional: the rest of the fact, under the title.",
      max: 120,
      required: false,
      placeholders: true,
    }),
  ],
  orderings: [
    {
      title: "Year, then order",
      name: "yearOrder",
      by: [
        { field: "year", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", year: "year", kind: "kind" },
    prepare: ({ title, year, kind }) => ({
      title,
      subtitle: [year, kind].filter(Boolean).join(" · "),
    }),
  },
});
