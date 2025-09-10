import Layout from "@/components/Layout";
import { ProjectCard } from "@/components/innovation/InnovationProjectCard";

const departments = [
  {
    name: "MED.ai",
    description:
      "MED.ai is TUM.ai’s elite taskforce dedicated to identifying current challenges at the intersection of healthcare and AI, conducting cutting-edge research, and engaging with leading industry experts.",
    image: "/assets/innovation/med_ai.jpg",
    detailedDescription:
      "MED.ai is TUM.ai’s elite taskforce dedicated to identifying current challenges at the intersection of healthcare and AI, conducting cutting-edge research, and engaging with leading industry experts. Semesterly research projects in this field with institutions like Helmholtz AI leverages our members to draw new frontiers in the medical research field. With our MED Talks Speaker Series we make one of AI‘s most exciting application fields accessible to the broader audience.",
    members: 8,
    established: "2022",
    location: "Hybrid",
    projects: [
      "Neural Architecture Search",
      "Federated Learning",
      "Explainable AI",
      "Quantum ML",
    ],
    contact: "medai@tum.ai",
    website: "https://medai.tum.ai",
  },
  {
    name: "Robotics",
    description:
      "We explore cutting-edge approaches in robotic intelligence, currently focusing on imitation learning and reinforcement learning.",
    image: "/assets/innovation/robotics_arm.png",
    detailedDescription:
      "We explore cutting-edge approaches in robotic intelligence, currently focusing on imitation learning using the LeRobot framework. Our work is rapidly expanding toward reinforcement learning and robotics foundation models. As a team, we actively participate in robotics hackathons, organize paper reading sessions, and develop our own experimental projects—bridging research and hands-on innovation.",
    members: 4,
    established: "2023",
    location: "Munich",
    projects: [
      "AI Bootcamp",
      "Online Courses",
      "School Outreach",
      "Certification Programs",
    ],
    contact: "robotics@tum.ai",
    website: "https://robotics.tum.ai",
  },
  {
    name: "Quant Finance",
    description:
      "The QuantFinance Task Force focuses on quantitative finance, hackathons, and fintech research.",
    image: "",
    detailedDescription:
      "The QuantFinance Task Force is made up of TUM.ai members interested in Quantitative Finance or FinTech, who either want to participate in related hackathons or pursue a career in these fields. Our members take part individually or as a team in hackathons, estimathons, and other events.",
    members: 8,
    established: "2024",
    location: "Hybrid",
    projects: [
      "Smart Manufacturing",
      "Predictive Maintenance",
      "Supply Chain Optimization",
      "Digital Twins",
    ],
    contact: "quantfinance@tum.ai",
    website: "https://quantfinance.tum.ai",
  },
  {
    name: "Applied Accelerated Computing",
    description:
      "Focuses on AI hardware, GPUs, and compute acceleration for cutting-edge AI projects.",
    image: "/assets/innovation/accelerated_computing.png",
    detailedDescription:
      "At TUM.ai's Applied Accelerated Computing task force, we go beyond theoretical AI to unravel the hardware powering it all. We equip members with in-depth knowledge of GPUs and compute accelerators, enabling them to understand their workings and optimize AI workflows at a fundamental level.",
    members: 2,
    established: "2024",
    location: "Munich",
    projects: [
      "AI Governance Framework",
      "Bias Detection Tools",
      "Privacy-Preserving AI",
      "Algorithmic Auditing",
    ],
    contact: "accelerated@tum.ai",
    website: "https://accelerated.tum.ai",
  },
];

export default function Projects() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <Layout>
        <div className="relative pt-32 pb-16 px-8">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-4 mb-12 px-6 text-center">
            <h1 className="text-4xl font-bold md:text-5xl text-white">
              Innovation Departments and Projects
            </h1>
            <p className="mx-auto max-w-2xl text-subtitle text-gray-200">
              Explore TUM.ai's innovation departments and the exciting projects
              they lead.
            </p>
          </div>
          <div className="w-full px-6 md:px-12">
            <div className="flex flex-wrap mx-[-0.75rem] justify-center">
              {departments.map((dept) => (
                <div
                  key={dept.name}
                  className="flex-shrink-0 px-3 pb-6 transition-transform duration-150 hover:scale-101"
                >
                  <ProjectCard {...dept} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </section>
  );
}
