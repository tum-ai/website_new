import { defineField, defineType } from "sanity";
import { validateMunichTime } from "./application-window";

/**
 * A dated campaign: while it runs, the site promotes something, today a
 * different header button and a featured event. Read by `getCampaigns()` in
 * `src/config/schedule-content.ts`; `resolveActiveCampaigns` in
 * `src/config/campaigns.ts` decides which one is in effect. Code has no
 * campaigns: without one, the header follows the site settings.
 *
 * Dates and times are Munich wall-clock time, like the application windows
 * (see `application-window.ts` for why `date` + "HH:MM" and not `datetime`).
 */

/** The header buttons a campaign can show. */
const campaignCtaVariants = [
  { title: "Become a Member (/apply)", value: "member" },
  { title: "Become a Partner (/partners)", value: "partner" },
  { title: "Explore the current E-Lab cohort (/e-lab)", value: "elab" },
  { title: "Get Notified (the signup link below)", value: "notify" },
] as const;

type ValidationContext = {
  document?: Record<string, unknown>;
  parent?: unknown;
};

/**
 * The end is after the start: a later end day, or the same day with a later
 * end time (a missing start time is midnight, a missing end time is the end
 * of the day).
 */
export function validateCampaignEnd(
  value: unknown,
  { document }: ValidationContext,
): true | string {
  const startDate = document?.startDate;
  if (typeof value !== "string" || typeof startDate !== "string") return true;
  if (value > startDate) return true;
  if (value < startDate)
    return "The campaign must end on or after its first day.";
  const startTime =
    typeof document?.startTime === "string" ? document.startTime : "00:00";
  const endTime =
    typeof document?.endTime === "string" ? document.endTime : "24:00";
  return endTime > startTime
    ? true
    : "On a one-day campaign, the end time must be after the start time.";
}

/** A `notify` button needs somewhere to send people. */
export function validateNotifyUrl(
  value: unknown,
  { parent }: ValidationContext,
): true | string {
  const variant = (parent as { variant?: unknown } | undefined)?.variant;
  return variant === "notify" && !value
    ? "“Get Notified” needs the signup link."
    : true;
}

export const campaignType = defineType({
  name: "campaign",
  title: "Campaign",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "For editors only, for example “E-Lab applications autumn”. Not shown on the site.",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "startDate",
      title: "First day",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
      description: "The campaign starts on this day, in Munich.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start time",
      type: "string",
      description:
        "Optional, Munich time as HH:MM. Empty: from midnight at the start of the first day.",
      validation: (Rule) => Rule.custom(validateMunichTime),
    }),
    defineField({
      name: "endDate",
      title: "Last day",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
      description:
        "Optional. Empty: the campaign runs until you set a last day or delete it.",
      validation: (Rule) => Rule.custom(validateCampaignEnd),
    }),
    defineField({
      name: "endTime",
      title: "End time",
      type: "string",
      description:
        "Optional, Munich time as HH:MM; the campaign stops at exactly this minute. Empty: at the end of the last day.",
      hidden: ({ document }) => !document?.endDate,
      validation: (Rule) => Rule.custom(validateMunichTime),
    }),
    defineField({
      name: "headerCta",
      title: "Header button",
      type: "object",
      description:
        "Optional. The button at the end of the header while the campaign runs. When two campaigns overlap, the one that started last wins.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "variant",
          title: "Button",
          type: "string",
          options: { list: [...campaignCtaVariants], layout: "radio" },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          description:
            "Optional. Replaces the button's usual text; keep it short (two or three words).",
          validation: (Rule) => Rule.max(30),
        }),
        defineField({
          name: "notifyUrl",
          title: "Signup link",
          type: "url",
          description:
            "Where “Get Notified” leads: a signup form (https://) or an email address (mailto:).",
          hidden: ({ parent }) =>
            (parent as { variant?: string } | undefined)?.variant !== "notify",
          validation: (Rule) =>
            Rule.uri({ scheme: ["https", "mailto"] }).custom(validateNotifyUrl),
        }),
        defineField({
          name: "yieldsToRecruiting",
          title: "Give way to membership recruiting",
          type: "boolean",
          description:
            "On: while membership applications are open, the header still says “Become a Member”, and this button shows the rest of the time. Off: this button shows for the whole campaign.",
          initialValue: true,
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "featuredEventId",
      title: "Featured event",
      type: "string",
      description:
        "Optional. The document ID of an event (open it under Events, then copy the ID from the address bar or the document inspector).",
      validation: (Rule) =>
        Rule.regex(/^[A-Za-z0-9._-]+$/, { name: "document ID" }).max(128),
    }),
  ],
  orderings: [
    {
      title: "Latest first",
      name: "startDesc",
      by: [
        { field: "startDate", direction: "desc" },
        { field: "startTime", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      startDate: "startDate",
      endDate: "endDate",
      variant: "headerCta.variant",
    },
    prepare: ({ title, startDate, endDate, variant }) => ({
      title,
      subtitle: [
        [startDate, endDate ?? "open-ended"].filter(Boolean).join(" to "),
        variant && `header: ${variant}`,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
