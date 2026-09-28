import { About } from "./about";
import { Hero } from "./hero";
import { MemberJourney } from "./member-journey";
import { Milestones } from "./milestones";
import { MissionVision } from "./mission-vision";
import { Outro } from "./outro";
import { Requirements } from "./requirements";
import { Values } from "./values";

type ApplyPageProps = {
  /** The server's "now" (fixed under the mock CMS), for date-derived copy. */
  now: Date;
};

/**
 * Recruitment page (/apply; join.tum-ai.com redirects here). Bands:
 * ink hero → paper → mist → paper → ink → lavender → paper → mist FAQ → ink CTA.
 * The apply actions follow `membershipConfig.applicationsOpen`.
 */
export function ApplyPage({ now }: ApplyPageProps) {
  return (
    <main>
      <Hero />
      <About />
      <MissionVision />
      <Milestones />
      <Values />
      <MemberJourney now={now} />
      <Requirements />
      <Outro />
    </main>
  );
}
