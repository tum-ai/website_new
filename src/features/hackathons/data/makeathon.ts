/**
 * Every TUM.ai Makeathon, oldest first: the code fallback of the editions
 * in the `hackathonsCopy` singleton (see `../content.ts`). The ribbon draws
 * them as its top lane, and the Makeathon band lists them as a ledger.
 *
 * Sources (2026-10-01): the Devpost page of each edition, UnternehmerTUM
 * (2021), Munich Startup (spring 2022), and the Makeathon's and the
 * league's own sites (2026, `config/hackathons.ts`).
 */
export type MakeathonEdition = {
  /** Stable key, also the backfill key: "2026", "2022-autumn". */
  key: string;
  /** The edition's name as the ledger lists it. */
  name: string;
  /** First day, a Munich calendar date (YYYY-MM-DD). */
  start: string;
  /** Last day, a Munich calendar date (YYYY-MM-DD). */
  end: string;
  /** Where it took place: the city the ribbon matches events by. */
  city: string;
  /** One or two sentences under the name: where, who brought challenges. */
  note: string;
  /** A source worth reading, after the note (a paper, a project gallery). */
  link?: { label: string; href: string };
};

export const makeathonEditions: readonly MakeathonEdition[] = [
  {
    key: "2021",
    name: "GPT-3 Makeathon",
    // TODO(content): the build days before the finale on 18 April 2021.
    start: "2021-04-18",
    end: "2021-04-18",
    city: "Munich",
    note: "The first Makeathon, built on GPT-3 with OpenAI, appliedAI and TUM Venture Labs, and judged by a jury from Cherry Ventures, Microsoft and IBM.",
  },
  {
    // Source: the old site's edition page (Wayback Machine, tum-ai.com/makeathon-oct21.html).
    key: "2021-autumn",
    name: "Virtual Makeathon",
    start: "2021-10-15",
    end: "2021-10-17",
    city: "Online",
    note: "A virtual 48-hour edition with Microsoft and appliedAI. Team Cabalytics won with CabMate, which predicts where taxis will be needed across the city.",
  },
  {
    key: "2022-spring",
    name: "AI4SocialGood",
    start: "2022-04-22",
    end: "2022-04-24",
    city: "Munich",
    note: "Challenges in education, environment and medtech from Infineon, Deloitte, NetApp and MI4People.",
  },
  {
    key: "2022-autumn",
    name: "AI for Global Impact",
    start: "2022-09-30",
    end: "2022-10-02",
    city: "Munich",
    note: "A hybrid edition with Microsoft, Roche, IBM and TNG Consulting.",
  },
  {
    key: "2023",
    name: "AI for everyone",
    start: "2023-04-28",
    end: "2023-04-30",
    city: "Munich",
    note: "On the Garching campus, with ESA, Microsoft, the BMW Group, G-Research, Cohere and Daiki.",
  },
  {
    key: "2024",
    name: "Makeathon 2024",
    start: "2024-04-26",
    end: "2024-04-28",
    city: "Munich",
    note: "Sixteen partners, from Mercedes and Salesforce to Dr. von Hauner Children's Hospital, whose challenge became a paper.",
    link: {
      label: "Read the paper",
      href: "https://arxiv.org/abs/2510.25277",
    },
  },
  {
    key: "2025",
    name: "Makeathon 2025",
    start: "2025-04-25",
    end: "2025-04-27",
    city: "Munich",
    note: "Challenges from CHECK24 and Reply and an open track by OpenAI, with QuantCo, Jane Street and Entrepreneur First.",
  },
  {
    key: "2026",
    name: "Makeathon 2026",
    start: "2026-04-17",
    end: "2026-04-19",
    city: "Munich",
    note: "101 teams on challenges from HappyRobot, Spherecast, osapiens and Reply. The first match of the European Hackathon League.",
  },
];
