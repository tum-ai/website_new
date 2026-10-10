import { expect, test } from "vitest";
import type { JourneyStage } from "@/lib/community-model";
import type { QandaEntry } from "./data/qanda";
import {
  journeyTrackPoints,
  memberJourneyAnswerId,
  withJourneyTracks,
} from "./journey-tracks";

const step = (name: string, description: string) => ({
  step: "02A",
  name,
  description,
  iconKey: "brain" as const,
  fromSemester: 1,
  span: "ongoing" as const,
});

const journey: JourneyStage[] = [
  { kind: "single", step: step("Kickoff", "Meet everyone.") },
  {
    kind: "fork",
    steps: [
      step("Research Track", "Join a lab team. Publish papers."),
      step("Initiative Track", "Run the events! Grow the community."),
    ],
  },
];

const entry = (id: string, points?: string[]): QandaEntry => ({
  id,
  question: `${id}?`,
  answer: "Members can join one of two tracks:",
  ...(points ? { points } : {}),
});

test("each track of the fork becomes a point, from its first sentence", () => {
  expect(journeyTrackPoints(journey)).toStrictEqual([
    "In the research track you will join a lab team.",
    "In the initiative track you will run the events!",
  ]);
  expect(journeyTrackPoints([journey[0]])).toStrictEqual([]);
});

test("the member-journey answer lists the tracks; other entries stay", () => {
  const [answer, other] = withJourneyTracks(
    [entry(memberJourneyAnswerId, ["A stale point."]), entry("other")],
    journey,
  );
  expect(answer?.points).toStrictEqual(journeyTrackPoints(journey));
  expect(other).toStrictEqual(entry("other"));
});

test("without a fork, the answer keeps what it has", () => {
  const answer = entry(memberJourneyAnswerId, ["Kept."]);
  expect(withJourneyTracks([answer], [journey[0]])).toStrictEqual([answer]);
});
