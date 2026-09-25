/**
 * Local-only stand-ins for Sanity content, so CMS-backed pages (/events,
 * /research) can be designed and tested without CMS credentials.
 *
 * Enabled only with `USE_MOCK_CMS=1` and never on Vercel. The fixtures follow
 * the shapes produced by src/lib/sanity-queries.ts and use shipped assets from
 * public/, so nothing leaves the machine. This module must stay importable in
 * plain Node (tests), so it imports types only.
 */
import type { Event, Partner, Research } from "./types";

type Env = Record<string, string | undefined>;

export function shouldUseMockCms(env: Env): boolean {
  return env.USE_MOCK_CMS === "1" && !env.VERCEL;
}

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
      sign_up: "https://www.tum-ai.com/apply",
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
      sign_up: "https://www.tum-ai.com/events",
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
      sign_up: "https://tally.so/r/xXBkW9",
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

export function getMockResearchProjects(): Research[] {
  return [
    {
      id: "mock-research-robotics",
      title: "TUM: Language-Conditioned Robotic Manipulation",
      description:
        "We study how vision-language models can ground natural-language instructions into robust manipulation policies, with a focus on generalization to unseen objects.",
      status: "ongoing",
      keywords: "Robotics, VLMs, Imitation Learning",
      image: "/assets/innovation/robotics_arm.webp",
    },
    {
      id: "mock-research-medical",
      title: "LMU: Uncertainty-Aware Medical Imaging",
      description:
        "Calibrated uncertainty estimates for segmentation models used in radiology workflows, developed together with clinicians.",
      status: "ongoing",
      keywords: "Healthcare, Computer Vision, Uncertainty",
      image: "/assets/innovation/med_ai.webp",
    },
    {
      id: "mock-research-accelerated",
      title: "Helmholtz Munich: Efficient Protein Language Models",
      description:
        "Distillation and quantization strategies that make protein language models practical on a single GPU.",
      status: "ongoing",
      keywords: "Biology, Efficiency, Transformers",
      image: "/assets/innovation/accelerated_computing.webp",
    },
    {
      id: "mock-research-ibm",
      title: "IBM: Foundation Models for Earth Observation",
      description:
        "Fine-tuning geospatial foundation models for flood and wildfire mapping from satellite imagery.",
      status: "completed",
      publication: "https://arxiv.org/abs/2310.18660",
      keywords: "Remote Sensing, Foundation Models",
      image: "/assets/innovation/robotics_discussion.webp",
    },
    {
      id: "mock-research-mit",
      title: "MIT, Evaluating Reasoning in Small Language Models",
      description:
        "A benchmark suite and analysis of multi-step reasoning failures in sub-10B parameter models.",
      status: "completed",
      publication: "https://arxiv.org/abs/2305.10601",
      keywords: "NLP, Evaluation, Reasoning",
    },
    {
      id: "mock-research-cambridge",
      title: "Cambridge: Causal Representation Learning",
      description:
        "Identifiability results and practical methods for learning causal variables from high-dimensional observations.",
      status: "completed",
      keywords: "Causality, Representation Learning",
      image: "/assets/innovation/robotics_writing.webp",
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
    category: "Research Partners",
  }));
}
