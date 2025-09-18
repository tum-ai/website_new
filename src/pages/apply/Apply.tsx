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

export default function Apply() {
  const valuesWithIcons = useMemo(() => values, []);
  const requirementsWithIcons = useMemo(() => requirements, []);

  return (
    <div className="flex flex-col">
      <Hero />
      <About />
      <Milestones />
      <Values valuesWithIcons={valuesWithIcons} />
      <img src="/assets/apply/new_section_photo_1.webp" />
      <MemberJourney />
      <img src="/assets/apply/new_section_photo_4.webp" />
      <MemberStories stories={stories} />
      <Requirements requirementsWithIcons={requirementsWithIcons} />
      <img src="/assets/apply/new_section_photo_3.webp" />
      <FAQ faq={faq} />
      <Outro />
    </div>
  );
}
