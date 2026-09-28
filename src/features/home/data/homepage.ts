import type { LedgerItem } from "@/components/ds";
import { communityFacts } from "@/config/community";
import { eLabCompletedIterations, eLabConfig } from "@/config/e-lab";
import { impactFacts, publicationVenuesText } from "@/config/impact";
import { officialMembers, organizationFacts } from "@/config/organization";

/** A photo with its intrinsic size (for next/image) and a crop focus. */
export type HomePhoto = {
  src: string;
  width: number;
  height: number;
  /** `object-position` for cropped frames. */
  position?: string;
};

/**
 * Photos seen through the logomark in the hero, in order. Stage-lit rooms
 * read best through the narrow strokes.
 *
 * TODO(content): replace with three photos at least 2880px wide from one
 * shoot (OpenAI talk, E-Lab Demo Day, Makeathon); these are 1920px.
 */
export const heroPhotos: HomePhoto[] = [
  {
    src: "/assets/open_ai_speaker_event.webp",
    width: 1920,
    height: 1280,
    position: "62% 50%",
  },
  {
    src: "/assets/homepage/elab.webp",
    width: 1920,
    height: 1440,
    position: "50% 40%",
  },
  {
    src: "/assets/homepage/Makeathon.webp",
    width: 1920,
    height: 1280,
    position: "50% 45%",
  },
];

/** The hero lead: who we are, in one sentence, from the organization facts. */
export const heroLead = `We are ${organizationFacts.activeMembers}+ students from ${organizationFacts.universities}+ universities who publish research, build AI products with industry and found startups. In Munich since ${organizationFacts.foundingYear}.`;

/** The ledger beside the mission statement. */
export const ledgerFacts: LedgerItem[] = [
  {
    label: "Founded",
    value: String(organizationFacts.foundingYear),
    note: "At the Technical University of Munich",
  },
  {
    label: "Members",
    value: officialMembers,
    suffix: "+",
    note: `${organizationFacts.activeMembers}+ active and ${organizationFacts.alumni}+ alumni`,
  },
  {
    label: "Nationalities",
    value: organizationFacts.nationalities,
    suffix: "+",
    note: `Across ${organizationFacts.majors}+ majors and ${organizationFacts.universities}+ universities`,
  },
  {
    label: "Raised by E-Lab startups",
    value: eLabConfig.ventureFundingMillions,
    prefix: "€",
    suffix: "M+",
    note: `Across ${eLabCompletedIterations} incubator cohorts`,
  },
  {
    label: "Makeathon",
    value: communityFacts.makeathonSize,
    suffix: "+",
    note: "Builders at our signature hackathon",
  },
  {
    label: "Publications",
    value: impactFacts.publications,
    suffix: "+",
    note: `Including ${publicationVenuesText}`,
  },
];

/** A destination in the "What we do" index. */
export type Program = {
  id: string;
  title: string;
  description: string;
  href: string;
  image: { src: string; position?: string };
};

/** The five ways into TUM.ai, each with one concrete proof point. */
export const programs: Program[] = [
  {
    id: "research",
    title: "Research",
    description: `Research projects with universities and labs, papers at ${publicationVenuesText}, and exchanges with MIT, Harvard and Cambridge.`,
    href: "/research",
    image: { src: "/assets/innovation/robotics_discussion.webp" },
  },
  {
    id: "entrepreneurship",
    title: "Entrepreneurship",
    description: `The AI E-Lab, our equity-free incubator. Its startups have raised €${eLabConfig.ventureFundingMillions}M+ so far.`,
    href: "/e-lab",
    image: { src: "/assets/homepage/elab.webp", position: "50% 40%" },
  },
  {
    id: "events",
    title: "Hackathons and events",
    description: `Talks with OpenAI and NVIDIA, hands-on workshops, and a Makeathon that draws ${communityFacts.makeathonSize}+ builders.`,
    href: "/events",
    image: {
      src: "/assets/open_ai_speaker_event.webp",
      position: "65% 50%",
    },
  },
  {
    id: "projects",
    title: "Projects",
    description:
      "Task forces on medical AI, quantum computing and generative models, and Women@TUM.ai.",
    href: "/projects",
    image: { src: "/assets/innovation/women_at_tumai.jpg" },
  },
  {
    id: "community",
    title: "Community",
    description: `${organizationFacts.activeMembers}+ active members in seven departments, who run all of the above themselves.`,
    href: "/community",
    image: { src: "/assets/homepage/Onboarding25.webp" },
  },
];

/** A photo in the "In the room" spread, with a factual caption. */
export type RoomPhoto = HomePhoto & { alt: string; caption: string };

/**
 * The editorial photo spread, in layout order (see ROOM_CELLS).
 *
 * TODO(content): confirm the event names and years in these captions.
 */
export const roomPhotos: RoomPhoto[] = [
  {
    src: "/assets/open_ai_speaker_event.webp",
    width: 1920,
    height: 1280,
    alt: "A speaker from OpenAI on stage in front of a full auditorium",
    caption: "OpenAI Deutschland at TUM.ai, 2025",
  },
  {
    src: "/assets/homepage/elab.webp",
    width: 1920,
    height: 1440,
    alt: "A keynote at the AI E-Lab in a packed brick hall",
    caption: "AI E-Lab kickoff",
  },
  {
    src: "/assets/apply/new_section_photo_4.webp",
    width: 1920,
    height: 668,
    alt: "A packed lecture hall watching a team pitch",
    caption: "Challenge pitches in a full lecture hall",
  },
  {
    src: "/assets/homepage/Makeathon.webp",
    width: 1920,
    height: 1280,
    alt: "The Makeathon organizing team on stage",
    caption: "The Makeathon team on stage",
  },
  {
    src: "/assets/innovation/robotics_discussion.webp",
    width: 1920,
    height: 1440,
    alt: "Members building robot arms at a whiteboard",
    caption: "Robotics task force at work",
  },
];

/**
 * The member quoted in the join band: a sentence from their story on
 * /community (`memberStories` in @/features/community), which supplies the
 * name, role and portrait.
 */
export const memberQuote = {
  name: "Sami Haddouti",
  excerpt:
    "The breadth of responsibilities and leadership opportunities here is truly unmatched.",
};
