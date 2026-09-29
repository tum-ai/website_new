import { eLabCompletedIterations, eLabProgramSummary } from "@/config/e-lab";
import { impactFacts, publicationVenuesText } from "@/config/impact";
import { organizationFacts } from "@/config/organization";
import { partnerPitch } from "@/features/partners";

/** The question the mission passage answers. */
export const missionQuestion = "What is TUM.ai's mission?";

/**
 * The long mission paragraph: the context passage every other answer is
 * marked in. Change it together with the `spans` below;
 * `mission-spans.test.ts` fails when a span no longer matches.
 */
export const missionPassage =
  "Together with our highly-talented members, we conduct cutting-edge research projects, develop AI-powered solutions with industry partners, incubate innovative startups, and organize workshops that bridge academic knowledge with real-world applications. Through strategic partnerships and connections with leading AI tech and industry companies, we create unique opportunities for collaboration, mentorship, and career development. We aim to lower the entry barriers to AI creation and usage for people from every domain by establishing a platform for practical experience through diverse applied AI projects, research initiatives, and entrepreneurial opportunities.";

/** One question on /qanda. */
export type QandaEntry = {
  /** Anchor id of the question (`/qanda#<id>`). */
  id: string;
  question: string;
  /** The answer's opening paragraph. */
  answer: string;
  /** Points the answer lists after its opening sentence. */
  points?: readonly string[];
  /**
   * The phrases of {@link missionPassage} that answer the question, each an
   * exact substring that occurs once. Omit when the passage doesn't cover it.
   */
  spans?: readonly string[];
  /** A fact from the site config that shows the answer, and where to see it. */
  evidence?: { text?: string; label: string; href: string };
};

/** The questions, in the order their spans appear in the passage. */
export const faqs: QandaEntry[] = [
  {
    id: "activities",
    question: "What types of activities do your members engage in?",
    answer:
      "Our members are involved in a wide range of activities, including applied AI research, developing solutions with industry partners, incubating startups, and hosting workshops that connect theory with practice.",
    spans: [
      "conduct cutting-edge research projects",
      "organize workshops that bridge academic knowledge with real-world applications",
    ],
    evidence: {
      text: `Members have published ${impactFacts.publications}+ peer-reviewed papers at ${publicationVenuesText}.`,
      label: "See our research",
      href: "/research",
    },
  },
  {
    id: "industry",
    question: "How do you collaborate with industry partners?",
    answer:
      "We partner with leading companies to co-develop AI solutions, share expertise, organize events and create opportunities for mentorship and career pathways.",
    spans: ["develop AI-powered solutions with industry partners"],
    evidence: { label: "How partnerships work", href: "/partners" },
  },
  {
    id: "startups",
    question: "What role do startups play in your initiatives?",
    answer:
      "Startups are a key part of our ecosystem. We provide support for early-stage ideas, help founders validate their concepts, and connect them with resources to scale innovative AI products.",
    spans: ["incubate innovative startups"],
    evidence: {
      text: `The E-Lab, our ${eLabProgramSummary}, has run ${eLabCompletedIterations} cohorts.`,
      label: "Meet the E-Lab",
      href: "/e-lab",
    },
  },
  {
    id: "partnerships",
    question: "What kind of opportunities do strategic partnerships create?",
    answer:
      "Our strategic partnerships allow us to provide members with unique opportunities such as industry collaborations, mentorship programs, joint research, and exposure to cutting-edge technologies.",
    spans: [
      "Through strategic partnerships and connections with leading AI tech and industry companies, we create unique opportunities for collaboration, mentorship, and career development",
    ],
    evidence: { label: "Become a Partner", href: "/partners" },
  },
  {
    id: "accessibility",
    question:
      "What is your mission regarding accessibility in AI creation and usage?",
    answer:
      "Our mission is to make AI accessible to everyone, regardless of their background, by lowering entry barriers and providing platforms for learning, experimentation, and collaboration.",
    spans: [
      "lower the entry barriers to AI creation and usage for people from every domain",
    ],
    evidence: {
      text: `Our ${organizationFacts.activeMembers}+ active members come from ${organizationFacts.majors}+ majors and ${organizationFacts.nationalities}+ nationalities.`,
      label: "Meet the community",
      href: "/community",
    },
  },
  {
    id: "practical",
    question: "How do you provide practical experience in AI?",
    answer:
      "We emphasize hands-on learning through applied projects, hackathons, and research initiatives, giving members direct exposure to real-world challenges.",
    spans: [
      "establishing a platform for practical experience through diverse applied AI projects, research initiatives, and entrepreneurial opportunities",
    ],
    evidence: {
      text: `${impactFacts.hackathonParticipants.toLocaleString("en")}+ people have taken part in our hackathons.`,
      label: "See our events",
      href: "/events",
    },
  },
  {
    id: "member-journey",
    question: "What does the member journey look like?",
    answer: "Members can join one of two tracks:",
    points: [
      "In the initiative track you will join one of our core departments and become a driving force behind everything that makes TUM.ai stand out.",
      "In the research track you will join a team on an Impact Project applying AI to real-world challenges. Contribute to research and write academic publications.",
    ],
    evidence: {
      label: "See the member journey",
      href: "/community#journey",
    },
  },
];

/** The two readers' next steps, beside the inbox in the page's close. */
export const forks = [
  {
    reader: "For students",
    text: "Membership starts with a recruiting round. The apply page has the dates and the steps.",
    label: "Become a Member",
    href: "/apply",
  },
  {
    reader: "For companies",
    text: partnerPitch,
    label: "Become a Partner",
    href: "/partners",
  },
] as const;
