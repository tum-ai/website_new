export interface InnovationProject {
  name: string;
  description: string;
  detailedDescription: string;
  image: string;
}

export const innovationProjects: InnovationProject[] = [
  {
    name: "Women@TUM.ai",
    description:
      "Female empowerment, mentorship, and leadership across AI, business, and tech.",
    detailedDescription:
      "Women@TUM.ai builds a space where female students in AI, business, and tech can connect, grow, and take initiative. The task force focuses on empowerment, leadership, mentorship, workshops, networking, and industry collaboration.",
    image: "/assets/innovation/women_at_tumai.jpg",
  },
  {
    name: "med.AI",
    description:
      "Biomedical AI research and community-building with partners across Munich.",
    detailedDescription:
      "med.AI is a multidisciplinary team dedicated to advancing artificial intelligence in the medical domain. It brings together a biomedical AI community in Munich and works on research projects with Helmholtz Center Munich, including a pan-cancer histopathology atlas, digital pathology foundation tools, retinal OCT segmentation for biomarker discovery in gene therapy, and prediction of switching events in PDR5-GFP gene expression.",
    image: "/assets/innovation/med_ai.webp",
  },
  {
    name: "quanTUM.ai",
    description:
      "Machine learning for quantum science, from algorithms and simulation to experimental workflows.",
    detailedDescription:
      "quanTUM.ai focuses on applying machine learning across the quantum stack, including quantum algorithms, simulation, high-performance computing, and experimental workflows. Through research projects, educational sessions, community events, and hackathons, the task force bridges AI and quantum technologies in a practical, interdisciplinary way.",
    image: "",
  },
  {
    name: "Generative Modelling",
    description:
      "Educational deep dives into the math and PyTorch behind modern generative models.",
    detailedDescription:
      "The Generative Modelling task force creates educational sessions for the TUM.ai community that unpack the mathematics and PyTorch code behind models such as ChatGPT and Stable Diffusion.",
    image: "",
  },
  {
    name: "Global Affairs",
    description:
      "International outreach through expeditions, conferences, partnerships, and strategic ecosystem building.",
    detailedDescription:
      "Global Affairs drives TUM.ai's international presence by organizing expeditions to leading AI and venture hubs worldwide. The task force attends major conferences, connects with startups and research labs, builds partnerships, and acquires grants to open doors to new ecosystems for TUM.ai members.",
    image: "",
  },
];
