import { type StageCopy, stageCopy } from "./selection";

/**
 * The /e-lab page's own copy as code writes it: the code fallback of the
 * `eLabCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts, filled on the server. The application state
 * and its wording come from the E-Lab window; the ventures and voices are
 * their own content.
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
};

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
};
