/**
 * Local-only stand-ins for Sanity content, so the CMS-backed pages (/events,
 * /research and /partners) can be designed and tested without CMS
 * credentials.
 *
 * Used only when `USE_MOCK_CMS=1`, never on Vercel: `lib/sanity.ts` loads
 * this module with a dynamic `import()` behind that gate, so a normal request
 * never evaluates it. `MOCK_CMS_NOW` fixes the date the events are relative
 * to (see mock-cms-env.ts). The fixtures have
 * the page shapes from lib/types.ts, use shipped assets from public/ and
 * neutral example.com links, so nothing leaves the machine. Keep it free of
 * runtime imports: tests load it in plain Node.
 */
import type { Event, Partner, ResearchProject } from "./types";

const DAY = 24 * 60 * 60 * 1000;

/** ISO date `days` from `now` at 18:00 UTC, so upcoming/past splits stay stable. */
function daysFrom(now: Date, days: number) {
  const date = new Date(now.getTime() + days * DAY);
  date.setUTCHours(18, 0, 0, 0);
  return date.toISOString();
}

const longDescription =
  "Our flagship Makeathon brings together 150 students, researchers and engineers for 48 hours of building with state-of-the-art models. Teams tackle challenges from industry partners across healthcare, mobility and climate, get mentoring from domain experts, and pitch working prototypes to a jury of founders and investors. Workshops on agents, evaluation and deployment run throughout the weekend, and every participant leaves with a network that lasts well beyond the event.";

export function getMockEvents(now: Date = new Date()): Event[] {
  return [
    {
      id: "mock-event-makeathon",
      title: "TUM.ai Makeathon 2026",
      description: longDescription,
      event_date: daysFrom(now, 9),
      location: "TUM Campus Garching, Galileo",
      city: "Munich",
      category: "Hackathon",
      poster: "/assets/homepage/Makeathon.webp",
      images: ["/assets/homepage/Makeathon.webp"],
      sign_up: "https://example.com/sign-up/makeathon",
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
      images: [],
    },
    {
      id: "mock-event-elab-demo-day",
      title: "E-Lab Final Pitch",
      description:
        "Teams from the current E-Lab batch present their ventures to investors, founders and the TUM.ai community.",
      event_date: daysFrom(now, 58),
      location: "UnternehmerTUM",
      city: "Munich",
      category: "E-Lab",
      poster: "/assets/homepage/venture_onboarding25.webp",
      images: ["/assets/homepage/venture_onboarding25.webp"],
      sign_up: "https://example.com/sign-up/e-lab-final-pitch",
    },
    {
      id: "mock-event-openai-talk",
      title: "OpenAI Speaker Night",
      description:
        "Over 1,000 attendees joined us for a talk on the state of AI in Germany and what builders should focus on next.",
      event_date: daysFrom(now, -40),
      location: "Audimax, TUM Main Campus",
      city: "Munich",
      category: "Speaker",
      poster: "/assets/open_ai_speaker_event.webp",
      images: [
        "/assets/open_ai_speaker_event.webp",
        "/assets/martin_talk.webp",
      ],
    },
    {
      id: "mock-event-ibm-visit",
      title: "Research Visit at IBM",
      description:
        "Members visited the IBM lab to see current work on foundation models for science and enterprise.",
      event_date: daysFrom(now, -75),
      location: "IBM Watson Center",
      city: "Munich",
      category: "Event",
      poster: "/assets/homepage/IBM_visit.webp",
      images: ["/assets/homepage/IBM_visit.webp"],
    },
    {
      id: "mock-event-antler",
      title: "Founders Fireside with Antler",
      description:
        "A candid conversation about going from research idea to venture-backed startup.",
      event_date: daysFrom(now, -110),
      location: "Online",
      city: "Online",
      category: "E-Lab",
      poster: "/assets/homepage/Antler25.webp",
      images: ["/assets/homepage/Antler25.webp", "/assets/homepage/elab.webp"],
    },
    {
      id: "mock-event-getaway",
      title: "Member Getaway",
      description:
        "Two days in the mountains with talks, strategy sessions and plenty of time to get to know each other.",
      event_date: daysFrom(now, -160),
      location: "Bavarian Alps",
      city: "Munich",
      category: "Event",
      poster: "/assets/homepage/getaway24.webp",
      images: ["/assets/homepage/getaway24.webp"],
    },
    {
      id: "mock-event-onboarding",
      title: "Semester Onboarding",
      description: "Welcoming the new generation of TUM.ai members.",
      event_date: daysFrom(now, -200),
      location: "TUM Main Campus",
      city: "Munich",
      category: "Event",
      images: ["/assets/homepage/Onboarding25.webp"],
    },
  ];
}

/**
 * Mirrors the live research documents (2026-09), including their rough
 * edges: several institutions or a person before the colon, a line break in
 * a title, a missing image and mostly empty keywords. Images are local
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
      description:
        "Working on long-form video understanding, reasoning over hours of surgical video.",
      status: "ongoing",
      keywords: [],
    },
    {
      id: "mock-research-retro-rank",
      title:
        "MIT: Ranking-Based Approach for Inorganic Materials Synthesis Planning",
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

export function getMockPartners(): Partner[] {
  return [
    { name: "IBM", logo: "ibm.png", link: "https://research.ibm.com" },
    { name: "NVIDIA", logo: "nvidia.webp", link: "https://www.nvidia.com" },
    { name: "Google", logo: "google.webp", link: "https://research.google" },
    { name: "Meta", logo: "meta.svg", link: "https://ai.meta.com" },
    {
      name: "Databricks",
      logo: "databricks.svg",
      link: "https://www.databricks.com",
    },
    { name: "Cohere", logo: "cohere.svg", link: "https://cohere.com" },
  ].map(({ name, logo, link }) => ({
    id: `mock-partner-${name.toLowerCase()}`,
    name,
    link,
    image: `/assets/partners/logos/${logo}`,
    category: name === "IBM" ? "Research Partners" : "Technical Partners",
  }));
}

/** The partners `RESEARCH_PARTNERS_QUERY` would return. */
export function getMockResearchPartners(): Partner[] {
  return getMockPartners().filter(
    (partner) => partner.category === "Research Partners",
  );
}
