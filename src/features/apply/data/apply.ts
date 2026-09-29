import type { ContentImage } from "@/lib/cms-content-model";

/**
 * The /apply page's own copy as code writes it: the code fallback of the
 * `applyCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts, filled on the server, and page tokens
 * (`applyPageTokens`) the sections fill from the lists they render. The
 * FAQ, the milestones and the member journey are lists of their own.
 */

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
  /** The hero's second paragraph, under the call's status. */
  heroLead: string;
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
};

/** The page tokens of the /apply copy (see `fillPageTokens`). */
export const applyPageTokens = ["count", "years"] as const;

/**
 * The hero's second paragraph. Also exported on its own: `hero.tsx` renders
 * it until the integration pass passes the CMS copy in.
 */
export const heroLead =
  "We look for students who want to build the future of AI, whatever they study. You don't need to be an AI expert to apply.";

export const applyCopyTemplate: ApplyCopy = {
  heroLead,
  scope: {
    title: "Who should apply",
    inScopeTitle: "In scope",
    notRequiredTitle: "Not required",
    valuesTitle: "How we work together",
    qualities: [
      {
        title: "Passion for AI",
        text: "A genuine interest in artificial intelligence and its applications.",
      },
      {
        title: "Commitment and motivation",
        text: "Willingness to invest time and energy to push the initiative forward.",
      },
      {
        title: "Proactiveness",
        text: "Taking initiative, and reacting quickly to new topics and challenges.",
      },
      {
        title: "Clear communication",
        text: "Open, honest and effective communication within the team.",
      },
    ],
    notRequired: [
      {
        title: "Being an AI expert",
        text: "Your first-semester projects match your area and level of expertise.",
      },
      {
        title: "A computer science degree",
        text: "Our members study {{org.majors}}+ majors.",
      },
    ],
    values: [
      {
        title: "Action, ambition and leadership",
        text: "We set goals, own outcomes and build partnerships with 180DC, CDTM, TUM Blockchain Club, TUM, UnternehmerTUM, AppliedAI, ETH Zürich and beyond.",
      },
      {
        title: "Diversity and inclusiveness",
        text: "{{org.majors}}+ majors and {{org.nationalities}}+ nationalities, because different people decide better together.",
      },
      {
        title: "Learn and grow",
        text: "Every semester, 10 to 15 members go to MIT, Harvard, Stanford or Berkeley for research, exchanges and theses.",
      },
      {
        title: "Trust and transparency",
        text: "Everyone can voice an opinion, and we rely on each other's honesty.",
      },
    ],
    // TODO(content): caption. Which batch or event is this, where, and when?
    photo: {
      src: "/assets/apply/new_section_photo_1.webp",
      width: 1920,
      height: 563,
      alt: "A large group of TUM.ai members in winter jackets, gathered in front of a baroque building",
      objectPosition: "50% 45%",
    },
  },
  tracks: {
    title: "What you'll work on",
    lead: "Every member starts at the onboarding weekend. From the first semester, you take one of two tracks.",
    offeringsTitle: "On either track, you can also join",
    offerings: [
      {
        title: "ML discussion groups",
        text: "Deep-tech sessions on machine learning papers: their implementations, the mathematics behind them and more.",
      },
      {
        title: "AI Academy",
        text: "Take part in its courses, or teach in them.",
      },
      {
        title: "Workshops and visits",
        text: "From soft skills to visits at companies like Google, Nvidia and QuantCo.",
      },
    ],
    // TODO(content): caption. Which hackathon is this, and when?
    photo: {
      src: "/assets/apply/new_section_photo_4.webp",
      width: 1920,
      height: 668,
      alt: "A packed lecture hall applauding as a team presents an AppliedAI challenge on the big screen",
      objectPosition: "55% 50%",
    },
    journeyLink: "The full member journey, semester by semester",
  },
  selection: {
    title: "How selection works",
    lead: "{{count}} stages, from your application to your first weekend as a member.",
    stages: [
      {
        title: "Application",
        when: "deadline",
        text: "Fill out the application form before the deadline.",
      },
      {
        title: "Screening",
        when: "after-deadline",
        text: "The recruiting team screens the applications.",
      },
      {
        title: "Interview",
        when: "interviews",
        text: "If you pass the screening, we invite you to an interview to get to know you better. Prepare by learning what TUM.ai stands for and by following recent developments in AI.",
      },
      {
        title: "Onboarding weekend",
        when: "onboarding",
        text: "Accepted applicants join the mandatory onboarding weekend: meet the members, join the social events and get to know TUM.ai.",
      },
    ],
  },
  history: {
    title: "Since {{org.foundingYear}}",
    lead: "What TUM.ai's members have started, by kind and year: {{count}} milestones in {{years}} years.",
  },
};
