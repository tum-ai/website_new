import { About } from "./about";
import { requirements, values } from "./data/apply";
import { Hero } from "./hero";
import { MemberJourney } from "./member-journey";
import { Milestones } from "./milestones";
import { MissionVision } from "./mission-vision";
import { Outro } from "./outro";
import { Requirements } from "./requirements";
import { Values } from "./values";

/**
 * Recruitment page (/apply; join.tum-ai.com redirects here). Bands:
 * ink hero → paper → mist → paper → ink → lavender → paper → mist FAQ → ink CTA.
 */
export function ApplyPage() {
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
