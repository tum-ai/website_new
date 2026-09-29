import { eLabConfig } from "@/config/e-lab";

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
  /** How long it runs, as shown ("4 weeks"). */
  duration: string;
  description: string;
};

/** One stop on the way from the application round to the Final Pitch. */
export type SelectionStage = Gate | Phase;

const { selection } = eLabConfig;

const gate = (
  id: string,
  name: string,
  teams: number,
  description: string,
  approximate?: boolean,
): Gate => ({
  kind: "gate",
  id,
  name,
  teams,
  approximate,
  description,
  share: teams / selection.applications,
});

const phase = (
  id: string,
  name: string,
  duration: string,
  description: string,
): Phase => ({ kind: "phase", id, name, duration, description });

/**
 * One E-Lab cohort in order: the gates where teams are selected, and the
 * program phases between them. /e-lab draws each gate's bar to scale from
 * `share`, so the figures in `eLabConfig.selection` set the drawing.
 */
export const selectionStages: SelectionStage[] = [
  gate(
    "applications",
    "Applications",
    selection.applications,
    "Solo founders and teams apply, with or without an idea. No university enrolment needed.",
    true,
  ),
  gate(
    "admitted",
    "Admitted to the cohort",
    selection.admitted,
    "The teams that start the program together.",
  ),
  phase(
    "kickoff",
    "Kickoff and onboarding weekend",
    "3 days",
    "An intensive start: team alignment and ideation. Solo founders find co-founders here.",
  ),
  phase(
    "phase-one",
    "Phase I: MVP build",
    "4 weeks",
    "Rapid prototyping, problem fit and core tech, from desks at TUM.ai's headquarters, with weekly sessions from founders who have done it before.",
  ),
  gate(
    "midterm",
    "Midterm Pitch",
    selection.midterm,
    "The MVP gate: a live demo of the MVP and feedback from the jury.",
  ),
  phase(
    "phase-two",
    "Phase II: traction and growth",
    "6 weeks",
    "User testing, go-to-market, legal and pitch polish, with warm intros and real feedback from European funds.",
  ),
  gate(
    "selection-day",
    "Selection Day",
    selection.selectionDay,
    "Teams are evaluated for the final showcase.",
  ),
  gate(
    "final-pitch",
    "Final Pitch",
    selection.finalPitch,
    // TODO(content): is the Final Pitch still in July for E-Lab 6.0, whose
    // applications closed in late September?
    "Teams pitch to investors and graduate from the E-Lab.",
  ),
];

/** The gates alone, in order. */
export const gates = selectionStages.filter(
  (stage): stage is Gate => stage.kind === "gate",
);

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
