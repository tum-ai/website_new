/**
 * Local-only stand-ins for Sanity content, so the CMS-backed pages (/events
 * and /research) can be designed and tested without CMS credentials. The
 * partners are organisations, a content slice: under the mock their code
 * backfill is queried instead (`lib/cms-content-mock.ts`).
 *
 * Used only when `USE_MOCK_CMS=1`, never on Vercel: `lib/sanity.ts` loads
 * this module with a dynamic `import()` behind that gate, so a normal request
 * never evaluates it. `MOCK_CMS_NOW` fixes the date the events are relative
 * to (see mock-cms-env.ts). The fixtures have
 * the page shapes from lib/types.ts, use shipped assets from public/ and
 * neutral example.com links, so nothing leaves the machine. Keep it free of
 * runtime imports: tests load it in plain Node.
 */
import type { Event, ResearchProject } from "./types";

const DAY = 24 * 60 * 60 * 1000;

/** ISO date `days` from `now` at 18:00 UTC, so upcoming/past splits stay stable. */
function daysFrom(now: Date, days: number) {
  const date = new Date(now.getTime() + days * DAY);
  date.setUTCHours(18, 0, 0, 0);
  return date.toISOString();
}

/** A co-host organisation as `coHosts` projects it. */
const host = (key: string, name: string) => ({ key, name });

/**
 * A past event with its fixed date; only the fields /events reads. Its
 * `hosts` (the old site's names) are its co-hosts' names.
 */
type PastEvent = Omit<Event, "id" | "images" | "hosts"> & {
  id: string;
  images?: string[];
};

/**
 * The live events as of 2026-09 (titles, dates, venues, categories), with
 * their co-hosts filled from each event's title and description: the
 * co-hosts, sponsors and challenge partners the CMS text names, as the
 * organisations `coHosts` references (`pnpm sanity:migrate-org-references`
 * sets them from the names). Speakers and jury members are left out. Posters and photos are local stand-ins (the live
 * posters are square social graphics on the Sanity CDN), and descriptions are
 * shortened and free of names.
 *
 * The live documents in `production` have no `hosts`: the backfill adds the
 * names to its copies of them in the new site's dataset
 * ({@link liveEventHosts}).
 */
