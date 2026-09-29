import { eLabConfig } from "@/config/e-lab";
import type { ContentImage } from "@/lib/cms-content-model";
import type { Duration } from "@/lib/program-duration";

/** The selection figures in `eLabConfig.selection`, one per gate. */
export type GateFigure = keyof typeof eLabConfig.selection;

/** A point where teams are selected, with how many reach it. */
export type Gate = {
  kind: "gate";
  id: string;
  name: string;
  /** Teams that reach this gate (`eLabConfig.selection`). */
  teams: number;
  /** The figure is rounded ("about 500"). */
  approximate?: boolean;
  /** What happens at the gate, in one sentence. */
  description: string;
  /**
   * The gate's bar length: its teams as a share of all applications, from 0
   * to 1. The first gate is the whole field, 1.
   */
  share: number;
};

/** A stretch of the program between two gates, where teams build. */
export type Phase = {
  kind: "phase";
  id: string;
  name: string;
  /** How long it runs; the page shows it as "4 weeks" (`formatDuration`). */
  duration: Duration;
  description: string;
  /** A real photo from this phase. */
  photo?: ContentImage;
  /** Its factual caption. */
  photoCaption?: string;
};

/** One stop on the way from the application round to the Final Pitch. */
export type SelectionStage = Gate | Phase;

/**
 * A gate as copy writes it: which selection figure it shows, and its words.
 * The figure and the bar come from the config ({@link buildStages}).
 */
type GateCopy = {
  kind: "gate";
  figure: GateFigure;
  name: string;
  description: string;
  approximate?: boolean;
};

/** A stage as copy writes it: the code fallback of `eLabCopy.stages`. */
export type StageCopy = GateCopy | Phase;

/**
 * One E-Lab cohort in order: the gates where teams are selected, and the
 * program phases between them. /e-lab draws each gate's bar to scale from
 * its figure in `eLabConfig.selection`, so the figures set the drawing.
 */
export const stageCopy: StageCopy[] = [
  {
    kind: "gate",
    figure: "applications",
    name: "Applications",
    description:
      "Solo founders and teams apply, with or without an idea. No university enrolment needed.",
    approximate: true,
  },
  {
    kind: "gate",
    figure: "admitted",
    name: "Admitted to the cohort",
    description: "The teams that start the program together.",
  },
  // TODO(content): the program runs about 12 weeks (eLabConfig.programWeeks),
  // but the phases add up to 3 days + 4 weeks + 6 weeks (about ten). What
  // fills the remaining weeks (Selection Day to the Final Pitch)? The Studio
  // warns about the same gap on the E-Lab page's phases.
  {
    kind: "phase",
    id: "kickoff",
    name: "Kickoff and onboarding weekend",
    duration: { amount: 3, unit: "days" },
    description:
      "An intensive start: team alignment and ideation. Solo founders find co-founders here.",
    photo: {
      src: "/assets/homepage/elab.webp",
      width: 1920,
      height: 1440,
      alt: "A speaker on stage at the AI E-Lab kickoff, in front of a packed brick hall",
      objectPosition: "50% 40%",
    },
    photoCaption: "AI E-Lab kickoff",
  },
  {
    kind: "phase",
    id: "phase-one",
    name: "Phase I: MVP build",
    duration: { amount: 4, unit: "weeks" },
    description:
      "Rapid prototyping, problem fit and core tech, from desks at TUM.ai's headquarters, with weekly sessions from founders who have done it before.",
  },
  {
    kind: "gate",
    figure: "midterm",
    name: "Midterm Pitch",
    description:
      "The MVP gate: a live demo of the MVP and feedback from the jury.",
  },
  {
    kind: "phase",
    id: "phase-two",
    name: "Phase II: traction and growth",
    duration: { amount: 6, unit: "weeks" },
    description:
      "User testing, go-to-market, legal and pitch polish, with warm intros and real feedback from European funds.",
  },
  {
    kind: "gate",
    figure: "selectionDay",
    name: "Selection Day",
    description: "Teams are evaluated for the final showcase.",
  },
  // TODO(content): is the Final Pitch still in July for E-Lab 6.0, whose
  // applications closed in late September?
  {
    kind: "gate",
    figure: "finalPitch",
    name: "Final Pitch",
    description: "Teams pitch to investors and graduate from the E-Lab.",
  },
];

/** A gate's id: its figure in kebab case (`selectionDay` is `selection-day`). */
const gateId = (figure: GateFigure) =>
  figure.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The stages as the page draws them: each gate with its teams from
 * `selection` and its bar as a share of the applications.
 */
export function buildStages(
  stages: readonly StageCopy[],
  selection: Readonly<Record<GateFigure, number>> = eLabConfig.selection,
): SelectionStage[] {
  return stages.map((stage) => {
    if (stage.kind === "phase") return stage;
    const { figure, approximate, ...words } = stage;
    const teams = selection[figure];
    return {
      ...words,
      kind: "gate",
      id: gateId(figure),
      teams,
      approximate,
      share: teams / selection.applications,
    };
  });
}

/** The code cohort, as drawn. */
export const selectionStages: SelectionStage[] = buildStages(stageCopy);

/** The gates of `stages` alone, in order. */
export const gatesOf = (stages: readonly SelectionStage[]) =>
  stages.filter((stage): stage is Gate => stage.kind === "gate");

/** The code cohort's gates, in order. */
export const gates = gatesOf(selectionStages);

/**
 * Tick marks for the gates' scale, in teams: every `step` from 0 up to the
 * largest multiple of `step` not above `max`, each with its position along
 * the scale (0 to 1).
 */
export function scaleTicks(
  max: number,
  step: number,
): { teams: number; at: number }[] {
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => ({
    teams: index * step,
    at: (index * step) / max,
  }));
}
