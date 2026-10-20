import { describe, expect, test } from "vitest";
import {
  validateDeadlineAfterOpening,
  validateMilestones,
  validateMunichTime,
} from "./application-window";

const membership = {
  program: "membership",
  opens: "2026-09-28",
  deadlineDate: "2026-10-27",
};

test("times are 24-hour HH:MM", () => {
  expect(validateMunichTime("23:59")).toBe(true);
  expect(validateMunichTime(undefined)).toBe(true);
  expect(validateMunichTime("11:59 pm")).toMatch(/HH:MM/);
});

test("the deadline is not before the opening day", () => {
  const context = { document: membership };
  expect(validateDeadlineAfterOpening("2026-10-27", context)).toBe(true);
  expect(validateDeadlineAfterOpening("2026-09-28", context)).toBe(true);
  expect(validateDeadlineAfterOpening("2026-09-27", context)).toMatch(
    /on or after the opening day/,
  );
});

describe("membership milestones", () => {
  const interviews = {
    key: "interviews",
    from: "2026-11-02",
    to: "2026-11-08",
  };
  const onboarding = {
    key: "onboarding",
    from: "2026-11-14",
    to: "2026-11-16",
  };
  const check = (
    value: unknown,
    document: Record<string, unknown> = membership,
  ) => validateMilestones(value, { document });

  test("names each milestone once, in order after the deadline", () => {
    expect(check([interviews, onboarding])).toBe(true);
    expect(check([interviews])).toMatch(/onboarding weekend exactly once/);
    expect(check([interviews, interviews, onboarding])).toMatch(
      /interviews exactly once/,
    );
    expect(check([{ ...interviews, to: "2026-11-01" }, onboarding])).toMatch(
      /end on or after/,
    );
    expect(check([{ ...interviews, from: "2026-10-20" }, onboarding])).toMatch(
      /before the deadline day/,
    );
  });

  test("are not checked on the E-Lab window", () => {
    expect(check(undefined, { program: "e-lab" })).toBe(true);
  });
});
