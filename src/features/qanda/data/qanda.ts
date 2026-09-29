import { contentTokens } from "@/config/content-tokens";
import { memberJourney } from "@/features/community";
import { fillCodeCopy } from "@/lib/content-copy";
import { memberJourneyAnswerId, withJourneyTracks } from "../journey-tracks";

/**
 * The /qanda copy as code writes it: the code fallback of the `qandaCopy`
 * singleton and of the `qanda` FAQ collection (see `../content.ts`). Text may
 * hold `{{name}}` placeholders for site facts (`lib/content-tokens.ts`),
 * filled when the page renders; the backfill copies them as they are.
 */

/** The page's own copy (`qandaCopy`). */
export type QandaCopy = {
  heroTitle: string;
  /** The question the mission passage answers. */
  missionQuestion: string;
  missionLead: string;
  /**
   * The long mission paragraph: the context passage every other answer is
   * marked in. Change it together with the answers' `spans`; the tests (and
   * the Studio) fail when a span no longer matches.
   */
  missionPassage: string;
  closing: { title: string; lead: string; action: string };
  /** Each reader's next step; the companies' text is `partnerPitch`. */
  forks: {
    students: { reader: string; text: string };
    companies: { reader: string };
  };
};

export const qandaCopyTemplate: QandaCopy = {
  heroTitle: "Questions and answers.",
  missionQuestion: "What is TUM.ai's mission?",
  missionLead:
    "The short answer is above. The long one covers most of what people ask us: open a question and the words that answer it are marked.",
  missionPassage:
    "Together with our highly-talented members, we conduct cutting-edge research projects, develop AI-powered solutions with industry partners, incubate innovative startups, and organize workshops that bridge academic knowledge with real-world applications. Through strategic partnerships and connections with leading AI tech and industry companies, we create unique opportunities for collaboration, mentorship, and career development. We aim to lower the entry barriers to AI creation and usage for people from every domain by establishing a platform for practical experience through diverse applied AI projects, research initiatives, and entrepreneurial opportunities.",
  closing: {
    title: "Not in the paragraph? Ask us.",
    lead: "Write to us with anything this page leaves open.",
    action: "Ask your question",
  },
  forks: {
    students: {
      reader: "For students",
      text: "Membership starts with a recruiting round. The apply page has the dates and the steps.",
    },
    companies: { reader: "For companies" },
  },
};

/** The page copy as rendered without the CMS. */
export const qandaCopy = fillCodeCopy(qandaCopyTemplate, contentTokens);

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
   * The phrases of the mission passage that answer the question, each an
   * exact substring that occurs once. Omit when the passage doesn't cover it.
   */
  spans?: readonly string[];
  /**
   * A fact that shows the answer (placeholders for the figures), and where
   * to see it.
   */
  evidence?: { text?: string; label: string; href: string };
};

/**
 * The questions (the `qanda` FAQ collection; `id` is the entry's anchor), in
 * the order their spans appear in the passage.
 */
export const faqTemplates: readonly QandaEntry[] = [
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
      text: "Members have published {{impact.publications}}+ peer-reviewed papers at {{impact.publicationVenues}}.",
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
      text: "The E-Lab, our {{eLab.programSummary}}, has run {{eLab.completedCohorts}} cohorts.",
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
      text: "Our {{org.activeMembers}}+ active members come from {{org.majors}}+ majors and {{org.nationalities}}+ nationalities.",
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
      text: "{{impact.hackathonParticipants}}+ people have taken part in our hackathons.",
      label: "See our events",
      href: "/events",
    },
  },
  {
    // Its points are the journey's tracks (`withJourneyTracks`).
    id: memberJourneyAnswerId,
    question: "What does the member journey look like?",
    answer: "Members can join one of two tracks:",
    evidence: {
      label: "See the member journey",
      href: "/community#journey",
    },
  },
];

/**
 * The questions as rendered without the CMS: placeholders filled, the
 * member-journey answer listing the code journey's tracks.
 */
export const faqs: QandaEntry[] = withJourneyTracks(
  fillCodeCopy([...faqTemplates], contentTokens),
  fillCodeCopy(memberJourney, contentTokens),
);
