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
 *   before the colon in the title. `field`, `startYear`, `motif` and
 *   `highlights` dress the project's row on /research; the old site ignores
 *   them.
 * - `event.coHosts`: the new site lists these instead of the names in
 *   `hosts`, which it reads only for an event without any.
 * - `event.city`: any city (the league plays in Paris and Zurich), where the
 *   old site's list offers Munich and Online only.
 */

/**
 * The research tile motifs editors can pick. Each value needs a drawing in
 * `src/features/research/research-motifs.tsx`; TypeGen turns this list into
 * the union the site's motif map must cover, so a value without a drawing
 * fails the typecheck.
 */
const researchMotifOptions = [
  {
    value: "camera-frustum",
    title: "Camera over city blocks (localization, mapping, aerial vision)",
  },
  {
    value: "vector-field",
    title: "Field pulled off true (alignment, safety, bias)",
  },
  {
    value: "decision-tree",
    title: "Branching decision path (agents, planning, tool use)",
  },
  {
    value: "nested-clusters",
    title: "Nested clusters (embeddings, representation learning)",
  },
  {
    value: "long-timeline",
    title: "Long timeline with linked moments (video, time series)",
  },
  {
    value: "splat-graph",
    title: "Gaussian splats with a scene graph (3D and 4D reconstruction)",
  },
  {
    value: "phase-diagram",
    title: "Ternary phase diagram (materials, chemistry)",
  },
] as const;

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
        "The labs and institutions of this project, in the order the page cites them. The new site numbers these instead of the names before the colon in the title; keep that lead in the title while the old site still reads it. Their logos fill the project's tile on /research.",
    }),
    defineField({
      name: "field",
      title: "Field",
      type: "string",
      description:
        "The research area in two or three words (“LLM safety”, “Materials science”, “Surgical AI”). /research shows it before the status.",
      validation: (Rule) => Rule.max(32),
    }),
    defineField({
      name: "startYear",
      title: "Started",
      type: "number",
      description:
        "The year the project started; /research shows “Since 2025” on an ongoing project.",
      validation: (Rule) => Rule.integer().min(2020).max(2100),
    }),
    defineField({
      name: "motif",
      title: "Motif",
      type: "string",
      description:
        "The line drawing behind the logos on the project's tile on /research, picked for its subject. Leave empty for a plain tile. Add a new motif in code (src/features/research/research-motifs.tsx) before listing it here.",
      options: { list: [...researchMotifOptions], layout: "radio" },
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          validation: (Rule) => Rule.max(32),
        }),
      ],
      description:
        "Up to three concrete facts from the project or its paper (“2.3M single cells”, “GNSS-free”). /research lists them under the tile. Only facts you can source; leave empty otherwise.",
      validation: (Rule) => Rule.max(3).unique(),
    }),
  ]),
});

/** The old site's co-host names, deprecated where organisations exist. */
const legacyHostsField = (field: FieldDefinition): FieldDefinition =>
  field.name === "hosts"
    ? {
        ...field,
        title: "Co-host names (old site)",
        description:
          "The old site's co-host names. The new site lists “Co-hosts” above and reads these names only for an event without any.",
        deprecated: {
          reason:
            "Add the organisations to “Co-hosts”; pnpm sanity:migrate-org-references converts these names.",
        },
      }
    : field;

/** Any city, written as the event's own page names it. */
const openCityField = (field: FieldDefinition): FieldDefinition =>
  field.name === "city"
    ? defineField({
        name: "city",
        title: "City",
        type: "string",
        description:
          "Where it takes place: “Munich”, “Paris”, “Zurich”, or “Online” for a virtual event.",
        validation: (Rule) => Rule.max(40),
      })
    : field;

const eventWithCoHosts = defineType({
  ...eventType,
  fields: withFieldsAfter(
    eventType.fields.map(legacyHostsField).map(openCityField),
    "category",
    [
      organizationList({
        name: "coHosts",
        title: "Co-hosts",
        description:
          "Companies, labs and initiatives that ran or backed the event with TUM.ai: co-hosts, sponsors and challenge partners. Not speakers or jury members. /events lists every one in its hero, with its logo for dark backgrounds when it has one.",
      }),
    ],
  ),
});

/**
 * The old site's types with their organisation references, for every
 * dataset with page content (`sanity.config.ts`).
 */
export const liveTypesWithReferences = [
  researchWithInstitutions,
  eventWithCoHosts,
  partnerType,
];