const pastEvents: PastEvent[] = [
  {
    id: "mock-event-ai-entrepreneurship",
    title: "AI & Entrepreneurship Speaker Event",
    description:
      "Speakers from OpenAI, Google, SPRIND and Project A on turning AI research into companies, followed by a discussion on the future of AI in business. Co-hosted with CDTM and made possible by Project A, Beyond Presence, Mercura and Red Bull.",
    event_date: "2025-03-09T00:00:00.000Z",
    location: "TUM Audimax",
    city: "Munich",
    category: "Speaker",
    coHosts: [
      host("cdtm", "CDTM"),
      host("project-a", "Project A"),
      host("beyond-presence", "Beyond Presence"),
      host("mercura", "Mercura"),
      host("red-bull", "Red Bull"),
    ],
    poster: "/assets/open_ai_speaker_event.webp",
    images: ["/assets/open_ai_speaker_event.webp", "/assets/martin_talk.webp"],
  },
  {
    id: "mock-event-aws-lovable-n8n",
    title: "AWS x Lovable x n8n Hackathon",
    description:
      "Zero to product in one day: turn an idea into a working product with tools from Lovable, AWS and n8n.",
    event_date: "2025-08-29T07:00:00.000Z",
    location: "CDTM Offices / TUM",
    city: "Munich",
    category: "Hackathon",
    coHosts: [
      host("aws", "AWS"),
      host("lovable", "Lovable"),
      host("n8n", "n8n"),
    ],
    poster: "/assets/innovation/robotics_writing.webp",
  },
  {
    id: "mock-event-google",
    title: "Google Hackathon",
    description:
      "A two-day hackathon with CDTM and Google Cloud: build agents with Vertex AI and the Agent Development Kit.",
    event_date: "2025-09-08T00:00:00.000Z",
    location: "Google Office",
    city: "Munich",
    category: "Hackathon",
    coHosts: [host("google-cloud", "Google Cloud"), host("cdtm", "CDTM")],
    poster: "/assets/homepage/nvidia-5.webp",
    images: ["/assets/homepage/nvidia-5.webp", "/assets/home_img2.webp"],
  },
  {
    id: "mock-event-cofounder-matching",
    title: "Co-founder Matching - TUM.ai x Manage & More x CDTM x Tacto",
    description:
      "Looking for a co-founder, or curious to meet other builders? Learn about the TUM.ai E-Lab and Tacto, pitch your idea and find teammates. Representatives from TUM.ai, Manage & More and CDTM join to widen your network. Seats are limited and go first come, first served, so fill out the questions when you register to help us make the best matches.",
    event_date: "2025-09-17T17:00:00.000Z",
    location: "Tacto Office",
    city: "Munich",
    category: "Event",
    coHosts: [
      host("manage-and-more", "Manage & More"),
      host("cdtm", "CDTM"),
      host("tacto", "Tacto"),
    ],
    poster: "/assets/homepage/venture_onboarding25.webp",
  },
  {
    id: "mock-event-anthropic-lovable-hf",
    title: "Anthropic x Lovable x Hugging Face",
    description:
      "A three-day hackathon with CDTM and our partners Anthropic, Lovable and Hugging Face.",
    event_date: "2025-09-24T00:00:00.000Z",
    location: "TUM Audimax",
    city: "Munich",
    category: "Hackathon",
    coHosts: [
      host("anthropic", "Anthropic"),
      host("lovable", "Lovable"),
      host("hugging-face", "Hugging Face"),
      host("cdtm", "CDTM"),
    ],
    poster: "/assets/apply/new_section_photo_4.webp",
  },
  {
    id: "mock-event-bkw",
    title: "BKW Hackathon",
    description:
      "Powered by BKW Engineering: 40 students and engineers from across the DACH region, 24 hours of building, testing and creating.",
    event_date: "2025-10-18T00:00:00.000Z",
    location: "Mark, Munich",
    city: "Munich",
    category: "Hackathon",
    coHosts: [host("bkw", "BKW")],
  },
  {
    id: "mock-event-bmw",
    title: "BMW Hackathon",
    description:
      "BMW's Open Innovation Robotics AI Hackathon: build AI systems that act, not just answer, with BMW experts and 40 students.",
    event_date: "2025-10-24T00:00:00.000Z",
    location: "BMW Office",
    city: "Munich",
    category: "Hackathon",
    coHosts: [host("bmw", "BMW")],
    poster: "/assets/innovation/robotics_arm.webp",
  },
  {
    id: "mock-event-anthropic-christmas",
    title: "TUM.ai x Anthropic Christmas Hackathon",
    description:
      "An end-of-year hackathon to build intelligent systems with Anthropic's models.",
    event_date: "2025-12-13T00:00:00.000Z",
    location: "Munich",
    city: "Munich",
    category: "Hackathon",
    coHosts: [host("anthropic", "Anthropic")],
    poster: "/assets/innovation/robotics_discussion.webp",
  },
  {
    id: "mock-event-elab-final-winter",
    title: "E-Lab Final Pitch",
    description:
      "After 14 weeks in our equity-free, student-led AI startup incubator, the E-Lab founders present their ventures. An evening of ideas and real products, with speakers from OpenAI, Google and Lovable and a jury of investors including UVC Partners, Speedinvest and Balderton. Join founders, investors, operators and everyone curious about AI startups in Munich. Free tickets are limited and go first come, first served.",
    event_date: "2026-01-23T17:30:00.000Z",
    location: "Freiheitshalle",
    city: "Munich",
    category: "Event",
    poster: "/assets/homepage/elab.webp",
  },
  {
    id: "mock-event-data-mining",
    title: "Data Mining Hackathon",
    description:
      "Ship systems, not prototypes: 48 hours to design high-throughput, cost-efficient data systems, judged by concrete metrics and product impact.",
    event_date: "2026-03-06T00:00:00.000Z",
    location: "TUM.ai Homebase",
    city: "Munich",
    category: "Hackathon",
    poster: "/assets/innovation/accelerated_computing.webp",
  },
  {
    id: "mock-event-elab-info",
    title: "Info Session E-Lab",
    description:
      "Learn how the AI E-Lab turns an idea into a venture, from the first concept to pitching in front of a jury.",
    event_date: "2026-03-09T17:30:00.000Z",
    location: "TUM.ai Office, Rosenheimer Straße 116A",
    city: "Munich",
    category: "E-Lab",
    poster: "/assets/homepage/Antler25.webp",
  },
  {
    id: "mock-event-women-in-startups",
    title: "E-Lab: Women in Startups",
    description:
      "A women-only founder evening with founders and investors from YC-backed startups and venture capital, to encourage more women to start their own venture.",
    event_date: "2026-03-16T17:30:00.000Z",
    location: "TUM.ai Office, Rosenheimer Straße 116A - 7th floor",
    city: "Munich",
    category: "Speaker",
    poster: "/assets/innovation/women_at_tumai.jpg",
  },
  {
    id: "mock-event-elab-online-info",
    title: "E-Lab: Online Info Session",
    description:
      "An inside look at the E-Lab: who it is for, how it runs from day one to the final pitch, and what it takes to get into top accelerators.",
    event_date: "2026-03-25T00:00:00.000Z",
    location: "Online",
    city: "Online",
    category: "E-Lab",
    poster: "/assets/home_img4.webp",
  },
  {
    id: "mock-event-agora",
    title: "Agora Hacks",
    description:
      "Build solutions for better public discourse in 48 hours, and rethink how we debate, share and decide online.",
    event_date: "2026-04-10T16:00:00.000Z",
    location: "Cafe Luitpold",
    city: "Munich",
    category: "Hackathon",
    poster: "/assets/apply/new_section_photo_3.webp",
  },
  {
    id: "mock-event-life-sciences",
    title: "AI × Life Sciences",
    description:
      "An evening at the intersection of AI and the life sciences: talks on AI in bioinformatics, an open Q&A and networking with MSc and PhD students.",
    event_date: "2026-04-15T16:30:00.000Z",
    location: "TUM.ai Office, Rosenheimer Straße 116A - 7th floor",
    city: "Munich",
    category: "Speaker",
    poster: "/assets/innovation/med_ai.webp",
  },
  {
    id: "mock-event-makeathon",
    title: "Makeathon 2026",
    description: "Less talking, more building: the TUM.ai Makeathon 2026.",
    event_date: "2026-04-17T00:00:00.000Z",
    location: "TUM Main Campus",
    city: "Munich",
    category: "Hackathon",
    poster: "/assets/homepage/Makeathon.webp",
  },
  {
    id: "mock-event-project-a-yellow",
    title: "Project A x Yellow x TUM.ai E-Lab - Hackathon",
    description:
      "Got a startup idea you can't stop thinking about? Project A, Yellow and the TUM.ai E-Lab join forces for an evening of building.",
    event_date: "2026-04-30T16:00:00.000Z",
    location: "TUM.ai Office, Rosenheimer Straße 116A - 7th floor",
    city: "Munich",
    category: "Hackathon",
    coHosts: [host("project-a", "Project A"), host("yellow", "Yellow")],
    poster: "/assets/home_img2.webp",
  },
  {
    id: "mock-event-elab-midterm",
    title: "E-Lab Midterm Pitch",
    description:
      "After seven weeks in the program, the E-Lab startups present their progress to a jury.",
    event_date: "2026-06-04T00:00:00.000Z",
    location: "Cafe Luitpold",
    city: "Munich",
    category: "Event",
    poster: "/assets/partners_pic.webp",
  },
  {
    id: "mock-event-energy",
    title: "Energy Hack",
    description:
      "A 24-hour hackathon on the energy industry: renewables, the grid, storage and AI for energy.",
    event_date: "2026-06-12T16:00:00.000Z",
    location: "Location TBA on signup",
    city: "Munich",
    category: "Hackathon",
    poster: "/assets/apply/new_section_photo_1.webp",
  },
  {
    id: "mock-event-elab-final-summer",
    title: "E-Lab Final Pitch",
    description:
      "The E-Lab startups take the stage after 12 weeks in the program and present their ventures to a jury.",
    event_date: "2026-07-10T00:00:00.000Z",
    location: "TBA",
    category: "Event",
    poster: "/assets/homepage/Onboarding25.webp",
  },
];

