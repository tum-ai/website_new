import MemberStories from "@/components/apply/shared/MemberStories";
import { JourneySection } from "@/components/community/JourneySection";
import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/card";
import { stories } from "@/data/apply/shared";
import { type Department, departments } from "@/data/community";
import * as LucideIcons from "lucide-react";
import { useEffect } from "react";

type IconName = keyof typeof LucideIcons;

const DepartmentCard = ({ department }: { department: Department }) => {
  const Icon = LucideIcons[department.icon as IconName] as React.ElementType;

  return (
    <Card className="h-full p-8 text-white bg-purple-900 border-slate-700">
      <div className="relative mb-5 flex items-center gap-4">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/15">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <h3 className="text-subtitle font-semibold tracking-tight">
          {department.name}
        </h3>
      </div>
      <p className="text-subtext leading-relaxed text-slate-300">
        {department.description}
      </p>
    </Card>
  );
};

const DepartmentsSection = () => (
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
    <div className="mb-20 text-center">
      <h2 className="text-title font-semibold tracking-tight text-white">
        Our Core Departments
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-subtext text-slate-300">
        Discover the diverse teams that make TUM.ai thrive. Each department
        plays a crucial role in our mission to shape the future of AI.
      </p>
    </div>
    <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {departments.map((dept) => (
        <DepartmentCard key={dept.name} department={dept} />
      ))}
    </div>
  </div>
);

export default function Community() {
  useEffect(() => {
    // Handle hash fragment scrolling
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        // Add a small delay to ensure the page is fully rendered
        setTimeout(() => {
          const headerOffset = 64; // Height of the fixed header (h-16 = 64px)
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
      <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
        <div className="bg-grid-slate-100 absolute top-0 left-0 h-full w-full opacity-5 [mask-image:linear-gradient(0deg,transparent,white)]" />
        <div className="absolute top-48 right-10 h-[15vw] max-h-72 w-[15vw] max-w-72 rounded-full bg-purple-400 opacity-10 blur-[clamp(40px,5vw,100px)]" />
        <div className="absolute top-96 left-10 h-[20vw] max-h-96 w-[20vw] max-w-96 rounded-full bg-blue-300 opacity-10 blur-[clamp(50px,6vw,120px)]" />
        <div className="absolute right-48 bottom-48 h-[15vw] max-h-64 w-[15vw] max-w-64 rounded-full bg-indigo-400 opacity-10 blur-[clamp(30px,4vw,80px)]" />
      </div>

      <Section background="inverted" className="pt-32">
        <JourneySection />
        <DepartmentsSection />
      </Section>
      <section id="memberStories">
        <MemberStories stories={stories} />
      </section>
    </>
  );
}
