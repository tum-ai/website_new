import { organizationByKey } from "@/features/partners";
import type { ContentImage } from "@/lib/cms-content-model";

/** Named work a task force does with a partner, listed under its chapter. */
interface TaskForceWork {
  /** The name of the organisation the work is done with. */
  partner: string;
  /** One line per project, in the task force's own words. */
  items: string[];
}

/**
 * A task force on /projects: a small team of TUM.ai members that takes AI
 * into one other field. The page draws each one as the overlap of an AI
 * circle and its field's circle, in the order of this list. The code
 * fallback of the `taskForce` documents (`../content.ts`).
 */
export type TaskForce = {
  /** Anchor of the task force's chapter (`/projects#med-ai`). */
  slug: string;
  name: string;
  /** The field the task force brings AI into: the label of its circle. */
  field: string;
  /** One sentence: what the task force does. */
  description: string;
  /** The longer paragraph under it. */
  detailedDescription: string;
  work?: TaskForceWork;
  /** A photo of the task force's own people or work. */
  photo?: ContentImage;
  /** A factual caption for the photo: what, where, when. */
  photoCaption?: string;
};

/**
 * A task force as code writes it: the partner of its named work by
 * organisation key (the `taskForce` document references the organisation).
 */
export type TaskForceTemplate = Omit<TaskForce, "work"> & {
  work?: { partner: string; items: string[] };
};

// TODO(content): confirm the field labels, one per task force.
export const taskForceTemplates: readonly TaskForceTemplate[] = [
  {
    slug: "med-ai",
    name: "med.AI",
    field: "Medicine",
    description:
      "Biomedical AI research and community-building with partners across Munich.",
    detailedDescription:
      "med.AI is a multidisciplinary team dedicated to advancing artificial intelligence in the medical domain. It brings together a biomedical AI community in Munich and works on research projects with Helmholtz Center Munich.",
    // TODO(content): the partner is shown by its current name, Helmholtz
    // Munich; the description above still says "Helmholtz Center Munich".
    work: {
      partner: "helmholtz-munich",
      items: [
        "A pan-cancer histopathology atlas",
        "Digital pathology foundation tools",
        "Retinal OCT segmentation for biomarker discovery in gene therapy",
        "Prediction of switching events in PDR5-GFP gene expression",
      ],
    },
    photo: {
      src: "/assets/innovation/med_ai.webp",
      width: 1920,
      height: 1440,
      alt: "About a dozen people, several in TUM.ai shirts, posing in front of a projected slide",
      objectPosition: "50% 45%",
    },
    // TODO(content): confirm the event and add its date.
    photoCaption: "Medicine Meets AI, a med.AI event",
  },
  {
    slug: "quantum-ai",
    name: "quanTUM.ai",
    field: "Quantum science",
    description:
      "Machine learning for quantum science, from algorithms and simulation to experimental workflows.",
    detailedDescription:
      "quanTUM.ai focuses on applying machine learning across the quantum stack, including quantum algorithms, simulation, high-performance computing, and experimental workflows. Through research projects, educational sessions, community events, and hackathons, the task force bridges AI and quantum technologies in a practical, interdisciplinary way.",
  },
  {
    slug: "generative-modelling",
    name: "Generative Modelling",
    field: "Mathematics",
    description:
      "Educational deep dives into the math and PyTorch behind modern generative models.",
    detailedDescription:
      "The Generative Modelling task force creates educational sessions for the TUM.ai community that unpack the mathematics and PyTorch code behind models such as ChatGPT and Stable Diffusion.",
  },
  {
    slug: "women-at-tum-ai",
    name: "Women@TUM.ai",
    field: "Women in tech",
    description:
      "Female empowerment, mentorship, and leadership across AI, business, and tech.",
    detailedDescription:
      "Women@TUM.ai builds a space where female students in AI, business, and tech can connect, grow, and take initiative. The task force focuses on empowerment, leadership, mentorship, workshops, networking, and industry collaboration.",
    photo: {
      src: "/assets/innovation/women_at_tumai.jpg",
      width: 2430,
      height: 1620,
      alt: "Ten people standing in front of two whiteboards covered in sticky notes, headed Problems and Solutions",
      objectPosition: "50% 40%",
    },
    // TODO(content): confirm what the session was and when it took place.
    photoCaption: "Women@TUM.ai at a problems and solutions session",
  },
  {
    slug: "global-affairs",
    name: "Global Affairs",
    field: "Global ecosystems",
    description:
      "International outreach through expeditions, conferences, partnerships, and strategic ecosystem building.",
    detailedDescription:
      "Global Affairs drives TUM.ai's international presence by organizing expeditions to leading AI and venture hubs worldwide. The task force attends major conferences, connects with startups and research labs, builds partnerships, and acquires grants to open doors to new ecosystems for TUM.ai members.",
  },
];

/**
 * The anchor of the open circle, the page's close (`/projects#your-field`).
 * Its labels are copy (`openSeat` in `copy.ts`).
 */
export const openSeatSlug = "your-field";

/** The task forces as the page renders them: each partner by its name. */
export const taskForces: TaskForce[] = taskForceTemplates.map(
  ({ work, ...taskForce }) =>
    work
      ? {
          ...taskForce,
          work: {
            partner: organizationByKey(work.partner).name,
            items: [...work.items],
          },
        }
      : taskForce,
);
