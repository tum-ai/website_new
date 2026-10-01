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

/**
 * A milestone as code writes it: `key` names its `milestone` document in
 * the backfill (`milestone-<key>`), fixed so a copy edit in code never
 * turns into a second document. Pages never see it.
 */
export type MilestoneTemplate = Milestone & { key: string };

/**
 * TUM.ai's milestones since its founding, oldest first: the code fallback of
 * the `milestone` documents (`../content.ts`). Details may hold
 * `{{placeholders}}` for site facts, filled on the server.
 */
export const milestones: MilestoneTemplate[] = [
  {
    key: "2020-accredited-at-tum",
    year: 2020,
    kind: "organization",
    title: "Accredited at TUM",
    detail: "As an official student initiative",
  },
  {
    key: "2020-first-concept",
    year: 2020,
    kind: "organization",
    title: "First concept",
    detail: "At UnternehmerTUM's business plan seminar",
  },
  {
    key: "2020-first-application-phase",
    year: 2020,
    kind: "organization",
    title: "First application phase",
  },
  {
    key: "2021-non-profit-organization",
    year: 2021,
    kind: "organization",
    title: "Non-profit organization",
  },
  {
    key: "2021-first-makeathon",
    year: 2021,
    kind: "events",
    title: "First Makeathon",
  },
  {
    key: "2021-eth-ai-center-summit",
    year: 2021,
    kind: "events",
    title: "ETH AI Center Summit",
    detail: "First participation",
  },
  {
    key: "2021-first-industry-phase",
    year: 2021,
    kind: "programs",
    title: "First Industry Phase",
  },
  {
    key: "2021-first-ai-academy",
    year: 2021,
    kind: "programs",
    title: "First AI Academy",
  },
  {
    key: "2022-first-startup-tour",
    year: 2022,
    kind: "events",
    title: "First startup tour",
    detail: "Berlin",
  },
  {
    key: "2022-first-ai-bootcamp",
    year: 2022,
    kind: "programs",
    title: "First AI Bootcamp",
    detail: "With KNUST",
  },
  {
    key: "2022-ai-entrepreneur-lab-1-0",
    year: 2022,
    kind: "programs",
    title: "AI Entrepreneur-Lab 1.0",
  },
  {
    key: "2023-first-ai-summit",
    year: 2023,
    kind: "events",
    title: "First AI.Summit",
    detail: "A two-day conference",
  },
  {
    key: "2023-tum-dies-academicus",
    year: 2023,
    kind: "events",
    title: "TUM Dies Academicus",
    detail: "As a speaker",
  },
  {
    key: "2024-impact-projects",
    year: 2024,
    kind: "research",
    title: "Impact Projects",
    detail:
      "With 10 cooperation partners, among them MIT, Unite, MI4People, Allianz, IBM Research and Flower",
  },
  {
    key: "2024-first-papers-at-neurips-24",
    year: 2024,
    kind: "research",
    title: "First papers at NeurIPS '24",
  },
  {
    key: "2024-new-task-forces",
    year: 2024,
    kind: "programs",
    title: "New task forces",
    detail: "Med.ai, TUM.ai Build and TUM.ai Robotics",
  },
  {
    // The key keeps its old year: it is the CMS document id. The BenchPress
    // Makeathon with Aleph Alpha took place on 23 and 24 November 2024.
    key: "2025-hackathon-with-aleph-alpha",
    year: 2024,
    kind: "events",
    title: "Hackathon with Aleph Alpha",
    detail: "The first smaller hackathon",
  },
  {
    key: "2025-icml-and-iclr",
    year: 2025,
    kind: "research",
    title: "ICML and ICLR",
    detail: "A main-track paper at ICML and a publication at ICLR",
  },
  {
    key: "2025-event-with-openai",
    year: 2025,
    kind: "events",
    title: "Event with OpenAI",
    detail: "The first after their Munich office opened, 1200+ signups",
  },
  {
    key: "2025-biggest-makeathon-yet",
    year: 2025,
    kind: "events",
    title: "Biggest Makeathon yet",
    detail: "{{community.makeathonSize}}+ registrations",
  },
  {
    key: "2025-summer-hackathon",
    year: 2025,
    kind: "events",
    title: "Summer hackathon",
    detail: "With AWS, Lovable, ElevenLabs, Google, Anthropic and others",
  },
  {
    key: "2025-tum-ai-berlin",
    year: 2025,
    kind: "organization",
    title: "TUM.ai Berlin",
    detail: "The expansion to Berlin",
  },
];

/** The years a matrix of `list` spans, oldest first, with no gaps. */
export function milestoneYearsOf(list: readonly Milestone[]): number[] {
  const years = list.map((milestone) => milestone.year);
  const first = Math.min(...years);
  return Array.from(
    { length: Math.max(...years) - first + 1 },
    (_, index) => first + index,
  );
}

/** The milestones of `list` in one matrix cell, in list order. */
export const milestonesIn = (
  list: readonly Milestone[],
  kind: MilestoneKind,
  year: number,
) =>
  list.filter(
    (milestone) => milestone.kind === kind && milestone.year === year,
  );
