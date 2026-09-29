import { defineField, defineType, type ValidationContext } from "sanity";
import { journeyIconKeys } from "../../../lib/community-model";
import { sanityApiVersion } from "../../../lib/sanity-config";
import { copyString, copyText, orderField } from "./copy-fields";
import { storyExcerptField } from "./excerpt-rules";

/** A stage holds one step, or a fork of two parallel tracks. */
async function validateStage(stage: unknown, context: ValidationContext) {
  if (typeof stage !== "number") return true;
  const id = (context.document?._id ?? "").replace(/^drafts\./, "");
  const others = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<number>(
      `count(*[_type == "journeyStep" && stage == $stage && !(_id in path("drafts.**")) && _id != $id])`,
      { stage, id },
    );
  return others < 2
    ? true
    : "A stage holds one step, or a fork of two tracks; this one already has two.";
}

/**
 * One step of the member journey: /community draws the steps as a
 * membership timetable, /apply shows the fork's two tracks. Steps with the
 * same stage number form a fork. Read by `lib/community-content.ts`, over
 * the code journey in `features/community/data/member-journey.ts`.
 */
export const journeyStepType = defineType({
  name: "journeyStep",
  title: "Member journey step",
  type: "document",
  fields: [
    orderField(),
    defineField({
      name: "stage",
      title: "Stage",
      type: "number",
      description:
        "The stop on the journey, counted from 1. Two steps with the same stage are a fork: members choose one of the two tracks (order them next to each other).",
      validation: (Rule) =>
        Rule.required().integer().min(1).custom(validateStage),
    }),
    defineField({
      name: "number",
      title: "Step number",
      type: "string",
      description:
        "The visible number, like 01, or 02A and 02B for a fork's tracks. It is also the link anchor (/community#journey-02a), so change it only when you must.",
      validation: (Rule) =>
        Rule.required().regex(/^\d{2}[A-Z]?$/, { name: "step number" }),
    }),
    copyString({
      name: "name",
      title: "Name",
      description: "The step's heading, and the track's name on /apply.",
      max: 40,
    }),
    copyText({
      name: "description",
      title: "Description",
      description:
        "One or two sentences. On a fork's tracks, the Q&A page's member-journey answer lists the first sentence as “In the <name in lower case> you will …”, so start it with a verb (“Join …”).",
      max: 400,
      rows: 4,
    }),
    defineField({
      name: "iconKey",
      title: "Icon",
      type: "string",
      options: { list: [...journeyIconKeys] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fromSemester",
      title: "Opens in semester",
      type: "number",
      description:
        "0 is the recruiting round that ends with onboarding, 1 the first semester. The timetable gets a column up to the latest semester any step opens in.",
      validation: (Rule) => Rule.required().integer().min(0).max(6),
    }),
    defineField({
      name: "span",
      title: "Duration",
      type: "string",
      options: {
        list: [
          { title: "Once (a single event)", value: "event" },
          { title: "Ongoing from then on", value: "ongoing" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "evidence",
      title: "A member's words",
      type: "object",
      description:
        "Optional: a member who took this step, quoted beside it. The quote must be a sentence from their member story, word for word.",
      fields: [
        defineField({
          name: "person",
          title: "Member",
          type: "reference",
          to: [{ type: "person" }],
          options: { filter: 'placement == "member-story"' },
          description:
            "One of the member stories; it supplies the name, role and portrait.",
          validation: (Rule) => Rule.required(),
        }),
        storyExcerptField(),
      ],
    }),
  ],
  orderings: [
    {
      title: "Journey order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { number: "number", name: "name", stage: "stage" },
    prepare: ({ number, name, stage }) => ({
      title: `${number ?? ""} ${name ?? ""}`.trim(),
      subtitle: stage === undefined ? undefined : `Stage ${stage}`,
    }),
  },
});
