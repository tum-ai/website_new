import Hero from "@/components/apply/Hero";
import About from "@/components/apply/shared/About";
import MemberJourney from "@/components/apply/shared/MemberJourney";
import MemberStories from "@/components/apply/shared/MemberStories";
import Milestones from "@/components/apply/shared/Milestones";
import Outro from "@/components/apply/shared/Outro";
import Requirements from "@/components/apply/shared/Requirements";
import Values from "@/components/apply/shared/Values";
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
      <img src="/assets/apply/new_section_photo_1.jpg" />
      <MemberJourney />
      <img src="/assets/apply/new_section_photo_4.jpg" />
      <MemberStories stories={stories} />
      <Requirements requirementsWithIcons={requirementsWithIcons} />
      <img src="/assets/apply/new_section_photo_3.png" />
      <FAQ faq={faq} />
      <Outro />
    </div>
  );
}