/**
 * The co-hosts of the live events, with the title and start that identify
 * each event: the `hosts` that `pnpm sanity:backfill` adds to its copies of
 * the old site's events (scripts/sanity/production-copy.ts, which fails on
 * an entry that matches no event). After the import, editors keep them in
 * the Studio.
 */
export const liveEventHosts: readonly {
  title: string;
  event_date: string;
  hosts: readonly string[];
}[] = pastEvents.flatMap(({ title, event_date, coHosts }) =>
  coHosts?.length
    ? [{ title, event_date, hosts: coHosts.map(({ name }) => name) }]
    : [],
);

const longDescription =
  "Join our E-Lab info session for an inside look at the program: who it is for, how it runs from day one to the final pitch, how to turn an idea into a real venture, and what it takes to get into top accelerators and raise funding. You can ask the team every question you have. Whether you already have a startup idea or just the drive to build something ambitious, this session gives you clarity on your next steps.";

/**
 * The /events fixtures: the live past events above, at their real dates, and
 * three upcoming ones placed relative to `now` so the page always has a
 * "next" (E2E pins `now` with MOCK_CMS_NOW).
 */
export function getMockEvents(now: Date = new Date()): Event[] {
  const upcoming: Event[] = [
    {
      id: "mock-event-elab-info-next",
      title: "E-Lab Info Session",
      description: longDescription,
      event_date: daysFrom(now, 9),
      location: "TUM.ai Office, Rosenheimer Straße 116A",
      city: "Munich",
      category: "E-Lab",
      hosts: [],
      poster: "/assets/homepage/venture_onboarding25.webp",
      images: ["/assets/homepage/venture_onboarding25.webp"],
      sign_up: "https://example.com/sign-up/e-lab-info-session",
    },
    {
      id: "mock-event-speaker-nvidia",
      title: "Accelerated Computing with NVIDIA",
      description:
        "An evening talk on how modern GPU systems are designed for training and serving frontier models, followed by Q&A and networking.",
      event_date: daysFrom(now, 21),
      location: "Munich Urban Colab",
      city: "Munich",
      category: "Speaker",
      hosts: ["NVIDIA"],
      coHosts: [host("nvidia", "NVIDIA")],
      poster: "/assets/homepage/nvidia-5.webp",
      images: ["/assets/homepage/nvidia-5.webp"],
      sign_up: "https://example.com/sign-up/nvidia-talk",
    },
    {
      id: "mock-event-online-agents",
      title: "Building Reliable AI Agents",
      description:
        "A hands-on online workshop covering tool use, evaluation loops and failure analysis for agentic systems.",
      event_date: daysFrom(now, 34),
      location: "Zoom",
      city: "Online",
      category: "Event",
      hosts: [],
      images: [],
    },
  ];

  return [
    ...upcoming,
    ...pastEvents.map((event) => ({
      ...event,
      hosts: (event.coHosts ?? []).map(({ name }) => name),
      images: event.images ?? (event.poster ? [event.poster] : []),
    })),
  ];
}

