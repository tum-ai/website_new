import type { ContentImage } from "@/lib/cms-content-model";
import type { Duration } from "@/lib/program-duration";

/** The selection figures in `the fetched selection facts`, one per gate. */
export type GateFigure =
  | "applications"
  | "admitted"
  | "midterm"
  | "selectionDay"
  | "finalPitch";

/** A point where teams are selected, with how many reach it. */
export type Gate = {
  kind: "gate";
  id: string;
  name: string;
  /** Teams that reach this gate (`the fetched selection facts`). */
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

/** A stage as copy writes it: the CMS model of `eLabCopy.stages`. */
export type StageCopy = GateCopy | Phase;

/** A gate's id: its figure in kebab case (`selectionDay` is `selection-day`). */
const gateId = (figure: GateFigure) =>
  figure.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The stages as the page draws them: each gate with its teams from
 * `selection` and its bar as a share of the applications.
 */
export function buildStages(
  stages: readonly StageCopy[],
  selection: Readonly<Record<GateFigure, number>>,
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

/** The gates of `stages` alone, in order. */
export const gatesOf = (stages: readonly SelectionStage[]) =>
  stages.filter((stage): stage is Gate => stage.kind === "gate");

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
