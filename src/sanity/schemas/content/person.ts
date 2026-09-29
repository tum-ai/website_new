import { defineField, defineType } from "sanity";
import {
  type PersonPlacement,
  personPlacements,
} from "../../../lib/people-and-logos";
import { kebabKey, portraitField, uniqueKey } from "./image-rules";

type Context = { document?: Record<string, unknown> };

const placementOf = ({ document }: Context) =>
  document?.placement as PersonPlacement | undefined;

/** Hides a field unless the document's placement is one of `placements`. */
const onlyFor =
  (...placements: PersonPlacement[]) =>
  (context: Context) => {
    const placement = placementOf(context);
    return !placement || !placements.includes(placement);
  };

/** Requires a value when the document's placement is one of `placements`. */
const requiredFor =
  (message: string, ...placements: PersonPlacement[]) =>
  (value: unknown, context: Context) => {
    const placement = placementOf(context);
    if (!placement || !placements.includes(placement)) return true;
    return typeof value === "string"
      ? value.trim()
        ? true
        : message
      : value
        ? true
        : message;
  };

/**
 * A person as one page shows them: a member story (/community), a partner
 * profile (/partners) or an E-Lab testimonial (/e-lab, homepage). One
 * document per appearance, since role and portrait differ per page. Code
 * picks people by `key` (the E-Lab voices, the traced venture and the
 * homepage quote), so keys stay stable. Read by `lib/person-content.ts`.
 */
export const personType = defineType({
  name: "person",
  title: "Person",
  type: "document",
  description:
    "Someone quoted or profiled on a page. One document per page: a member who is also a partner profile has two.",
  fields: [
    defineField({
      name: "placement",
      title: "Shown as",
      type: "string",
      options: { list: [...personPlacements], layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description:
        "Stable id the site picks this person by: the name in lowercase with hyphens, “leon-hergert”. Don't change it once published: the E-Lab voices, the traced venture and the homepage quote refer to it.",
      validation: (Rule) =>
        Rule.required()
          .regex(kebabKey, { name: "lowercase words joined by hyphens" })
          .custom(uniqueKey("person", "placement")),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Position among the people of the same kind, ascending. Leave gaps (10, 20, 30) to insert people later.",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description:
        "One line under the name. Member stories: degree and university (“Computer Science, TUM”). Partner profiles and testimonials: position and organisation (“Partner @ Accel”).",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "context",
      title: "Context",
      type: "string",
      description:
        "Testimonials: the cohort or relation shown with the quote (“E-Lab 3.0”, “Mentor & Investor”); the traced venture's founder must name the traced cohort. Partner profiles: an optional line under the role (“5M raised”).",
      hidden: onlyFor("e-lab-testimonial", "partner-profile"),
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      description: "The person's words, exactly as approved. No quote marks.",
      hidden: onlyFor("e-lab-testimonial"),
      validation: (Rule) =>
        Rule.custom(
          requiredFor("Testimonials need a quote.", "e-lab-testimonial"),
        ).max(280),
    }),
    defineField({
      name: "story",
      title: "Story",
      type: "text",
      rows: 6,
      description:
        "The member's story in their words, one paragraph. The member journey on /community quotes a sentence of some stories word for word: keep that sentence when you edit.",
      hidden: onlyFor("member-story"),
      validation: (Rule) =>
        Rule.custom(
          requiredFor("Member stories need a story.", "member-story"),
        ),
    }),
    portraitField(),
    defineField({
      name: "organization",
      title: "Organisation",
      type: "reference",
      to: [{ type: "organization" }],
      description:
        "Testimonials: the organisation the person speaks for; its light logo is shown with the quote.",
      hidden: onlyFor("e-lab-testimonial"),
      validation: (Rule) =>
        Rule.custom(
          requiredFor(
            "Testimonials need the person's organisation.",
            "e-lab-testimonial",
          ),
        ),
    }),
  ],
  orderings: [
    {
      title: "Page, then order",
      name: "placementOrder",
      by: [
        { field: "placement", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      role: "role",
      placement: "placement",
      media: "portrait",
    },
    prepare: ({ title, role, placement, media }) => ({
      title,
      subtitle: [
        personPlacements.find(({ value }) => value === placement)?.title,
        role,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
