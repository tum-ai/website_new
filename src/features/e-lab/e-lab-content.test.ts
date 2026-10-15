import { expect, test } from "vitest";
import {
  type ELabApplicationWindow,
  eLabApplicationCopyOf,
  eLabPhaseCopyOf,
  isApplicationWindowOpen,
} from "@/config/e-lab";
import { parseMunichDateTime } from "@/lib/munich-time";

const window: ELabApplicationWindow = {
  applicationsOpen: true,
  applicationUrl: "https://example.org/apply",
  applicationDeadlineDate: "12.11.2030",
  applicationDeadlineTime: "17:00",
  nextApplicationWindow: "Example round",
};
test("application wording follows the explicit window and cohort", () => {
  const copy = eLabApplicationCopyOf("Example", window);
  expect(copy.deadline).toBe("12.11.2030 at 17:00");
  expect(eLabPhaseCopyOf("Example", window).closed.roundStatus).toContain(
    window.nextApplicationWindow,
  );
});
test("the supplied window closes at its Munich deadline", () => {
  const deadline = parseMunichDateTime(
    window.applicationDeadlineDate,
    window.applicationDeadlineTime,
  ).getTime();
  expect(
    isApplicationWindowOpen({
      now: new Date(deadline - 1000),
      switchedOn: window.applicationsOpen,
      closesAt: new Date(deadline),
    }),
  ).toBe(true);
  expect(
    isApplicationWindowOpen({
      now: new Date(deadline),
      switchedOn: window.applicationsOpen,
      closesAt: new Date(deadline),
    }),
  ).toBe(false);
});
