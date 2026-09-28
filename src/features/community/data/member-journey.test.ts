import { expect, test } from "vitest";
import { journeySteps, memberJourney, stageSteps } from "./member-journey";

test("journey steps follow the stages in order, tagged with their stage", () => {
  expect(journeySteps.map((step) => step.step)).toStrictEqual(
    memberJourney.flatMap((stage) => stageSteps(stage).map((s) => s.step)),
  );
  for (const step of journeySteps) {
    expect(stageSteps(memberJourney[step.stageIndex])).toContainEqual(
      expect.objectContaining({ step: step.step, name: step.name }),
    );
  }
});

test("every step has a unique number, a name, a description and an icon", () => {
  const numbers = journeySteps.map((step) => step.step);
  expect(new Set(numbers).size).toBe(numbers.length);
  for (const step of journeySteps) {
    expect(step.name.trim()).not.toBe("");
    expect(step.description.trim()).not.toBe("");
    expect(step.icon).toBeTruthy();
  }
});

test("the journey copy has no en or em dashes", () => {
  for (const step of journeySteps) {
    expect(`${step.name} ${step.description}`).not.toMatch(/[–—]/);
  }
});
