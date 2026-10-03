import type { ContentImage } from "@/lib/cms-content-model";

/** A named point with one or two sentences of copy. */
export type Point = { title: string; text: string };

/** When a selection stage happens, filled in from the round's dates. */
export type StageTiming =
  | "deadline"
  | "after-deadline"
  | "interviews"
  | "onboarding";

/** The keys of {@link StageTiming}, for the Studio's list. */
export const stageTimings: readonly StageTiming[] = [
  "deadline",
  "after-deadline",
  "interviews",
  "onboarding",
];

export type ApplyCopy = {
  heroTitle: string;
  /** The hero's second paragraph, under the call's status. */
  heroLead: string;
  /** The hero's second button, to the FAQ. */
  faqLabel: string;
  /** Over the important dates; `{{round}}` is the round's name. */
  datesTitle: string;
  scope: {
    title: string;
    inScopeTitle: string;
    notRequiredTitle: string;
    valuesTitle: string;
    /** What we look for in applicants. */
    qualities: Point[];
    /**
     * What an applicant doesn't need, the call's "out of scope": both from
     * the FAQ's answer on AI proficiency and the members' majors.
     */
    notRequired: Point[];
    /** The four values in one sentence each, every fact kept. */
    values: Point[];
    photo: ContentImage;
  };
  tracks: {
    title: string;
    lead: string;
    offeringsTitle: string;
    /** What every member can join besides their track. */
    offerings: Point[];
    photo: ContentImage;
    journeyLink: string;
  };
  selection: {
    title: string;
    /** `{{count}}`: the number of stages, as a capitalized word. */
    lead: string;
    /** The round's stages, in order; `when` is dated from the round. */
    stages: (Point & { when: StageTiming })[];
  };
  history: {
    title: string;
    /** `{{count}}` milestones in `{{years}}` years, in digits. */
    lead: string;
  };
  closing: {
    /** The label over the partners' pitch beside the submission box. */
    companiesReader: string;
  };
};

/** The page tokens of the /apply copy (see `fillPageTokens`). */
export const applyPageTokens = ["count", "years", "round"] as const;
