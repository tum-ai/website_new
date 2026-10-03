import {
  Brain,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
  Handshake,
  type LucideIcon,
  Rocket,
} from "lucide-react";
import {
  type JourneyIconKey,
  type JourneyStage,
  type JourneyStep,
  stageSteps,
} from "@/lib/community-model";

export type { JourneyStage, JourneyStep };
export { stageSteps };

/** The Lucide icon of each step icon key (the CMS stores the key). */
export const journeyIcons: Record<JourneyIconKey, LucideIcon> = {
  rocket: Rocket,
  brain: Brain,
  handshake: Handshake,
  chart: ChartNoAxesColumn,
  globe: Globe,
  "graduation-cap": GraduationCap,
};

/**
 * The TUM.ai member journey, the single source for every page that describes
 * it: /community draws it as a forked path, /apply lists it as steps. The
 * code fallback of the `journeyStep` documents (`lib/community-content.ts`).
 */
export const memberJourney: JourneyStage[] = [
  {
    kind: "single",
    step: {
      step: "01",
      name: "Batch Introduction",
      description:
        "Kick off your journey at the onboarding weekend! Meet members, join social events, and deepen connections on our getaway.",
      iconKey: "rocket",
      fromSemester: 0,
      span: "event",
    },
  },
  {
    kind: "fork",
    steps: [
      {
        step: "02A",
        name: "Research Track",
        description:
          "Join a team on an Impact Project applying AI to real-world challenges. Contribute to research, academic publications, or open-source work, and engage with the TUM.ai community through update sessions.",
        iconKey: "brain",
        fromSemester: 1,
        span: "ongoing",
        evidence: {
          name: "Marco Lorenz",
          excerpt:
            "Joining TUM.ai as part of the MIT project gave me the chance to work on exciting AI research with talented peers and mentors.",
        },
      },
      {
        step: "02B",
        name: "Initiative Track",
        description:
          "Join one of our core departments and become a driving force behind everything that makes TUM.ai stand out. Shape the future of TUM.ai and develop your skills while engaging in trips, events, and learning opportunities.",
        iconKey: "handshake",
        fromSemester: 1,
        span: "ongoing",
        evidence: {
          name: "Jasmin El-Wafi",
          excerpt:
            "I rebuilt this website for minimal maintenance and developed tools to automate and optimize internal processes.",
        },
      },
    ],
  },
  {
    kind: "single",
    step: {
      step: "03",
      name: "Growth Opportunities",
      description:
        "After your first semester, expand your impact: join new teams, lead a task force, or take on a Team Lead role.",
      iconKey: "chart",
      fromSemester: 2,
      span: "ongoing",
      evidence: {
        name: "Simon Huang",
        excerpt:
          "Within one semester at TUM.ai, I went from joining the software development team to leading a group of seven.",
      },
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
        "After one semester, you can join the REX Program and conduct research at top institutions like MIT, Harvard, or Cambridge. With our alumni network, we guide you in finding a topic, navigating applications, and contributing to cutting-edge research.",
      iconKey: "globe",
      fromSemester: 2,
      span: "ongoing",
    },
  },
  {
    kind: "single",
    step: {
      step: "05",
      name: "Alumni Program",
      description:
        "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
      iconKey: "graduation-cap",
      fromSemester: 3,
      span: "ongoing",
    },
  },
];

/** Every step in journey order, with the index of the stage it belongs to. */
export const journeySteps: (JourneyStep & { stageIndex: number })[] =
  memberJourney.flatMap((stage, stageIndex) =>
    stageSteps(stage).map((step) => ({ ...step, stageIndex })),
  );

/** Anchor id of a step on /community, e.g. "journey-02a". */
export const stepAnchor = (step: string) => `journey-${step.toLowerCase()}`;

/**
 * The columns of a journey's membership timetable on /community: the
 * recruiting round (0), then one per semester up to the latest one any step
 * opens in, which is open-ended ("3+").
 */
export function semesterColumnsOf(journey: readonly JourneyStage[]): string[] {
  const last = Math.max(
    ...journey.flatMap(stageSteps).map((step) => step.fromSemester),
  );
  return Array.from({ length: last + 1 }, (_, semester) =>
    semester === last ? `${semester}+` : `${semester}`,
  );
}
