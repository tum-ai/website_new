import {
  Brain,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
  Handshake,
  type LucideIcon,
  Rocket,
} from "lucide-react";

/** One step of the member journey. */
export type JourneyStep = {
  /** Visible step number, e.g. "01" or "02A". Also used for the anchor id. */
  step: string;
  name: string;
  /** One or two sentences. */
  description: string;
  icon: LucideIcon;
};

/**
 * One stop on the member journey: a single step, or a fork where members
 * choose one of two parallel tracks.
 */
export type JourneyStage =
  | { kind: "single"; step: JourneyStep }
  | { kind: "fork"; steps: [JourneyStep, JourneyStep] };

/**
 * The TUM.ai member journey, the single source for every page that describes
 * it: /community draws it as a forked path, /apply lists it as steps.
 */
export const memberJourney: JourneyStage[] = [
  {
    kind: "single",
    step: {
      step: "01",
      name: "Batch Introduction",
      description:
        "Kick off your journey at the onboarding weekend! Meet members, join social events, and deepen connections on our getaway.",
      icon: Rocket,
    },
  },
  {
    kind: "fork",
    steps: [
      {
        step: "02A",
        name: "Research Track",
        description:
          "Join a team on an Impact Project applying AI to real world challenges. Contribute to research, academic publications, or open-source work, and engage with the TUM.ai community through update sessions.",
        icon: Brain,
      },
      {
        step: "02B",
        name: "Initiative Track",
        description:
          "Join one of our core departments and become a driving force behind everything that makes TUM.ai stand out. Shape the future of TUM.ai and develop your skills while engaging in trips, events, and learning opportunities.",
        icon: Handshake,
      },
    ],
  },
  {
    kind: "single",
    step: {
      step: "03",
      name: "Growth Opportunities",
      description:
        "After your first semester, expand your impact - Join new teams, lead a task force, or take on a Team Lead role.",
      icon: ChartNoAxesColumn,
    },
  },
  {
    kind: "single",
    step: {
      step: "04",
      name: "Research Exchange (REX) Program",
      // TODO(content): REX partner school, Berkeley or Cambridge? The Apply
      // page used to name Berkeley; this copy (now on both pages) says Cambridge.
      description:
        "After one semester, you can join the REX Program - conduct research at top institutions like MIT, Harvard, or Cambridge. With our alumni network, we guide you in finding a topic, navigating applications, and contributing to cutting-edge research.",
      icon: Globe,
    },
  },
  {
    kind: "single",
    step: {
      step: "05",
      name: "Alumni Program",
      description:
        "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
      icon: GraduationCap,
    },
  },
];

/** The steps of a stage, in order. */
export const stageSteps = (stage: JourneyStage): JourneyStep[] =>
  stage.kind === "single" ? [stage.step] : stage.steps;

/** Every step in journey order, with the index of the stage it belongs to. */
export const journeySteps: (JourneyStep & { stageIndex: number })[] =
  memberJourney.flatMap((stage, stageIndex) =>
    stageSteps(stage).map((step) => ({ ...step, stageIndex })),
  );

/** Anchor id of a step on /community, e.g. "journey-02a". */
export const stepAnchor = (step: string) => `journey-${step.toLowerCase()}`;
