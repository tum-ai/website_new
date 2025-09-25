import Layout from "@/components/Layout";
import About from "@/components/apply/About";
import Hero from "@/components/apply/Hero";
import MemberJourney from "@/components/apply/MemberJourney";
import Milestones from "@/components/apply/Milestones";
import Outro from "@/components/apply/Outro";
import Requirements from "@/components/apply/Requirements";
import Values from "@/components/apply/Values";
import { requirements, values } from "@/data/apply/applyData";
import { useMemo } from "react";

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
        <MemberJourney />
        {/* <MemberStories stories={stories} /> */}
        <Requirements requirementsWithIcons={requirementsWithIcons} />
        <Outro />
      </Layout>
    </div>
  );
}