/**
 * Mirrors the live research documents (2026-09), including their rough
 * edges: several institutions or a person before the colon, a line break in
 * a title, a missing image and mostly empty keywords. Two carry their
 * `institutions` references (as `pnpm sanity:migrate-org-references` sets
 * them), the rest only the names in their titles. Images are local
 * stand-ins for the CMS photos.
 */
export function getMockResearchProjects(): ResearchProject[] {
  return [
    {
      id: "mock-research-uav",
      title:
        "University of Cambridge, Prof. Olaf Wysocki: Aerial Visual Localization with Depth and Semantic 3D City Models",
      description:
        "SemCity-LoC localizes UAV cameras in cities without GNSS or dense, textured 3D meshes. It aligns lightweight semantic 3D city models with image-inferred semantics and depth to estimate the camera pose end-to-end, for search-and-rescue, autonomous drone navigation and urban mapping.",
      status: "ongoing",
      keywords: [],
      image: "/assets/innovation/robotics_arm.webp",
    },
    {
      id: "mock-research-sycophancy",
      title: "IBM Almaden: Sycophancy in LMs",
      description:
        "We study sycophancy, the tendency of language models to echo a user's stated beliefs at the expense of truth, and build open datasets and a lean benchmark suite to detect, track and mitigate it without eroding helpfulness.",
      status: "ongoing",
      keywords: [],
      image: "/assets/innovation/accelerated_computing.webp",
    },
    {
      id: "mock-research-tool-calling",
      title: "IBM Almaden: Reinforcement Learning for Tool calling",
      description:
        "Reinforcement learning for reliable tool choice, argument filling and error recovery in tool-augmented LLMs that use the Model Context Protocol, rewarded by task success, latency and safety checks.",
      status: "ongoing",
      keywords: [],
      image: "/assets/innovation/robotics_discussion.webp",
    },
    {
      id: "mock-research-cells",
      title: "Helmholtz Zentrum: Cell Embeddings & Dendrite Segmentation",
      description:
        "DINOv3-based cell embeddings with unsupervised subclusters; PSPA-based neuron and dendrite segmentation in brightfield confocal microscopy.",
      status: "ongoing",
      keywords: [
        "Self-Supervised Learning",
        "Cellular Representation",
        "Neuronal Segmentation",
        "Fate Prediction",
      ],
      image: "/assets/innovation/med_ai.webp",
    },
    {
      id: "mock-research-surgical-video",
      title: "TUM CAMP: Long-Form Surgical Video Understanding",
      institutions: [{ key: "tum-camp", name: "TUM CAMP" }],
      description:
        "Working on long-form video understanding, reasoning over hours of surgical video.",
      status: "ongoing",
      keywords: [],
    },
    {
      id: "mock-research-retro-rank",
      title:
        "MIT: Ranking-Based Approach for Inorganic Materials Synthesis Planning",
      institutions: [{ key: "mit", name: "MIT" }],
      description:
        "Retro-Rank-In: ranking framework for inorganic retrosynthesis with state-of-the-art generalization.",
      status: "completed",
      publication: "https://arxiv.org/abs/2502.04289",
      keywords: ["Retrosynthesis", "Inorganic Chemistry", "Reaction Ranking"],
      image: "/assets/innovation/robotics_writing.webp",
    },
    {
      id: "mock-research-reaction-graphs",
      title: "MIT: Reaction Graph Networks for Synthesis\nCondition Prediction",
      description:
        "Reaction Graph Network (RGN) for predicting solid-state synthesis conditions, accelerating materials discovery.",
      status: "completed",
      publication: "https://openreview.net/pdf?id=VGsXQOTs1E",
      keywords: [
        "Graph Neural Networks",
        "Synthesis Prediction",
        "Materials Science",
      ],
      image: "/assets/innovation/accelerated_computing.webp",
    },
    {
      id: "mock-research-surgical-4d",
      title:
        "LMU Klinikum, TUM, CAMP: 4D Gaussians & Scene Graphs for Surgical Spatial Intelligence",
      description:
        "4D surgical video reconstruction with Gaussian Splatting and foundation model embeddings; enables spatial reasoning for autonomous surgery.",
      status: "ongoing",
      keywords: [
        "4D Reconstruction",
        "Surgical Scene Understanding",
        "Scene Graphs",
        "Representation Learning",
      ],
      image: "/assets/innovation/med_ai.webp",
    },
    {
      id: "mock-research-synthesizability",
      title:
        " MIT: Neural Prediction of Synthesizability from Phase-Diagram Graphs ",
      description:
        "RetroSynth: graph-of-phases synthesizability prediction that models phase competition with context-aware message passing for higher PR-AUC and better-calibrated lab-ready candidates.",
      status: "ongoing",
      keywords: [
        "Graph Neural Networks",
        "Synthesis Prediction",
        "Materials Science",
      ],
      image: "/assets/innovation/robotics_writing.webp",
    },
    {
      id: "mock-research-number-tokens",
      title: "IBM Research: Regression-like Loss on Number Tokens",
      description:
        "Number Token Loss (NTL): token-level regression for improved numerical reasoning in language models with zero runtime overhead.",
      status: "completed",
      publication: "https://tum-ai.github.io/number-token-loss/",
      keywords: [
        "Numerical Reasoning",
        "Language Models",
        "Token-Level Regression",
      ],
      image: "/assets/innovation/robotics_discussion.webp",
    },
  ];
}
