import {
  defineArrayMember,
  defineField,
  defineType,
  type FieldDefinition,
} from "sanity";
import { eventType } from "../event";
import { partnerType } from "../partner";
import { researchType } from "../research";

/**
 * The old site's types as the new site's dataset has them: the same fields,
 * plus references to `organization` next to the name strings they replace
 * on the new site. `production` registers the plain types
 * (`../index.ts`): it has no `organization` type, and the old site there
 * reads the strings, so the new fields are additions and the strings stay
 * (docs/adr/0009-cms-content-source.md).
 *
 * - `research.institutions`: the new site cites these instead of the names
 *   before the colon in the title.
 */

/** `fields` with `added` inserted after the field named `after`. */
function withFieldsAfter(
  fields: readonly FieldDefinition[],
  after: string,
  added: readonly FieldDefinition[],
): FieldDefinition[] {
  return fields.flatMap((field) =>
    field.name === after ? [field, ...added] : [field],
  );
}

/** An ordered list of distinct organisations. */
function organizationList({
  name,
  title,
  description,
}: {
  name: string;
  title: string;
  description: string;
}) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({ type: "reference", to: [{ type: "organization" }] }),
    ],
    validation: (Rule) => Rule.unique(),
  });
}

const researchWithInstitutions = defineType({
  ...researchType,
  fields: withFieldsAfter(researchType.fields, "title", [
    organizationList({
      name: "institutions",
      title: "Institutions",
      description:
        "The labs and institutions of this project, in the order the page cites them. The new site numbers these instead of the names before the colon in the title; keep that lead in the title while the old site still reads it.",
    }),
  ]),
});

/**
 * The old site's types with their organisation references, for every
 * dataset with page content (`sanity.config.ts`).
 */
export const liveTypesWithReferences = [
  researchWithInstitutions,
  eventType,
  partnerType,
];
