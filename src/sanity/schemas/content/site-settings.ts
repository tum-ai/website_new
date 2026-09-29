import { defineField, defineType } from "sanity";
import { getCalBooking } from "../../../lib/security";
import { contentImageField } from "./fields";

/**
 * The `siteSettings` singleton: the facts editors own, read by
 * `getSiteFacts()` in `src/config/site-settings-content.ts` and laid over the
 * config constants (`siteFactsFallback` in `src/config/site-facts.ts`), so an
 * empty field shows the code value. Counts render as lower bounds with a
 * trailing "+". Derived figures (official members, completed cohorts, the
 * program summary) are computed from these fields, never stored.
 *
 * Kept in code on purpose: the legal entity and Imprint (the board reviews
 * that wording), the site URL and SEO, and the navigation structure.
 */

const countField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "number",
    description,
    validation: (Rule) => Rule.required().integer().min(0),
  });

const httpsLink = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "url",
    description,
    validation: (Rule) => Rule.required().uri({ scheme: ["https"] }),
  });

const roleEmail = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "string",
    description,
    validation: (Rule) => Rule.required().email(),
  });

/** The funnel's gates, widest first: each must be at most the one before. */
const funnelGates = [
  ["applications", "Team applications"],
  ["admitted", "Teams admitted"],
  ["midterm", "Teams at the Midterm Pitch"],
  ["selectionDay", "Teams on Selection Day"],
  ["finalPitch", "Teams at the Final Pitch"],
] as const;

/**
 * Every gate of the selection funnel is at most the one before, because
 * /e-lab draws them to scale against each other.
 */
export function validateFunnel(value: unknown): true | string {
  if (typeof value !== "object" || value === null) return true;
  const figures = value as Record<string, unknown>;
  for (let index = 1; index < funnelGates.length; index++) {
    const [key, title] = funnelGates[index];
    const [previousKey, previousTitle] = funnelGates[index - 1];
    const current = figures[key];
    const previous = figures[previousKey];
    if (
      typeof current === "number" &&
      typeof previous === "number" &&
      current > previous
    ) {
      return `${title} (${current}) can't be more than ${previousTitle.toLowerCase()} (${previous}).`;
    }
  }
  return true;
}

/**
 * The booking page must be on cal.eu or cal.com: the site loads the booking
 * embed's script from that host (`getCalBooking` in `lib/security.ts`).
 */
export function validateBookingUrl(value: unknown): true | string {
  if (typeof value !== "string" || value === "") return true;
  return getCalBooking(value)
    ? true
    : "Use a booking page on cal.eu or cal.com, such as https://cal.eu/<name>/<event>.";
}

