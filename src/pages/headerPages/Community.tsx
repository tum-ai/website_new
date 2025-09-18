import MemberStories from "@/components/apply/MemberStories";
import {
  JourneySection,
  iconColors as departmentColors,
} from "@/components/community/JourneySection";
import { Card } from "@/components/ui/card";
import { stories } from "@/data/apply/applyData";
import { type Department, departments } from "@/data/community";
import * as LucideIcons from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { getSEOConfig } from "@/config/seo";

type IconName = keyof typeof LucideIcons;

const DepartmentCard = ({
  department,
  index,
}: {
  department: Department;
  index: number;
}) => {
  const Icon = LucideIcons[department.icon as IconName] as React.ElementType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      viewport={{ once: true }}
    >
      <Card
        className="h-full p-8 text-white rounded-3xl overflow-hidden relative border border-white/10"
        style={{
          backgroundColor: "#18112F",
          boxShadow:
            "0px 5px 15px rgba(0,0,0,0.2), 0px 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            background: `radial-gradient(circle at center, 0%, transparent 70%)`,
          }}
        ></div>
        <div className="relative z-10 mb-5 flex items-center gap-4">
          {Icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: departmentColors[index],
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <h3 className="text-2xl font-semibold tracking-tight">
            {department.name}
          </h3>
        </div>
        <p className="relative z-10 leading-relaxed text-white/80">
          {department.description}
        </p>
      </Card>
    </motion.div>
  );
};

const DepartmentsSection = () => (
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-16">
    <div className="mb-20 text-center">
      <h2
        className="text-4xl font-semibold tracking-tight md:text-5xl "
      // bg-gradient-to-r from-[#891FDB] to-[#E0189A] bg-clip-text text-transparent"
      >
        Our Core Departments
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
        Discover the diverse teams that make TUM.ai thrive. Each department
        plays a crucial role in our mission to shape the future of AI.
      </p>
    </div>
    <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {departments.map((dept, index) => (
        <DepartmentCard key={dept.name} department={dept} index={index} />
      ))}
    </div>
  </div>
);

export default function Community() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          const headerOffset = 64;
          const elementPosition = element.offsetTop;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, []);

  return (
    <>
      <SEO {...getSEOConfig("community")} />
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div className="bg-grid-slate-100 absolute top-0 left-0 h-full w-full opacity-5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-48 right-10 h-[15vw] max-h-72 w-[15vw] max-w-72 rounded-full bg-purple-400 opacity-10 blur-[clamp(40px,5vw,100px)]" />
        <div className="absolute top-96 left-10 h-[20vw] max-h-96 w-[20vw] max-w-96 rounded-full bg-blue-300 opacity-10 blur-[clamp(50px,6vw,120px)]" />
        <div className="absolute right-48 bottom-48 h-[15vw] max-h-64 w-[15vw] max-w-64 rounded-full bg-indigo-400 opacity-10 blur-[clamp(30px,4vw,80px)]" />
      </div>

      <section className="relative overflow-hidden bg-[#18112F] text-white">
        <JourneySection />
        <DepartmentsSection />
        <section id="memberStories">
          <MemberStories stories={stories} />
        </section>
      </section>
    </>
  );
}
