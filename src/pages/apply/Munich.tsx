import Hero from "@/components/apply/munich/Hero";
import About from "@/components/apply/shared/About";
import FAQ from "@/components/apply/shared/FAQ";
import MemberJourney from "@/components/apply/shared/MemberJourney";
import MemberStories from "@/components/apply/shared/MemberStories";
import Milestones from "@/components/apply/shared/Milestones";
import Outro from "@/components/apply/shared/Outro";
import Requirements from "@/components/apply/shared/Requirements";
import Values from "@/components/apply/shared/Values";
import { munichFaqs } from "@/data/apply/munich";
import { requirements, stories, values } from "@/data/apply/shared";
import { useMemo } from "react";

export default function Munich() {
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
      <FAQ faq={munichFaqs} />
      <Outro />
    </div>
  );
}
