import { expect, test } from "vitest";
import { groupJourneyStages, type JourneyStep } from "./community-model";

const step = (
  number: string,
  stage: number,
): JourneyStep & { stage: number } => ({
  step: number,
  name: number,
  description: "",
  iconKey: "rocket",
  fromSemester: 0,
  span: "ongoing",
  stage,
});

test("consecutive steps of one stage form a fork, the rest single steps", () => {
  const { stage: _, ...first } = step("01", 1);
  const { stage: __, ...a } = step("02A", 2);
  const { stage: ___, ...b } = step("02B", 2);
  expect(
    groupJourneyStages([step("01", 1), step("02A", 2), step("02B", 2)]),
  ).toStrictEqual([
    { kind: "single", step: first },
    { kind: "fork", steps: [a, b] },
  ]);
});

test("a stage with more than two steps can't be drawn", () => {
  expect(
    groupJourneyStages([step("01", 1), step("02", 1), step("03", 1)]),
  ).toBeNull();
});
