import SEO from "@/components/SEO";
import MemberStories from "@/components/apply/MemberStories";
import { DepartmentsSection } from "@/components/community/DepartmentsSection";
import { JourneySection } from "@/components/community/JourneySection";
import { getSEOConfig } from "@/config/seo";
import { stories } from "@/data/apply/applyData";
import { useHashScroll } from "@/hooks/useHashScroll";

export default function Community() {
  useHashScroll();

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
        <MemberStories stories={stories} />
      </section>
    </>
  );
}
