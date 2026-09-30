import { defineArrayMember, defineField, defineType } from "sanity";
import { isMunichTime } from "../../../lib/munich-time";

/**
 * An application phase: the membership recruiting round (/apply, the header
 * and the closing bands) or the E-Lab application round (/e-lab). There is
 * one document per program, pinned in the Studio; editors update it in place
 * for each round. Read by `getMembershipWindow()` and `getELabWindow()` in
 * `src/config/schedule-content.ts`, laid over the config
 * (`membershipConfig`, `eLabConfig`).
 *
 * Dates are Sanity `date` fields (a calendar picker, stored as
 * "YYYY-MM-DD" without a timezone) and times are "HH:MM" strings; the site
 * reads both as Munich wall-clock time (`parseMunichDateTime`). A `datetime`
 * field would store a UTC instant and show it in each editor's own browser
 * timezone, which silently moves a deadline for anyone editing from abroad.
 */

/** The programs with an application window, and their pinned document ids. */
export const applicationPrograms = [
  {
    value: "membership",
    title: "Membership recruiting (/apply)",
    documentId: "applicationwindow-membership",
  },
  {
    value: "e-lab",
    title: "E-Lab applications (/e-lab)",
    documentId: "applicationwindow-e-lab",
  },
] as const;

/** Milestones of a membership round, after the deadline. */
const milestoneKeys = [
  { value: "interviews", title: "Interviews" },
  { value: "onboarding", title: "Onboarding weekend" },
] as const;

type ValidationContext = { document?: Record<string, unknown> };

const programOf = ({ document }: ValidationContext) => document?.program;

const onlyFor =
  (program: string) =>
  ({ document }: ValidationContext) =>
    document?.program !== program;

/** Required on the given program's window, hidden on the other. */
const requiredFor =
  (program: string, what: string) =>
  (value: unknown, context: ValidationContext): true | string =>
    programOf(context) === program &&
    (value === undefined || value === null || value === "")
      ? `The ${what} is required.`
      : true;

const dateOptions = { dateFormat: "DD.MM.YYYY" };

/** "HH:MM" in 24-hour time; an empty value is left to `required`. */
export function validateMunichTime(value: unknown): true | string {
  return typeof value !== "string" || isMunichTime(value)
    ? true
    : "Use 24-hour time as HH:MM, for example 23:59.";
}

/**
 * The deadline day is on or after the opening day (ISO days compare as
 * strings); the time of day is checked by the site, which closes at the
 * exact minute.
 */
export function validateDeadlineAfterOpening(
  value: unknown,
  { document }: ValidationContext,
): true | string {
  const opens = document?.opens;
  return typeof value === "string" && typeof opens === "string" && value < opens
    ? "The deadline must be on or after the opening day."
    : true;
}

/**
 * A membership round names each milestone once, each ends on or after it
 * starts, and none starts before the deadline day.
 */
export function validateMilestones(
  value: unknown,
  { document }: ValidationContext,
): true | string {
  if (document?.program !== "membership") return true;
  const items = Array.isArray(value)
    ? (value as { key?: string; from?: string; to?: string }[])
    : [];
  for (const { value: key, title } of milestoneKeys) {
    const matching = items.filter((item) => item.key === key);
    if (matching.length !== 1) {
      return `Add the ${title.toLowerCase()} exactly once.`;
    }
    const [{ from, to }] = matching;
    if (from && to && to < from) {
      return `The ${title.toLowerCase()} must end on or after the day it starts.`;
    }
    const deadline = document?.deadlineDate;
    if (from && typeof deadline === "string" && from < deadline) {
      return `The ${title.toLowerCase()} can't start before the deadline day.`;
    }
  }
  return true;
}

export const applicationWindowType = defineType({
  name: "applicationWindow",
  title: "Application window",
  type: "document",
  fields: [
    defineField({
      name: "program",
      title: "Program",
      type: "string",
      // Set once (by the backfill, or on first edit of a pinned window), then
      // fixed: each program has exactly one window.
      readOnly: ({ value }) => value !== undefined,
      description: "Each program has exactly one window; this can't change.",
      options: {
        list: applicationPrograms.map(({ value, title }) => ({ value, title })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "roundName",
      title: "Round name",
      type: "string",
      description:
        "Who the round recruits for, as /apply shows it (for example “Winter semester 2026/27”).",
      hidden: onlyFor("membership"),
      validation: (Rule) =>
        Rule.max(60).custom(requiredFor("membership", "round name")),
    }),
    defineField({
      name: "switchedOn",
      title: "Applications switched on",
      type: "boolean",
      description:
        "The master switch. On: applications open and close by the dates below. Off: closed now, whatever the dates say (to close early, or between rounds).",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "opens",
      title: "Opening day",
      type: "date",
      options: dateOptions,
      description:
        "The form opens at midnight (Munich time) at the start of this day.",
      hidden: onlyFor("membership"),
      validation: (Rule) =>
        Rule.custom(requiredFor("membership", "opening day")),
    }),
    defineField({
      name: "deadlineDate",
      title: "Deadline day",
      type: "date",
      options: dateOptions,
      description: "The last day to apply, in Munich.",
      validation: (Rule) =>
        Rule.required().custom(validateDeadlineAfterOpening),
    }),
    defineField({
      name: "deadlineTime",
      title: "Deadline time",
      type: "string",
      description:
        "Munich time, HH:MM (for example 23:59). Applications close at exactly this minute.",
      validation: (Rule) => Rule.required().custom(validateMunichTime),
    }),
    defineField({
      name: "applicationUrl",
      title: "Application form",
      type: "url",
      description:
        "The form's full https:// link; the apply buttons open it in a new tab.",
      validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "milestones",
      title: "After the deadline",
      type: "array",
      description:
        "The interviews and the onboarding weekend, each as a span of days. /apply lists them under the important dates.",
      hidden: onlyFor("membership"),
      of: [
        defineArrayMember({
          type: "object",
          name: "milestone",
          fields: [
            defineField({
              name: "key",
              title: "Milestone",
              type: "string",
              options: { list: [...milestoneKeys], layout: "radio" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "from",
              title: "First day",
              type: "date",
              options: dateOptions,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "to",
              title: "Last day",
              type: "date",
              options: dateOptions,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { key: "key", from: "from", to: "to" },
            prepare: ({ key, from, to }) => ({
              title:
                milestoneKeys.find(({ value }) => value === key)?.title ?? key,
              subtitle: [from, to].filter(Boolean).join(" to "),
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.custom(validateMilestones),
    }),
    defineField({
      name: "nextWindowLabel",
      title: "Next round opens",
      type: "string",
      description:
        "Shown while applications are closed, after “Applications open in”, for example “August”.",
      hidden: onlyFor("e-lab"),
      validation: (Rule) =>
        Rule.max(40).custom(requiredFor("e-lab", "next round")),
    }),
  ],
  preview: {
    select: {
      program: "program",
      roundName: "roundName",
      deadlineDate: "deadlineDate",
    },
    prepare: ({ program, roundName, deadlineDate }) => ({
      title:
        applicationPrograms.find(({ value }) => value === program)?.title ??
        "Application window",
      subtitle: [roundName, deadlineDate && `deadline ${deadlineDate}`]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
