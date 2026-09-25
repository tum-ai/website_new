import About from "@/components/apply/About";
import Hero from "@/components/apply/Hero";
import MemberJourney from "@/components/apply/MemberJourney";
import Milestones from "@/components/apply/Milestones";
import MissionVision from "@/components/apply/MissionVision";
import Outro from "@/components/apply/Outro";
import Requirements from "@/components/apply/Requirements";
import Values from "@/components/apply/Values";
import { requirements, values } from "@/data/apply/applyData";

/**
 * Recruitment page (/apply; join.tum-ai.com redirects here). Bands:
 * ink hero → paper → mist → paper → ink → lavender → paper → mist FAQ → ink CTA.
 */
export default function Apply() {
  return (
    <main>
      <Hero />
      <About />
      <MissionVision />
      <Milestones />
      <Values valuesWithIcons={values} />
      <MemberJourney />
      <Requirements requirementsWithIcons={requirements} />
      <Outro />
    </main>
  );
}
