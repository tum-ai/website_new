export type PartnershipIntent = "talent" | "hackathon" | "brand" | "research";
export type PartnershipDuration = "one-off" | "ongoing";

/** Isomorphic finder models; all editorial wording is passed by the server. */

type PartnershipIntentCopy = {
  id: PartnershipIntent;
  label: string;
  /** For the email subject: "Partnership request: …". */
  shortLabel: string;
  detail: string;
};

/** A timeframe the finder offers. */
type PartnershipDurationCopy = {
  id: PartnershipDuration;
  label: string;
  detail: string;
};

/** A format the finder recommends. */
type PartnershipRecommendation = { name: string; description: string };

/** The formats by key; `partnerships.ts` picks one from the answers. */
type PartnershipRecommendations = Record<
  "longTerm" | "hackathon" | "talent" | "brand" | "research",
  PartnershipRecommendation
>;

/**
 * The finder's questions and the booking dialog's words. Interface labels
 * (the step names, "Back", "Book a call") and the mail templates stay in
 * code.
 */
type PartnershipPrompts = {
  /** The first question, over the goals. */
  intentQuestion: string;
  /** The second question, over the timeframes. */
  durationQuestion: string;
  /** The result; `{{format}}` becomes the recommended format, highlighted. */
  resultQuestion: string;
  /** Under the hackathon format for an ongoing relationship. */
  firstChoice: string;
  bookingTitle: string;
  /** `{{host}}` becomes who the booking page books (site settings). */
  bookingLead: string;
  /** Shown while the calendar embed has not loaded after 15 seconds. */
  bookingSlow: string;
};

/**
 * What the finder's client islands need: the answers, the formats and the
 * prompts. The page passes it from the server (`PartnershipProvider`'s
 * `copy`), so CMS wording reaches the finder, the booking dialog, the email
 * and the booking notes.
 */
export type PartnershipFinderCopy = {
  intents: readonly PartnershipIntentCopy[];
  durations: readonly PartnershipDurationCopy[];
  recommendations: PartnershipRecommendations;
  prompts: PartnershipPrompts;
};

/** Structural answer order; wording is provided by the CMS. */
export const partnershipIntentIds = [
  "talent",
  "hackathon",
  "brand",
  "research",
] as const;
export const partnershipDurationIds = ["one-off", "ongoing"] as const;
