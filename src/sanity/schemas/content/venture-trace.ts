import { defineField, defineType, type ValidationContext } from "sanity";
import { logoListDocumentId } from "../../../lib/people-and-logos";
import { sanityApiVersion } from "../../../lib/sanity-config";

const published = '!(_id in path("drafts.**"))';

/**
 * The trace's cohort must be the founder's context, word for word: the
 * lead names the cohort and the founder's quote card names the context, so
 * two different cohorts would contradict each other. The page renders the
 * code trace instead of a mismatched one (`features/e-lab/venture-content.ts`),
 * also when the founder's published testimonial has no context. Exported
 * for tests.
 */
export function cohortProblem(
  cohort: unknown,
  founderContext: unknown,
): true | string {
  if (typeof cohort !== "string" || !cohort.trim()) return true;
  if (typeof founderContext !== "string" || !founderContext.trim()) {
    return "The founder's published testimonial names no cohort: set its context to this cohort first.";
  }
  return cohort.trim() === founderContext.trim()
    ? true
    : `The founder's testimonial names “${founderContext.trim()}”. Use the same cohort here, or change the testimonial's context first.`;
}

/** {@link cohortProblem} against the picked founder's published context. */
async function validateCohort(cohort: unknown, context: ValidationContext) {
  const person = (context.document?.person as { _ref?: string } | undefined)
    ?._ref;
  if (!person) return true;
  const founderContext = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<string | null>(`*[_id == $id && ${published}][0].context`, {
      id: person,
    });
  return cohortProblem(cohort, founderContext);
}

/**
 * The venture must be in the published E-Lab ventures logo list: the
 * section finds the traced venture there and hides without it. Without a
 * published list the page shows the code list, which this cannot check.
 * Exported for tests.
 */
export async function validateListedVenture(
  venture: unknown,
  context: ValidationContext,
): Promise<true | string> {
  const id = (venture as { _ref?: string } | undefined)?._ref;
  if (!id) return true;
  const listed = await context
    .getClient({ apiVersion: sanityApiVersion })
    .fetch<string[] | null>(
      `*[_id == $list && ${published}][0].organizations[]._ref`,
      { list: logoListDocumentId("e-lab-ventures") },
    );
  if (!listed) return true;
  return listed.includes(id)
    ? true
    : "Add this organisation to the E-Lab ventures logo list first: the section hides a venture that is not in it.";
}

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
      validation: (Rule) => Rule.required().custom(validateListedVenture),
    }),
    defineField({
      name: "person",
      title: "Founder quote",
      type: "reference",
      to: [{ type: "person" }],
      options: { filter: 'placement == "e-lab-testimonial"' },
      description:
        "An E-Lab testimonial by one of the venture's founders. Its context must name the cohort below.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "cohort",
      title: "Cohort",
      type: "string",
      description:
        "The cohort the venture came out of, as the lead names it: “E-Lab 1.0”. It must match the founder's testimonial context.",
      validation: (Rule) => Rule.required().max(20).custom(validateCohort),
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
