import type { ContentImage } from "./cms-content-model";

/**
 * The shapes of the community content that several pages show: the member
 * journey (/community draws it as a timetable, /apply shows its tracks) and
 * the departments (/community lists them, the homepage counts them). The
 * Studio schemas (`journeyStep`, `department`) use the icon keys, so this
 * lives in `lib`. The content itself is in `features/community/data/` (code)
 * or the CMS (`lib/community-content.ts`). Isomorphic.
 */

/** One core department. */
export type Department = {
  name: string;
  description: string;
  /** A photo of the team or its work, if we have a real one. */
  photo?: ContentImage;
  /** A factual caption for the photo: what, where, when. */
  photoCaption?: string;
};

/**
 * A department as code writes it: `key` names its `department` document in
 * the backfill (`department-<key>`), fixed so renaming a department in code
 * never turns into a second document. Pages never see it.
 */
export type DepartmentTemplate = Department & { key: string };

/**
 * The icons a step can carry, as keys: the CMS stores the key and
 * `features/community/data/member-journey.ts` maps it to a Lucide icon.
 */
export const journeyIconKeys = [
  "rocket",
  "brain",
  "handshake",
  "chart",
  "globe",
  "graduation-cap",
] as const;

export type JourneyIconKey = (typeof journeyIconKeys)[number];

/** One step of the member journey. */
export type JourneyStep = {
  /** Visible step number, e.g. "01" or "02A". Also used for the anchor id. */
  step: string;
  name: string;
  /** One or two sentences. */
  description: string;
  iconKey: JourneyIconKey;
  /**
   * The semester from which the step is open to a member: 0 is the
   * recruiting round that ends with onboarding, 1 the first semester. Taken
   * from the step's own copy ("after your first semester" is 2, "two or
   * more semesters" is 3).
   */
  fromSemester: number;
  /** `event` happens once (onboarding); `ongoing` stays open from then on. */
  span: "event" | "ongoing";
  /**
   * A member who took this step, in their own words: a verbatim sentence
   * from their story in `features/community/data/member-stories.ts` (a test
   * checks it is).
   */
  evidence?: { name: string; excerpt: string };
};

/**
 * One stop on the member journey: a single step, or a fork where members
 * choose one of two parallel tracks.
 */
export type JourneyStage =
  | { kind: "single"; step: JourneyStep }
  | { kind: "fork"; steps: [JourneyStep, JourneyStep] };

/** The steps of a stage, in order. */
export const stageSteps = (stage: JourneyStage): JourneyStep[] =>
  stage.kind === "single" ? [stage.step] : stage.steps;

/**
 * Steps in journey order, each with the number of its stage, as stages:
 * consecutive steps with the same stage number form a fork. `null` when a
 * stage holds more than two steps, which the timetable cannot draw.
 */
export function groupJourneyStages(
  steps: readonly (JourneyStep & { stage: number })[],
): JourneyStage[] | null {
  const groups: JourneyStep[][] = [];
  let current: number | undefined;
  for (const { stage, ...step } of steps) {
    if (stage === current) groups[groups.length - 1].push(step);
    else groups.push([step]);
    current = stage;
  }
  if (groups.some((group) => group.length > 2)) return null;
  return groups.map((group) =>
    group.length === 1
      ? { kind: "single", step: group[0] }
      : { kind: "fork", steps: [group[0], group[1]] },
  );
}
