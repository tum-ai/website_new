import type { DepartmentTemplate } from "@/lib/community-model";

/**
 * The core departments on /community, in display order: the code fallback of
 * the `department` documents (`lib/community-content.ts`). Descriptions may
 * hold `{{placeholders}}` for site facts, which the content slice fills on
 * the server (this module reaches client bundles through the homepage).
 */
export const departments: readonly DepartmentTemplate[] = [
  {
    key: "makeathon",
    name: "Makeathon",
    photo: {
      src: "/assets/homepage/Makeathon.webp",
      width: 1920,
      height: 1280,
      alt: "The organizing team posing on stage in front of the Makeathon banner",
      objectPosition: "50% 60%",
    },
    photoCaption: "The Makeathon team on stage",
    description:
      "We are responsible for our signature event, 'Makeathon,' which draws over {{community.makeathonSize}} participants, as well as several smaller hackathons on diverse, niche topics e.g. civil engineering, public sector. We handle organizing these events from start to finish, managing everything from planning to execution.",
  },
  {
    key: "venture",
    name: "Venture",
    photo: {
      src: "/assets/homepage/venture_onboarding25.webp",
      width: 1440,
      height: 1920,
      alt: "About fifteen people around a meeting table, two of them holding up Makeathon T-shirts",
      objectPosition: "50% 62%",
    },
    photoCaption: "Venture onboarding, 2025",
    description:
      "The venture team runs the E-Lab, our AI startup incubator, providing founders with mentorship, resources, and guidance to turn innovative ideas into high-impact startups. Participants gain strong exposure and direct contact with VC companies, building valuable networks to support their growth.",
  },
  {
    key: "software-development",
    name: "Software Development",
    description:
      "We’re a small, hands-on team passionate about building reliable, scalable software. This semester we are tackling two big projects: revamping our public website and developing a secure full-stack Member Manager tool. We value curiosity, responsibility, and grit over prior experience, and if you want to build software that is sleek, secure, and impactful, this is the team to join.",
  },
  {
    key: "legal-finance",
    name: "Legal & Finance",
    description:
      "The legal and finance team ensures that all our operations run smoothly, safely, and within regulations. We handle contracts, compliance, budgeting, and financial planning, while supporting other departments with legal guidance and financial resources to help their projects succeed.",
  },
  {
    key: "community",
    name: "Community",
    photo: {
      src: "/assets/homepage/IBM_visit.webp",
      width: 1920,
      height: 1440,
      alt: "A large group of members standing together in a high-rise event space",
      objectPosition: "50% 55%",
    },
    // TODO(content): confirm the year of the IBM visit for the caption.
    photoCaption: "Company visit at the IBM Innovation Studio",
    description:
      "We make the TUM.ai community feel like one big group of friends by bringing people together at exciting events. Our team will organize company visits, networking meetups, and joint activities with other student groups, as well as fun hangouts like bar nights or sports tournaments. The goal is to create lasting connections and a vibrant, welcoming atmosphere for everyone at TUM.ai.",
  },
  {
    key: "marketing",
    name: "Marketing",
    // TODO(content): the two sentences are alternative drafts (they were
    // joined by a stray German "or"); keep one?
    description:
      "The Marketing Department shapes TUM.ai’s public image by driving strategic communication, creating impactful designs, and promoting our vision and events to the broader community. The Marketing Department at TUM.ai gives our vision a voice and a look, translating ideas into designs and stories that resonate across our students and professional network.",
  },
  {
    key: "partners-sponsors",
    name: "Partners & Sponsors",
    photo: {
      src: "/assets/open_ai_speaker_event.webp",
      width: 1920,
      height: 1280,
      alt: "A speaker on a lit stage in front of a full, steeply raked auditorium",
      objectPosition: "62% 50%",
    },
    photoCaption: "OpenAI Deutschland at TUM.ai, 2025",
    description:
      "The partnership department is the main point of contact for companies, focused on building strategic partnerships and securing sponsorships to support ambitious events and projects. We make speaker events with AI leaders like OpenAI and Anthropic happen, and connect other departments with the right partners to help their initiatives succeed.",
  },
];
