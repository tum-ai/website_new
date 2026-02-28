import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { InnovationProjectCard } from "@/components/innovation/InnovationProjectCard";
import { getSEOConfig } from "@/config/seo";

// Data Definition
const departments = [
  {
    id: "medai",
    name: "med.AI",
    description: "Advancing the frontier of artificial intelligence in the medical domain.",
    image: "",
    detailedDescription: "MedAI is a multidisciplinary team dedicated to advancing the frontier of artificial intelligence in the medical domain. Our vision is to build a strong biomedical AI community in Munich, conduct impactful research, and enjoy the journey together. Currently we have 3 research projects going on with Helmholtz Center Munich: Pan-cancer histopathology atlas, Retinal OCT segmentation for biomarker discovery in gene therapy, and Prediction of switching events in PDR5-GFP gene expression.",
    members: 14,
    established: "2024",
    location: "Munich",
    projects: ["Histopathology Atlas", "Retinal OCT", "PDR5-GFP Prediction"],
    className: "md:col-span-2 md:row-span-1 min-h-[350px]",
  },
  {
    id: "quantum-ai",
    name: "quanTUM.ai",
    description: "Applying machine learning across the quantum stack.",
    image: "",
    detailedDescription: "The TF 'quanTUM.ai – ML for Quantum Science' focuses on applying ML across the quantum stack, including quantum algorithms, simulation, high-performance computing, and experimental workflows. Through research projects, educational sessions, community events, and hackathons, quanTUM.ai aims to bridge AI and quantum technologies in a practical and interdisciplinary way.",
    members: 6,
    established: "2024",
    location: "Munich",
    projects: ["Quantum Algorithms", "Quantum Simulation", "Hackathons"],
    className: "md:col-span-1 md:row-span-2 min-h-[350px] md:min-h-full",
  },
  {
    id: "women-at-tum",
    name: "Women@tum.ai",
    description: "Empowering female students in AI, business, and Tech.",
    image: "",
    detailedDescription: "What if every woman in TUM.ai felt truly empowered to lead, create, and inspire? This task force builds a space where female students in AI, business, and Tech can connect, grow, and take initiative. Focus on female empowerment, leadership, mentorship, workshops, networking, and industry collaboration within AI/Tech.",
    members: 1,
    established: "2024",
    location: "Munich",
    projects: ["Mentorship", "Leadership", "Workshops"],
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
  },
  {
    id: "generative-modelling",
    name: "Generative Modelling",
    description: "Deep dives into math and PyTorch code for generative models.",
    image: "",
    detailedDescription: "We are creating educational sessions on generative modeling for the tum.ai community where we dive into the mathematics / PyTorch code that makes models like ChatGPT and Stable Diffusion work.",
    members: 5,
    established: "2024",
    location: "Munich",
    projects: ["Math of GenAI", "PyTorch", "Stable Diffusion"],
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
  },
  {
    id: "global-affairs",
    name: "Global Affairs",
    description: "Driving TUM.ai's international presence and strategic outreach.",
    image: "",
    detailedDescription: "Global Affairs drives TUM.ai's international presence by organizing expeditions to leading AI and venture hubs worldwide. We attend major conferences, connect with startups and research labs, and build partnerships that position TUM.ai on the global stage. Through grant acquisition and strategic outreach, we open doors to new ecosystems, giving our members firsthand exposure to international innovation while strengthening our network across borders.",
    members: 6,
    established: "2024",
    location: "Global",
    projects: ["Expeditions", "Conferences", "Partnerships"],
    className: "md:col-span-3 md:row-span-1 min-h-[300px]",
  },
];

export default function Projects() {
  return (
    <>
      <SEO {...getSEOConfig("projects")} />
      
      <section className="relative pt-32 pb-16 px-8 bg-gradient-to-br from-blue-900 to-purple-900">
        
        {/* Glow Effect */}
        <Layout>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-16 border-b border-white/10 pb-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Innovation <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                  Departments and Projects
                </span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                Explore TUM.ai's innovation departments and the exciting projects they lead.
              </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
              {departments.map((dept) => (
                <InnovationProjectCard key={dept.id} {...dept} />
              ))}
            </div>

          </div>
        </Layout>
      </section>
    </>
  );
}