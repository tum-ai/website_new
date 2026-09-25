import {
  Brain,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
  Handshake,
  type LucideIcon,
  Rocket,
} from "lucide-react";

export type JourneyStep = {
  /** Visible stage number, e.g. "01" or "02A". Also used for the anchor id. */
  step: string;
  name: string;
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
 * The member journey as shown on /community. The copy is page-specific.
 */
export const journeyStages: JourneyStage[] = [
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

export const stepAnchor = (step: string) => `journey-${step.toLowerCase()}`;
