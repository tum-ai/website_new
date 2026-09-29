import { communityFacts } from "@/config/community";

/** The rows of the programme matrix: what kind of thing members started. */
export const milestoneKinds = [
  { id: "research", label: "Research" },
  { id: "programs", label: "Programs" },
  { id: "events", label: "Events and hackathons" },
  { id: "organization", label: "Organization" },
] as const;

export type MilestoneKind = (typeof milestoneKinds)[number]["id"];

/** One thing TUM.ai's members started, in the year they started it. */
export type Milestone = {
  year: number;
  kind: MilestoneKind;
  /** A few words, set in the matrix cell. */
  title: string;
  /** The rest of the fact, under the title. */
  detail?: string;
};

/** TUM.ai's milestones since its founding, oldest first. */
export const milestones: Milestone[] = [
  {
    year: 2020,
    kind: "organization",
    title: "Accredited at TUM",
    detail: "As an official student initiative",
  },
  {
    year: 2020,
    kind: "organization",
    title: "First concept",
    detail: "At UnternehmerTUM's business plan seminar",
  },
  { year: 2020, kind: "organization", title: "First application phase" },
  { year: 2021, kind: "organization", title: "Non-profit organization" },
  { year: 2021, kind: "events", title: "First Makeathon" },
  {
    year: 2021,
    kind: "events",
    title: "ETH AI Center Summit",
    detail: "First participation",
  },
  { year: 2021, kind: "programs", title: "First Industry Phase" },
  { year: 2021, kind: "programs", title: "First AI Academy" },
  { year: 2022, kind: "events", title: "First startup tour", detail: "Berlin" },
  {
    year: 2022,
    kind: "programs",
    title: "First AI Bootcamp",
    detail: "With KNUST",
  },
  { year: 2022, kind: "programs", title: "AI Entrepreneur-Lab 1.0" },
  {
    year: 2023,
    kind: "events",
    title: "First AI.Summit",
    detail: "A two-day conference",
  },
  {
    year: 2023,
    kind: "events",
    title: "TUM Dies Academicus",
    detail: "As a speaker",
  },
  {
    year: 2024,
    kind: "research",
    title: "Impact Projects",
    detail:
      "With 10 cooperation partners, among them MIT, Unite, MI4People, Allianz, IBM Research and Flower",
  },
  { year: 2024, kind: "research", title: "First papers at NeurIPS '24" },
  {
    year: 2024,
    kind: "programs",
    title: "New task forces",
    detail: "Med.ai, TUM.ai Build and TUM.ai Robotics",
  },
  {
    year: 2025,
    kind: "research",
    title: "ICML and ICLR",
    detail: "A main-track paper at ICML and a publication at ICLR",
  },
  {
    year: 2025,
    kind: "events",
    title: "Hackathon with Aleph Alpha",
    detail: "The first smaller hackathon",
  },
  {
    year: 2025,
    kind: "events",
    title: "Event with OpenAI",
    detail: "The first after their Munich office opened, 1200+ signups",
  },
  {
    year: 2025,
    kind: "events",
    title: "Biggest Makeathon yet",
    detail: `${communityFacts.makeathonSize}+ registrations`,
  },
  {
    year: 2025,
    kind: "events",
    title: "Summer hackathon",
    detail: "With AWS, Lovable, ElevenLabs, Google, Anthropic and others",
  },
  {
    year: 2025,
    kind: "organization",
    title: "TUM.ai Berlin",
    detail: "The expansion to Berlin",
  },
];

/** The years the matrix spans, oldest first, with no gaps. */
export const milestoneYears: number[] = (() => {
  const years = milestones.map((milestone) => milestone.year);
  const first = Math.min(...years);
  return Array.from(
    { length: Math.max(...years) - first + 1 },
    (_, index) => first + index,
  );
})();

/** The milestones of one matrix cell, in list order. */
export const milestonesIn = (kind: MilestoneKind, year: number) =>
  milestones.filter(
    (milestone) => milestone.kind === kind && milestone.year === year,
  );
