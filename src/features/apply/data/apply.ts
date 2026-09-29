import { organizationFacts } from "@/config/organization";

/** A named point with one or two sentences of copy. */
export type Point = { title: string; text: string };

/** The hero's second paragraph, under the call's status. */
export const heroLead =
  "We look for students who want to build the future of AI, whatever they study. You don't need to be an AI expert to apply.";

/** The lead of "What you'll work on". */
export const tracksLead =
  "Every member starts at the onboarding weekend. From the first semester, you take one of two tracks.";

/** When a selection stage happens, filled in from the round's dates. */
export type StageTiming =
  | "deadline"
  | "after-deadline"
  | "interviews"
  | "onboarding";

/** The round's stages, in order. */
export const selectionStages: (Point & { when: StageTiming })[] = [
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
];

/** What we look for in applicants. */
export const qualities: Point[] = [
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
];

/**
 * What an applicant doesn't need, the call's "out of scope": both from the
 * FAQ's answer on AI proficiency and the members' majors.
 */
export const notRequired: Point[] = [
  {
    title: "Being an AI expert",
    text: "Your first-semester projects match your area and level of expertise.",
  },
  {
    title: "A computer science degree",
    text: `Our members study ${organizationFacts.majors}+ majors.`,
  },
];

/** The four values in one sentence each, every fact kept. */
export const values: Point[] = [
  {
    title: "Action, ambition and leadership",
    text: "We set goals, own outcomes and build partnerships with 180DC, CDTM, TUM Blockchain Club, TUM, UnternehmerTUM, AppliedAI, ETH Zürich and beyond.",
  },
  {
    title: "Diversity and inclusiveness",
    text: `${organizationFacts.majors}+ majors and ${organizationFacts.nationalities}+ nationalities, because different people decide better together.`,
  },
  {
    title: "Learn and grow",
    text: "Every semester, 10 to 15 members go to MIT, Harvard, Stanford or Berkeley for research, exchanges and theses.",
  },
  {
    title: "Trust and transparency",
    text: "Everyone can voice an opinion, and we rely on each other's honesty.",
  },
];

/** What every member can join besides their track. */
export const offerings: Point[] = [
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
];
