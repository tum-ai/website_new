import { type StageCopy, stageCopy } from "./selection";

/**
 * The /e-lab page's own copy as code writes it: the code fallback of the
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

export const eLabCopyTemplate: ELabCopy = {
  hero: {
    title: "{{eLab.programWeeks}} weeks from kickoff to the Final Pitch.",
    lead: "The E-Lab is TUM.ai's equity-free AI startup incubator, in person in Munich; its ventures have raised €{{eLab.ventureFundingMillions}}M so far. Apply alone or as a team, with or without an idea. You don't need to be enrolled anywhere.",
  },
  gates: {
    title: "Every team passes the same gates.",
    lead: "Each bar is drawn to scale: the teams that reach a gate, out of every team that applied. Between the gates, you build.",
    scaleLabel: "Teams",
    stages: stageCopy,
  },
  field: {
    caption: "Every dot is a team that applied. Be the one that stands out.",
    inviteLabel: "Your team",
  },
  ventures: {
    title: "One team, all the way through.",
    fundingNote:
      "raised so far by ventures from {{eLab.completedCohorts}} E-Lab cohorts, including these.",
    logosLabel: "Ventures from the E-Lab",
  },
  voices: {
    title: "Founders and investors on the E-Lab.",
    lead: "Founders from earlier cohorts, and investors and partners who work with the E-Lab.",
    foundersLabel: "Founders",
    investorsLabel: "Investors and partners",
  },
  closing: {
    title:
      "Every Final Pitch starts as one of about {{applications}} applications.",
    followLabel: "Follow TUM.ai on LinkedIn",
    partnersReader: "For investors and companies",
    // TODO(content): confirm with the Venture team that partners mentor
    // teams and attend the Final Pitch.
    partnersText:
      "Mentor a team, give feedback and meet the founders at the Final Pitch.",
  },
};
