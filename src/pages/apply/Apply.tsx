import Hero from "@/components/apply/Hero";
import About from "@/components/apply/About";
import MemberJourney from "@/components/apply/MemberJourney";
import MemberStories from "@/components/apply/MemberStories";
import Milestones from "@/components/apply/Milestones";
import Outro from "@/components/apply/Outro";
import Requirements from "@/components/apply/Requirements";
import Values from "@/components/apply/Values";
import FAQ from "@/components/ui/FAQ";
import { requirements, stories, values } from "@/data/apply/applyData";
import { faq } from "@/data/apply/faq";
import { useMemo } from "react";
import Layout from "@/components/Layout";

export default function Apply() {
  const valuesWithIcons = useMemo(() => values, []);
  const requirementsWithIcons = useMemo(() => requirements, []);

  return (
    <div className="flex flex-col">
      <Hero />
      <Layout>
        <About />
        <Milestones />
        <Values valuesWithIcons={valuesWithIcons} />
        <div className="w-full items-center md:max-h-2/3 flex">
          <img
            className="object-cover bg-gray-200 rounded-xl w-full h-auto"
            src="/assets/apply/new_section_photo_1.webp"
            alt="TUM.ai members"
          />
        </div>
        <MemberJourney />
        <div className="w-full items-center md:max-h-2/3 flex">
          <img
            className="object-cover bg-gray-200 rounded-xl w-full h-auto"
            src="/assets/apply/new_section_photo_4.webp"
            alt="lecture hall"
          />
        </div>
        <MemberStories stories={stories} />
        <Requirements requirementsWithIcons={requirementsWithIcons} />
        <div className="w-full items-center md:max-h-2/3 flex">
          <img
            className="object-cover bg-gray-200 rounded-xl w-full h-auto"
            src="/assets/apply/new_section_photo_3.webp"
            alt="TUM.ai members2"
          />
        </div>
        <Outro />
      </Layout>
    </div>
  );
}
