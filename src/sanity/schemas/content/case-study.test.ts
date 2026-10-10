import { expect, test } from "vitest";
import { metricProblem } from "./case-study";

test("the figure's number is stated in the summary or the story", () => {
  expect(
    metricProblem("75%", {
      summary: "3 of 4 project members hired full-time",
      copy: "A 75% conversion from collaboration to permanent hires.",
    }),
  ).toBe(true);
  expect(
    metricProblem("48h", {
      summary: "Tangible results in 48 hours",
      copy: "A quote.",
    }),
  ).toBe(true);
  expect(
    metricProblem("20+", { copy: "20+ applications into the pipeline." }),
  ).toBe(true);
});

test("a figure changed without its words is flagged", () => {
  expect(
    metricProblem("80%", {
      summary: "3 of 4 project members hired full-time",
      copy: "A 75% conversion from collaboration to permanent hires.",
    }),
  ).toBe(
    "Neither the summary nor the story mentions 80. They describe the same outcome: when the figure changes, update them too.",
  );
  // A number inside a longer one is not a mention.
  expect(metricProblem("20+", { copy: "120 applications." })).toMatch(
    /mentions 20\./,
  );
  expect(metricProblem("2.5x", { copy: "A 2,5 or 12.5 result." })).toMatch(
    /mentions 2\.5\./,
  );
});

test("nothing to compare: no digits, or no words yet", () => {
  expect(metricProblem("Top", { copy: "Anything" })).toBe(true);
  expect(metricProblem("75%", {})).toBe(true);
  expect(metricProblem(undefined, { copy: "75%" })).toBe(true);
});
