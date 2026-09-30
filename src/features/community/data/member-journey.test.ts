import { expect, test } from "vitest";
import {
  journeyIcons,
  journeySteps,
  memberJourney,
  semesterColumnsOf,
  stageSteps,
} from "./member-journey";
import { stories } from "./member-stories";

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
    expect(journeyIcons[step.iconKey]).toBeTruthy();
  }
});

test("the journey copy has no en or em dashes", () => {
  for (const step of journeySteps) {
    expect(`${step.name} ${step.description}`).not.toMatch(/[–—]/);
  }
});

test("the journey opens at the recruiting round and never goes back in time", () => {
  expect(journeySteps[0]).toMatchObject({ fromSemester: 0, span: "event" });
  const opens = journeySteps.map((step) => step.fromSemester);
  expect(opens).toStrictEqual([...opens].sort((a, b) => a - b));
  for (const stage of memberJourney) {
    const semesters = stageSteps(stage).map((step) => step.fromSemester);
    expect(new Set(semesters).size).toBe(1);
  }
});

test("the timetable has one column per semester up to the last opening, the last open-ended", () => {
  const last = Math.max(...journeySteps.map((step) => step.fromSemester));
  const semesterColumns = semesterColumnsOf(memberJourney);
  expect(semesterColumns).toHaveLength(last + 1);
  expect(semesterColumns.at(-1)).toBe(`${last}+`);
  for (const step of journeySteps) {
    expect(semesterColumns[step.fromSemester]).toBeDefined();
  }
});

test("every excerpt is a member's own words, quoted verbatim from their story", () => {
  for (const step of journeySteps) {
    if (!step.evidence) continue;
    const story = stories.find((entry) => entry.name === step.evidence?.name);
    expect(story, step.evidence.name).toBeDefined();
    expect(story?.story).toContain(step.evidence.excerpt);
  }
});
