import Layout from "@/components/Layout";
import About from "@/components/apply/About";
import Hero from "@/components/apply/Hero";
import MemberJourney from "@/components/apply/MemberJourney";
import Milestones from "@/components/apply/Milestones";
import Outro from "@/components/apply/Outro";
import Requirements from "@/components/apply/Requirements";
import Values from "@/components/apply/Values";
import { requirements, values } from "@/data/apply/applyData";

export default function Apply() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Layout>
        <About />
        <Milestones />
        <Values valuesWithIcons={values} />
        <MemberJourney />
        <Requirements requirementsWithIcons={requirements} />
        <Outro />
      </Layout>
    </div>
  );
}
