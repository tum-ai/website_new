import { expect, test } from "vitest";
import { type Milestone, milestonesIn, milestoneYearsOf } from "./milestones";

const list: Milestone[] = [
  { year: 2022, kind: "research", title: "An example" },
  { year: 2024, kind: "programs", title: "Another example" },
];
test("milestone years include gaps in chronological order", () => {
  expect(milestoneYearsOf(list)).toEqual([2022, 2023, 2024]);
});
test("a deliberately empty history has no year columns", () => {
  expect(milestoneYearsOf([])).toEqual([]);
});
test("cell selection preserves its input's order and identity", () => {
  expect(milestonesIn(list, "research", 2022)).toEqual([list[0]]);
  expect(milestonesIn(list, "events", 2023)).toEqual([]);
});
