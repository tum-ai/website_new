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
   * from their story in `member-stories.ts` (a test checks it is).
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
        icon: Brain,
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
        icon: Handshake,
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
      icon: ChartNoAxesColumn,
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
      icon: Globe,
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
      icon: GraduationCap,
      fromSemester: 3,
      span: "ongoing",
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

const lastSemester = Math.max(...journeySteps.map((step) => step.fromSemester));

/**
 * The columns of the membership timetable on /community: the recruiting
 * round (0), then semesters 1 and 2, and "3+" for everything after, which is
 * the latest semester any step opens in.
 */
export const semesterColumns: string[] = Array.from(
  { length: lastSemester + 1 },
  (_, semester) => (semester === lastSemester ? `${semester}+` : `${semester}`),
);