/** The header CTAs editors can pick as the default (each has a page to link to). */
const headerCtaFallbackOptions = [
  { title: "Become a Partner (/partners)", value: "partner" },
  { title: "Become a Member (/apply)", value: "member" },
  { title: "Explore the current E-Lab cohort (/e-lab)", value: "elab" },
] as const;

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "organization", title: "Organization", default: true },
    { name: "contact", title: "Contact and social" },
    { name: "eLab", title: "E-Lab" },
    { name: "site", title: "Header and footer" },
  ],
  fields: [
    defineField({
      name: "organization",
      title: "Headline figures",
      type: "object",
      group: "organization",
      description:
        "The numbers the landing, Apply, Community and Partners pages quote. Counts are lower bounds: the site adds a “+”.",
      options: { columns: 2 },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "foundingYear",
          title: "Founding year",
          type: "number",
          validation: (Rule) => Rule.required().integer().min(2000).max(2100),
        }),
        countField(
          "activeMembers",
          "Active members",
          "Members active this semester.",
        ),
        countField("alumni", "Alumni", "Former members."),
        countField("majors", "Majors", "Study programs our members come from."),
        countField(
          "universities",
          "Universities",
          "Universities our members study at.",
        ),
        countField(
          "nationalities",
          "Nationalities",
          "Nationalities in the community.",
        ),
      ],
    }),
    defineField({
      name: "brandMission",
      title: "Mission statement",
      type: "text",
      rows: 3,
      group: "organization",
      description:
        "Quoted on /apply and opens /qanda. Change it only together with the brand guide.",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "impact",
      title: "Research and hackathons",
      type: "object",
      group: "organization",
      validation: (Rule) => Rule.required(),
      fields: [
        countField(
          "publications",
          "Peer-reviewed papers",
          "Papers by members from TUM.ai research projects.",
        ),
        defineField({
          name: "publicationVenues",
          title: "Venues",
          type: "array",
          of: [{ type: "string" }],
          description:
            "Where those papers appeared, most prominent first. The site joins them into a sentence.",
          validation: (Rule) => Rule.required().min(1).max(6).unique(),
        }),
        countField(
          "hackathonParticipants",
          "Hackathon participants",
          "Participants across all TUM.ai hackathons so far.",
        ),
      ],
    }),
    defineField({
      name: "community",
      title: "Community",
      type: "object",
      group: "organization",
      validation: (Rule) => Rule.required(),
      fields: [
        countField(
          "makeathonSize",
          "Makeathon size",
          "Size of the signature Makeathon; shown with “+” or “over”.",
        ),
      ],
    }),
    defineField({
      name: "contactEmails",
      title: "Role email addresses",
      type: "object",
      group: "contact",
      description:
        "Shared team inboxes only, never a personal address. The Imprint keeps its own address in code.",
      validation: (Rule) => Rule.required(),
      fields: [
        roleEmail(
          "general",
          "General",
          "Header, footer and general questions.",
        ),
        roleEmail(
          "partners",
          "Partnerships",
          "Partner requests from /partners.",
        ),
        roleEmail("venture", "Venture", "E-Lab and startup questions."),
        roleEmail(
          "recruitment",
          "Recruitment",
          "Membership questions; the Apply FAQ names it.",
        ),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social profiles",
      type: "object",
      group: "contact",
      description: "Full https:// links to TUM.ai's own profiles.",
      options: { columns: 2 },
      validation: (Rule) => Rule.required(),
      fields: [
        httpsLink("linkedin", "LinkedIn"),
        httpsLink("instagram", "Instagram"),
        httpsLink("github", "GitHub"),
        httpsLink("x", "X"),
        httpsLink("youtube", "YouTube"),
        httpsLink("facebook", "Facebook"),
        httpsLink("tiktok", "TikTok"),
        httpsLink(
          "slack",
          "Slack invite",
          "The public workspace's invite link.",
        ),
      ],
    }),
    defineField({
      name: "partnershipBooking",
      title: "Partnership call booking",
      type: "object",
      group: "contact",
      description:
        "The booking page behind “Book a call” on /partners. Change both fields together when the partnership leads hand over.",
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "bookingUrl",
          title: "Booking page",
          type: "url",
          description:
            "The Cal.eu (or Cal.com) page the dialog embeds, such as https://cal.eu/<name>/<event>.",
          validation: (Rule) =>
            Rule.required()
              .uri({ scheme: ["https"] })
              .custom((value) => validateBookingUrl(value)),
        }),
        defineField({
          name: "bookingHost",
          title: "Host's first name",
          type: "string",
          description: "Introduces the call as a chat with this person.",
          validation: (Rule) => Rule.required().max(40),
        }),
      ],
    }),
    defineField({
      name: "eLab",
      title: "E-Lab program",
      type: "object",
      group: "eLab",
      description:
        "The program facts. The application deadline and form live in the E-Lab application window.",
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: "currentIteration",
          title: "Current cohort",
          type: "string",
          description:
            "The cohort now running or recruiting, as a number with one decimal (for example 6.0). Earlier cohorts count as completed.",
          validation: (Rule) =>
            Rule.required().regex(/^\d{1,2}\.\d$/, { name: "cohort number" }),
        }),
        defineField({
          name: "programWeeks",
          title: "Program length (weeks)",
          type: "number",
          validation: (Rule) => Rule.required().integer().min(1).max(52),
        }),
        defineField({
          name: "ventureFundingMillions",
          title: "Funding raised by E-Lab ventures (million euros)",
          type: "number",
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: "selection",
          title: "Selection funnel",
          type: "object",
          description:
            "Teams at each gate of one cohort (a solo applicant counts as a team). /e-lab draws the gates to scale, so each number must be at most the one before.",
          options: { columns: 2 },
          validation: (Rule) =>
            Rule.required().custom((value) => validateFunnel(value)),
          fields: funnelGates.map(([name, title]) =>
            defineField({
              name,
              title,
              type: "number",
              validation: (Rule) => Rule.required().integer().min(1),
            }),
          ),
        }),
        contentImageField({
          name: "heroLogo",
          title: "Cohort logo",
          description:
            "White artwork for the dark /e-lab hero. Change it together with the current cohort.",
          required: true,
        }),
      ],
    }),
    defineField({
      name: "footerTagline",
      title: "Footer tagline",
      type: "string",
      group: "site",
      description: "The line under the logo in the footer on every page.",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "headerCtaFallback",
      title: "Default header button",
      type: "string",
      group: "site",
      description:
        "What the header's button offers while membership applications are closed and no campaign sets another one. During a recruiting round it says “Become a Member”.",
      options: { list: [...headerCtaFallbackOptions], layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
