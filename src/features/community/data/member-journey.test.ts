import { expect, test } from "vitest";
import type { JourneyStage, JourneyStep } from "@/lib/community-model";
import { journeyIcons, semesterColumnsOf, stepAnchor } from "./member-journey";

const step = (fromSemester: number): JourneyStep => ({
  step: "01",
  name: "Example",
  description: "A sample step.",
  iconKey: "brain",
  span: "ongoing",
  fromSemester,
});
test("semester columns start at recruiting and end with an open-ended latest semester", () => {
  const journey: JourneyStage[] = [
    { kind: "single", step: step(0) },
    { kind: "fork", steps: [step(2), step(3)] },
  ];
  expect(semesterColumnsOf(journey)).toEqual(["0", "1", "2", "3+"]);
});
test("step anchors stay stable and icon mappings cover every key", () => {
  expect(stepAnchor("02A")).toBe("journey-02a");
  expect(Object.keys(journeyIcons)).toEqual([
    "rocket",
    "brain",
    "handshake",
    "chart",
    "globe",
    "graduation-cap",
  ]);
});
