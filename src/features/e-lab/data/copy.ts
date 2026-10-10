import type { StageCopy } from "./selection";

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
  /** The traced venture and the other alumni ventures. */
  ventures: {
    title: string;
    /** After the funding figure, over the other ventures' logos. */
    fundingNote: string;
    /** The logo wall's name for assistive technology. */
    logosLabel: string;
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
