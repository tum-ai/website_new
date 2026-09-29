/**
 * The partnership finder's answers and the formats it recommends: the code
 * copy of the finder part of the CMS `partnersCopy` singleton
 * (`features/partners/content.ts`). Its own module because the finder and
 * the contact actions are client islands: this keeps the rest of the page
 * copy, and the config facts it reads, out of their bundle.
 */

export const partnershipIntents = [
  {
    id: "talent",
    label: "Hiring top AI talent",
    shortLabel: "Hiring top AI talent",
    detail: "Meet your next exceptional hire.",
  },
  {
    id: "hackathon",
    label: "Running a hackathon or challenge",
    shortLabel: "Hackathon challenge",
    detail: "Put a real challenge in brilliant hands.",
  },
  {
    id: "brand",
    label: "Brand visibility in the community",
    shortLabel: "Brand visibility",
    detail: "Be part of the conversation.",
  },
  {
    id: "research",
    label: "A research collaboration",
    shortLabel: "Research collaboration",
    detail: "Explore what comes next, together.",
  },
] as const;

export type PartnershipIntent = (typeof partnershipIntents)[number]["id"];
export type PartnershipDuration = "one-off" | "ongoing";

/** A goal the finder offers; the ids are fixed, the wording is copy. */
export type PartnershipIntentCopy = {
  id: PartnershipIntent;
  label: string;
  /** For the email subject: "Partnership request: …". */
  shortLabel: string;
  detail: string;
};

/** A timeframe the finder offers. */
export type PartnershipDurationCopy = {
  id: PartnershipDuration;
  label: string;
  detail: string;
};

export const partnershipDurations = [
  {
    id: "one-off",
    label: "A one-off activation",
    detail: "One focused opportunity to make an impact.",
  },
  {
    id: "ongoing",
    label: "An ongoing, strategic relationship",
    detail: "Build a lasting presence across our ecosystem.",
  },
] as const;

/** A format the finder recommends. */
type PartnershipRecommendation = { name: string; description: string };

export const recommendations = {
  longTerm: {
    name: "Long-Term Partnership",
    description:
      "A year-long relationship across our whole ecosystem, built around your goals. What you can pack into it: curated talent profiles in a dedicated Partner Dashboard and Jobboard access, co-organized events, workshops and exclusive company visits, brand visibility across our LinkedIn, newsletter and major events, and first choice on hackathon slots. Scales from a lightweight setup all the way to founding-partner level.",
  },
  hackathon: {
    name: "Hackathon Participation",
    description:
      "Bring your challenge to one of our hackathons (our signature Makeathon or a European Hackathon League stop in Munich, Berlin, Zurich or Paris). What you can pack into it: your own challenge track, the participant list including CVs, on-site branding and a booth, a company pitch, and optional add-ons like a workshop slot or catering sponsorship.",
  },
  talent: {
    name: "Talent Activation",
    description:
      "The fastest way to get in front of our talent for hiring. What you can pack into it: job postings to our community, access to the CV database, and a targeted mail to the community. Easy to upgrade into a Long-Term Partnership later.",
  },
  brand: {
    name: "Community & Brand Activation",
    description:
      "Put your brand in front of the community where Europe's next AI companies are being built. What you can pack into it: visibility across our 20k+ LinkedIn audience and newsletter, a networking event invitation, and a custom mail to the community.",
  },
  research: {
    name: "Research Collaboration",
    description:
      "Work directly with our research teams and frontier-lab network (MIT, IBM, Cambridge, Harvard). What you can pack into it: shaping the research agenda, joint projects, and a path to NeurIPS, ICML and ICLR publications.",
  },
} as const;

/** The formats by key; `partnerships.ts` picks one from the answers. */
export type PartnershipRecommendations = Record<
  keyof typeof recommendations,
  PartnershipRecommendation
>;

/**
 * What the finder's client islands need: the answers and the formats. The
 * page passes it from the server (`PartnershipProvider`'s `copy`), so CMS
 * wording reaches the finder, the email and the booking notes.
 */
export type PartnershipFinderCopy = {
  intents: readonly PartnershipIntentCopy[];
  durations: readonly PartnershipDurationCopy[];
  recommendations: PartnershipRecommendations;
};

/** The finder's code copy. */
export const partnershipFinderCopy: PartnershipFinderCopy = {
  intents: partnershipIntents,
  durations: partnershipDurations,
  recommendations,
};
