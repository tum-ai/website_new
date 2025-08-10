import { bitter } from "@/styles/fonts";
import { cx } from "class-variance-authority";
import { ProjectCard } from "@/components/innovation/InnovationProjectCard";


const sampleDepartments = [
  {
    name: "MED.ai",
    description: "MED.ai is TUM.ai’s elite taskforce dedicated to identifying current challenges at the intersection of healthcare and AI, conducting cutting-edge research, and engaging with leading industry experts. Semesterly research projects in this field with institutions like Helmholtz AI leverages our members to draw new frontiers in the medical research field. With our MED Talks Speaker Series we make one of AI‘s most exciting application fields accessible to the broader audience.",
    image: "/public/assets/innovation/robotics_discussion.png",
    detailedDescription: "MED.ai is TUM.ai’s elite taskforce dedicated to identifying current challenges at the intersection of healthcare and AI, conducting cutting-edge research, and engaging with leading industry experts. Semesterly research projects in this field with institutions like Helmholtz AI leverages our members to draw new frontiers in the medical research field. With our MED Talks Speaker Series we make one of AI‘s most exciting application fields accessible to the broader audience.",
    members: 8,
    established: "2022",
    location: "Hybrid",
    projects: ["Neural Architecture Search", "Federated Learning", "Explainable AI", "Quantum ML"],
    contact: "contact email",
    website: "website",
  },
  {
    name: "Quant Finance",
    description:
      "The members of the Quant Finance Task Force are passionate about quantitative trading strategies and financial market modeling. We integrate theoretical knowledge in statistics, probability theory, and financial instruments with practical applications to enhance our understanding of market dynamics, quantitative approaches, and associated risks. Our team has successfully participated in the IMC Prosperity 3 Challenge and the AlgoTrade 2025 Hackathon, continuously eager to learn and expand our expertise in quantitative finance.",
    image: "/public/assets/innovation/robotics_arm.png",
    detailedDescription:
      "The members of the Quant Finance Task Force are passionate about quantitative trading strategies and financial market modeling. We integrate theoretical knowledge in statistics, probability theory, and financial instruments with practical applications to enhance our understanding of market dynamics, quantitative approaches, and associated risks. Our team has successfully participated in the IMC Prosperity 3 Challenge and the AlgoTrade 2025 Hackathon, continuously eager to learn and expand our expertise in quantitative finance.",
    members: 8,
    established: "2024",
    location: "Hybrid",
    projects: ["Smart Manufacturing", "Predictive Maintenance", "Supply Chain Optimization", "Digital Twins"],
    contact: "contact email",
    website: "website",
  },
  {
    name: "Robotics",
    description:
      "We explore cutting-edge approaches in robotic intelligence, currently focusing on imitation learning using the LeRobot framework. Our work is rapidly expanding toward reinforcement learning and robotics foundation models. As a team, we actively participate in robotics hackathons, organize paper reading sessions, and develop our own experimental projects—bridging research and hands-on innovation.",
    image: "/public/assets/innovation/robotics_writing.png",
    detailedDescription:
      "We explore cutting-edge approaches in robotic intelligence, currently focusing on imitation learning using the LeRobot framework. Our work is rapidly expanding toward reinforcement learning and robotics foundation models. As a team, we actively participate in robotics hackathons, organize paper reading sessions, and develop our own experimental projects—bridging research and hands-on innovation.",
    members: 4,
    established: "2023",
    location: "Munich",
    projects: ["AI Bootcamp", "Online Courses", "School Outreach", "Certification Programs"],
    contact: "contact email",
    website: "website",
  },
  {
    name: "Applied Accelerated Computing",
    description:
      "TODO",
    image: "/ethics-balance-justice-ai.png",
    detailedDescription:
      "TODO",
    members: 2,
    established: "2024",
    location: "Munich",
    projects: ["AI Governance Framework", "Bias Detection Tools", "Privacy-Preserving AI", "Algorithmic Auditing"],
    contact: "contact email",
    website: "website",
  },
  
]


export default function Projects() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Enhanced Effects */}
        <img
          src="/assets/partners.jpg"
          alt="Hero background image"
          className="absolute scale-110 object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        {/* Content Container */}
        <div className="relative container mx-auto flex min-h-[80vh] max-w-4xl flex-col justify-center p-8 text-white md:p-16">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 h-32 w-1 -translate-y-1/2 bg-linear-to-b from-blue-500 to-purple-500 opacity-50" />

          {/* Main Content */}
          <div className="space-y-6">
            <h1
              className={cx(
                "text-6xl font-medium tracking-tight md:text-7xl",
                "bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent",
                "animate-fade-in-up",
              )}
              style={{ fontFamily: bitter }}
            >
              Innovation Departments and their projects
            </h1>
          </div>
        </div>
      </section>

      <section className="relative bg-linear-to-b from-blue-700 to-blue-800 p-8 text-white sm:py-16 lg:py-32">
        <div className="container mx-auto">
          <div className="mx-auto max-w-7xl">
            {/* Background dots pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-8 opacity-10">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-purple-300" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {sampleDepartments.map((department) => (
                <ProjectCard key={department.name} {...department} />
              ))}
            </div>


            {/* <div className="relative mb-16 flex flex-col items-center text-center">
              <h2
                className="mb-6 text-3xl font-semibold text-white"
                style={{ fontFamily: bitter }}
              >
                Med.ai
              </h2>
            </div>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Applied Accelerated Computing
            </h2>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Quant Finance
            </h2>
          </div>
          <div className="relative mb-16 flex flex-col items-center text-center">
            <h2
              className="mb-6 text-3xl font-semibold text-white"
              style={{ fontFamily: bitter }}
            >
              Robotics
            </h2>
          </div> */}
          </div>
        </div>
      </section>
    </>
  );
}
