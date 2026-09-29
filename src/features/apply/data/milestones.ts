import { communityFacts } from "@/config/community";

/** One year of the initiative: what its members started. */
export type Milestone = { year: number; items: string[] };

/** TUM.ai's milestones since its founding, newest first. */
export const milestones: Milestone[] = [
  {
    year: 2025,
    items: [
      "The first smaller hackathon, with Aleph Alpha",
      "TUM.ai expands to Berlin",
      "The first event with OpenAI after their Munich office opened (1200+ signups)",
      "An ICML main-track paper and an ICLR publication",
      `The biggest Makeathon yet, with ${communityFacts.makeathonSize}+ registrations`,
      "The TUM.ai summer hackathon with AWS, Lovable, ElevenLabs, Google, Anthropic and others",
    ],
  },
  {
    year: 2024,
    items: [
      "Impact Projects launch with 10 cooperation partners, among them MIT, Unite, MI4People, Allianz, IBM Research and Flower",
      "The first papers at NeurIPS '24",
      "New task forces: Med.ai, TUM.ai Build and TUM.ai Robotics",
    ],
  },
  {
    year: 2023,
    items: [
      "The first AI.Summit, a two-day conference",
      "A talk at the TUM Dies Academicus",
    ],
  },
  {
    year: 2022,
    items: [
      "The first startup tour in Berlin",
      "The first AI Bootcamp, with KNUST",
      "The AI Entrepreneur-Lab 1.0 launches",
    ],
  },
  {
    year: 2021,
    items: [
      "TUM.ai becomes a non-profit organization",
      "The first Makeathon, Industry Phase and AI Academy",
      "First participation in the ETH AI Center Summit",
    ],
  },
  {
    year: 2020,
    items: [
      "Official accreditation as a student initiative at TUM",
      "The first concept for the initiative, at UnternehmerTUM's business plan seminar",
      "The first application phase",
    ],
  },
];
