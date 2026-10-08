import { expect, test } from "vitest";
import { notableStartupOf, tracedVentureLead } from "./venture-page";

test("ventures with a light logo can display without a website", () => {
  expect(
    notableStartupOf({
      key: "sample",
      name: "Sample",
      logo: {
        src: "/assets/fixtures/logo.svg",
        width: 200,
        height: 80,
        alt: "Sample",
        symbolOnly: true,
      },
    }),
  ).toEqual({
    id: "sample",
    name: "Sample",
    logoSrc: "/assets/fixtures/logo.svg",
    logoAlt: "Sample",
    wordmarkLabel: "Sample",
  });
  expect(notableStartupOf({ key: "sample", name: "Sample" })).toBeNull();
});
test("trace grammar uses only supplied narrative clauses", () => {
  expect(
    tracedVentureLead("Sample", {
      cohort: "Sample cohort",
      after: [{ text: "A prototype" }],
      now: "builds tools",
    }),
  ).toBe(
    "Sample came out of Sample cohort, went on to A prototype, and now builds tools.",
  );
  expect(
    tracedVentureLead("Sample", { cohort: "Sample cohort", after: [] }),
  ).toBe("Sample came out of Sample cohort.");
});
