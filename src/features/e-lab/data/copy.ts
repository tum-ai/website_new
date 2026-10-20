import type { StageCopy } from "./selection";

/** One figure in a founders row: "$2.2M" over "pre-seed". */
type FounderMetric = { value: string; label: string };

/** One alumni venture in the founders table, in the words Venture supplied. */
export type FounderRow = {
  /** The venture (an organisation): its name and website. */
  key: string;
  name: string;
  href?: string;
  /** The cohort it came from ("ELAB 4.0"), where confirmed. */
  edition?: string;
  /** What it does, in one line. */
  summary: string;
  /** Up to four figures, as given. */
  metrics: FounderMetric[];
  /** Its backers: "Y Combinator F26", then a note on the round. */
  backedBy?: { name: string; note?: string };
};

/** The ways in for partners of the program, one card each. */
export const eLabInvolveKeys = [
  "jury",
  "keynote",
  "workshop",
  "other",
] as const;
export type ELabInvolveKey = (typeof eLabInvolveKeys)[number];

/** A mail to the Venture team about one way in, its subject naming it. */
export function involveMailUrl(email: string, title: string): string {
  const subject = `ELAB: ${title}`;
  const body = "Hi ELAB team,\n\n";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * The /e-lab page's published CMS copy model for the
 * `eLabCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts, filled on the server, and page tokens
 * (`eLabPageTokens`) the sections fill from what they draw. The application
 * state and its wording come from the E-Lab window; the ventures, the traced
 * venture and the voices are their own content.
 */
export type ELabCopy = {
  hero: { title: string; lead: string };
  gates: {
    title: string;
    lead: string;
    /** The label beside the tick scale. */
    scaleLabel: string;
    /** The cohort's gates and phases, in order. */
    stages: StageCopy[];
  };
  /** The hero's dot field. */
  field: {
    /**
     * The figure caption. It may use `{{finalists}}`: the dots still lit;
     * `{{ventures}}`: those that open into ventures; `{{open}}`: those left
     * for new teams.
     */
    caption: string;
    /** A lit dot without a venture, before the cohort's name. */
    inviteLabel: string;
  };
  /** The traced venture and the founders of past batches. */
  ventures: {
    title: string;
    /** After the funding figure, over the founders table. */
    fundingNote: string;
    /** The founders table's heading. */
    foundersTitle: string;
    founders: FounderRow[];
  };
  /** The program's partners in three tiers; the logos are logo lists. */
  partners: {
    title: string;
    lead: string;
    iterationLabel: string;
    workshopLabel: string;
    pastLabel: string;
  };
  /** Ways for companies to take part, each a mail to the Venture team. */
  involve: {
    eyebrow: string;
    title: string;
    lead: string;
    options: { key: ELabInvolveKey; title: string; detail: string }[];
  };
  /** Founders and investors in their own words. */
  voices: {
    title: string;
    lead: string;
    foundersLabel: string;
    investorsLabel: string;
  };
  /** The close on ink, back at the widest gate. */
  closing: {
    /** `{{applications}}`: the team applications of a round. */
    title: string;
    /** The action while applications are closed, to LinkedIn. */
    followLabel: string;
    partnersReader: string;
    partnersText: string;
  };
};

/** The page tokens of the /e-lab copy (see `fillPageTokens`). */
export const eLabPageTokens = [
  "finalists",
  "ventures",
  "open",
  "applications",
] as const;
