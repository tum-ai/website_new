import { expect, test } from "vitest";
import {
  durationInWeeks,
  formatDuration,
  isDuration,
  programWeeksOf,
} from "./program-duration";

test("a duration reads as the page shows it", () => {
  expect(formatDuration({ amount: 3, unit: "days" })).toBe("3 days");
  expect(formatDuration({ amount: 4, unit: "weeks" })).toBe("4 weeks");
  expect(formatDuration({ amount: 1, unit: "weeks" })).toBe("1 week");
  expect(formatDuration({ amount: 1, unit: "days" })).toBe("1 day");
});

test("days count as sevenths of a week", () => {
  expect(durationInWeeks({ amount: 6, unit: "weeks" })).toBe(6);
  expect(durationInWeeks({ amount: 14, unit: "days" })).toBe(2);
});

test("only a positive whole amount in a known unit is a duration", () => {
  expect(isDuration({ amount: 3, unit: "days" })).toBe(true);
  expect(isDuration({ amount: 0, unit: "days" })).toBe(false);
  expect(isDuration({ amount: 1.5, unit: "weeks" })).toBe(false);
  expect(isDuration({ amount: 2, unit: "months" })).toBe(false);
  expect(isDuration("4 weeks")).toBe(false);
  expect(isDuration(null)).toBe(false);
});

test("the program length is its phases in whole weeks", () => {
  expect(
    programWeeksOf([
      { amount: 3, unit: "days" },
      { amount: 7, unit: "weeks" },
      { amount: 5, unit: "weeks" },
    ]),
  ).toBe(12);
  expect(programWeeksOf([{ amount: 2, unit: "weeks" }])).toBe(2);
});
