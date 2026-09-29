import { communityFacts } from "@/config/community";

/** A photo of a department's own team or work, with a factual caption. */
interface DepartmentPhoto {
  src: string;
  alt: string;
  caption: string;
  /** `object-position` that keeps the people in the crop. */
  position?: string;
}

/** One core department: its name, a short description and, if we have one, a photo. */
export interface Department {
  name: string;
  description: string;
  photo?: DepartmentPhoto;
}

/** The core departments on /community, in display order. */
export const departments: Department[] = [
  {
    name: "Makeathon",
    photo: {
      src: "/assets/homepage/Makeathon.webp",
      alt: "The organizing team posing on stage in front of the Makeathon banner",
      caption: "The Makeathon team on stage",
      position: "50% 60%",
    },
    description: `We are responsible for our signature event, 'Makeathon,' which draws over ${communityFacts.makeathonSize} participants, as well as several smaller hackathons on diverse, niche topics e.g. civil engineering, public sector. We handle organizing these events from start to finish, managing everything from planning to execution.`,
  },
  {
    name: "Venture",
    photo: {
      src: "/assets/homepage/venture_onboarding25.webp",
      alt: "About fifteen people around a meeting table, two of them holding up Makeathon T-shirts",
      caption: "Venture onboarding, 2025",
      position: "50% 62%",
    },
    description:
      "The venture team runs the E-Lab, our AI startup incubator, providing founders with mentorship, resources, and guidance to turn innovative ideas into high-impact startups. Participants gain strong exposure and direct contact with VC companies, building valuable networks to support their growth.",
  },
  {
    name: "Software Development",
    description:
      "We’re a small, hands-on team passionate about building reliable, scalable software. This semester we are tackling two big projects: revamping our public website and developing a secure full-stack Member Manager tool. We value curiosity, responsibility, and grit over prior experience, and if you want to build software that is sleek, secure, and impactful, this is the team to join.",
  },
  {
    name: "Legal & Finance",
    description:
      "The legal and finance team ensures that all our operations run smoothly, safely, and within regulations. We handle contracts, compliance, budgeting, and financial planning, while supporting other departments with legal guidance and financial resources to help their projects succeed.",
  },
  {
    name: "Community",
    photo: {
      src: "/assets/homepage/IBM_visit.webp",
      alt: "A large group of members standing together in a high-rise event space",
      // TODO(content): confirm the year of the IBM visit for the caption.
      caption: "Company visit at the IBM Innovation Studio",
      position: "50% 55%",
    },
    description:
      "We make the TUM.ai community feel like one big group of friends by bringing people together at exciting events. Our team will organize company visits, networking meetups, and joint activities with other student groups, as well as fun hangouts like bar nights or sports tournaments. The goal is to create lasting connections and a vibrant, welcoming atmosphere for everyone at TUM.ai.",
  },
  {
    name: "Marketing",
    // TODO(content): the two sentences are alternative drafts (they were
    // joined by a stray German "or"); keep one?
    description:
      "The Marketing Department shapes TUM.ai’s public image by driving strategic communication, creating impactful designs, and promoting our vision and events to the broader community. The Marketing Department at TUM.ai gives our vision a voice and a look, translating ideas into designs and stories that resonate across our students and professional network.",
  },
  {
    name: "Partners & Sponsors",
    photo: {
      src: "/assets/open_ai_speaker_event.webp",
      alt: "A speaker on a lit stage in front of a full, steeply raked auditorium",
      caption: "OpenAI Deutschland at TUM.ai, 2025",
      position: "62% 50%",
    },
    description:
      "The partnership department is the main point of contact for companies, focused on building strategic partnerships and securing sponsorships to support ambitious events and projects. We make speaker events with AI leaders like OpenAI and Anthropic happen, and connect other departments with the right partners to help their initiatives succeed.",
  },
];
