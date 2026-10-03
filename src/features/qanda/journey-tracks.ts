import type { JourneyStage } from "@/lib/community-model";
import type { QandaEntry } from "./data/qanda";

/**
 * The Q&A answer that lists the member journey's two tracks: its anchor id
 * (`/qanda#member-journey`). Its points are not copy of their own: they are
 * derived from the journey's fork ({@link journeyTrackPoints}), so the
 * tracks are described once, in the journey steps.
 */
export const memberJourneyAnswerId = "member-journey";

/** A step description's first sentence. */
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0].trim();

/**
 * One point per track of the journey's fork, in the journey's order: "In
 * the research track you will join a team …", from the track's name and
 * its description's first sentence. Empty without a fork.
 */
export function journeyTrackPoints(journey: readonly JourneyStage[]): string[] {
  const fork = journey.find((stage) => stage.kind === "fork");
  if (fork?.kind !== "fork") return [];
  return fork.steps.map(({ name, description }) => {
    const sentence = firstSentence(description);
    return `In the ${name.toLowerCase()} you will ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
  });
}

/**
 * `entries` with the member-journey answer's points set from `journey`
 * (whatever points the entry held are replaced). Other entries, and the
 * answer when the journey has no fork, stay as they are.
 */
export function withJourneyTracks(
  entries: readonly QandaEntry[],
  journey: readonly JourneyStage[],
): QandaEntry[] {
  const points = journeyTrackPoints(journey);
  return entries.map((entry) =>
    entry.id === memberJourneyAnswerId && points.length > 0
      ? { ...entry, points }
      : entry,
  );
}
