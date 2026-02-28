import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { InnovationProjectCard } from "@/components/innovation/InnovationProjectCard";
import { getSEOConfig } from "@/config/seo";

// Data Definition
const departments = [
  {
    id: "medai",
    name: "MED.ai",
    description: "Identifying challenges at the intersection of healthcare and AI.",
    image: "/assets/innovation/med_ai.webp",
    detailedDescription: "MED.ai is TUM.ai’s elite taskforce dedicated to identifying current challenges at the intersection of healthcare and AI, conducting cutting-edge research, and engaging with leading industry experts. Semesterly research projects in this field with institutions like Helmholtz AI leverages our members to draw new frontiers in the medical research field. With our MED Talks Speaker Series we make one of AI‘s most exciting application fields accessible to the broader audience.",
    members: 8,
    established: "2022",
    location: "Hybrid",
    projects: ["Neural Architecture Search", "Federated Learning", "Medical Imaging"],
    className: "md:col-span-2 md:row-span-1 min-h-[350px]",
  },
  {
    id: "robotics",
    name: "Robotics",
    description: "Cutting-edge robotic intelligence and imitation learning.",
    image: "/assets/innovation/robotics_arm.webp",
    detailedDescription: "We explore cutting-edge approaches in robotic intelligence, currently focusing on imitation learning using the LeRobot framework. Our work is rapidly expanding toward reinforcement learning and robotics foundation models. As a team, we actively participate in robotics hackathons, organize paper reading sessions, and develop our own experimental projects—bridging research and hands-on innovation.",
    members: 4,
    established: "2023",
    location: "Munich",
    projects: ["AI Bootcamp", "LeRobot Framework", "Sim2Real"],
    className: "md:col-span-1 md:row-span-2 min-h-[350px] md:min-h-full", 
  },
  {
    id: "quant",
    name: "Quant Finance",
    description: "Quantitative finance, hackathons, and fintech research.",
    image: "",
    detailedDescription: "The QuantFinance Task Force is made up of TUM.ai members interested in Quantitative Finance or FinTech, who either want to participate in related hackathons or pursue a career in these fields. Our members take part individually or as a team in hackathons, estimathons, and other events.",
    members: 8,
    established: "2024",
    location: "Hybrid",
    projects: ["Predictive Maintenance", "Digital Twins", "Algo Trading"],
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
  },
  {
    id: "compute",
    name: "Accelerated Computing",
    description: "AI hardware, GPUs, and compute acceleration.",
    image: "/assets/innovation/accelerated_computing.webp",
    detailedDescription: "At TUM.ai's Applied Accelerated Computing task force, we go beyond theoretical AI to unravel the hardware powering it all. We equip members with in-depth knowledge of GPUs and compute accelerators, enabling them to understand their workings and optimize AI workflows at a fundamental level.",
    members: 2,
    established: "2024",
    location: "Munich",
    projects: ["AI Governance", "Bias Detection", "Kernel Optimization"],
    className: "md:col-span-1 md:row-span-1 min-h-[300px]",
  },
];

export default function Projects() {
  return (
    <>
      <SEO {...getSEOConfig("projects")} />
      
      <section className="relative pt-32 pb-16 px-8 bg-gradient-to-br from-blue-900 to-purple-900">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

        <Layout>
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