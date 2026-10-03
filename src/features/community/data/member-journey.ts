import {
  Brain,
  ChartNoAxesColumn,
  Globe,
  GraduationCap,
  Handshake,
  type LucideIcon,
  Rocket,
} from "lucide-react";
import {
  type JourneyIconKey,
  type JourneyStage,
  type JourneyStep,
  stageSteps,
} from "@/lib/community-model";

export type { JourneyStage, JourneyStep };
export { stageSteps };

/** The Lucide icon of each step icon key (the CMS stores the key). */
export const journeyIcons: Record<JourneyIconKey, LucideIcon> = {
  rocket: Rocket,
  brain: Brain,
  handshake: Handshake,
  chart: ChartNoAxesColumn,
  globe: Globe,
  "graduation-cap": GraduationCap,
};

/** Anchor id of a step on /community, e.g. "journey-02a". */
export const stepAnchor = (step: string) => `journey-${step.toLowerCase()}`;

/**
 * The columns of a journey's membership timetable on /community: the
 * recruiting round (0), then one per semester up to the latest one any step
 * opens in, which is open-ended ("3+").
 */
export function semesterColumnsOf(journey: readonly JourneyStage[]): string[] {
  const last = Math.max(
    ...journey.flatMap(stageSteps).map((step) => step.fromSemester),
  );
  return Array.from({ length: last + 1 }, (_, semester) =>
    semester === last ? `${semester}+` : `${semester}`,
  );
}
