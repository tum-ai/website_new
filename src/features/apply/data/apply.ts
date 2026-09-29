import { organizationFacts } from "@/config/organization";

/** A named point with one or two sentences of copy. */
export type Point = { title: string; text: string };

/**
 * The 2026 brand guide's mission (slide "Brand Story & Mission"), quoted as
 * the call's scope.
 */
export const mission =
  'To bridge the gap between theory and practice by empowering students to build the future of AI. We combine academic rigor with a "make-it-happen" mindset to solve real-world challenges.';

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

/** The four values, shortened from the old "Our Values" cards; every fact kept. */
export const values: Point[] = [
  {
    title: "Action, ambition and leadership",
    text: "We set goals, aim for excellence and take responsibility for outcomes, also in shared work. We build partnerships with organizations like 180DC, CDTM and TUM Blockchain Club, across TUM, UnternehmerTUM, AppliedAI, ETH Zürich and beyond.",
  },
  {
    title: "Diversity and inclusiveness",
    text: `Our members study ${organizationFacts.majors}+ majors and come from ${organizationFacts.nationalities}+ nationalities. Teams of different people make better decisions and find new ideas.`,
  },
  {
    title: "Learn and grow",
    text: "We keep up with AI together. Every semester, 10 to 15 members go to institutions such as MIT, Harvard, Stanford and Berkeley for research, exchange semesters and their theses.",
  },
  {
    title: "Trust and transparency",
    text: "Everyone can voice an opinion. We support one another, rely on each other's honesty, and learn through projects with our peers.",
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
