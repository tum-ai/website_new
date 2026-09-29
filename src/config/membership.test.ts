import { describe, expect, test } from "vitest";
import {
  applicationProgress,
  isMembershipApplicationOpen,
  type MembershipConfig,
  membershipConfig,
  type RecruitingRound,
  recruitingTimeline,
  roundSchedule,
} from "./membership";

/** A fixed round, so the tests don't move with the live config. */
const round: RecruitingRound = {
  name: "Test round",
  opens: "28.09.2026",
  deadlineDate: "27.10.2026",
  deadlineTime: "23:59",
  interviews: { from: "02.11.2026", to: "08.11.2026" },
  onboarding: { from: "14.11.2026", to: "16.11.2026" },
};
const config: MembershipConfig = {
  applicationsOpen: true,
  applicationUrl: "https://example.com/form",
  round,
};
const schedule = roundSchedule(round);

describe("roundSchedule", () => {
  test("reads Munich wall-clock time across the summer time change", () => {
    // 28 September is summer time (UTC+2); 27 October is winter time (UTC+1).
    expect(schedule.opensAt.toISOString()).toBe("2026-09-27T22:00:00.000Z");
    expect(schedule.closesAt.toISOString()).toBe("2026-10-27T22:59:00.000Z");
  });

  test("parses the live round", () => {
    expect(() => roundSchedule(membershipConfig.round)).not.toThrow();
  });
});

describe("isMembershipApplicationOpen", () => {
  test("opens at midnight on the opening day in Munich", () => {
    expect(
      isMembershipApplicationOpen(new Date("2026-09-27T21:59:59Z"), config),
    ).toBe(false);
    expect(
      isMembershipApplicationOpen(new Date("2026-09-27T22:00:00Z"), config),
    ).toBe(true);
  });

  test("closes at exactly the deadline minute", () => {
    expect(
      isMembershipApplicationOpen(new Date("2026-10-27T22:58:59Z"), config),
    ).toBe(true);
    expect(
      isMembershipApplicationOpen(new Date("2026-10-27T22:59:00Z"), config),
    ).toBe(false);
  });

  test("stays closed while the switch is off", () => {
    expect(
      isMembershipApplicationOpen(new Date("2026-10-01T12:00:00Z"), {
        ...config,
        applicationsOpen: false,
      }),
    ).toBe(false);
  });
});

describe("applicationProgress", () => {
  test("counts the window in Munich calendar days", () => {
    expect(
      applicationProgress(new Date("2026-10-01T12:00:00Z"), schedule),
    ).toEqual({ totalDays: 29, elapsedDays: 3, daysLeft: 26 });
  });

  test("turns over at Munich midnight, not UTC midnight", () => {
    // 22:30 UTC on 30 September is already 1 October in Munich.
    expect(
      applicationProgress(new Date("2026-09-30T22:30:00Z"), schedule)
        .elapsedDays,
    ).toBe(3);
    expect(
      applicationProgress(new Date("2026-09-30T21:30:00Z"), schedule)
        .elapsedDays,
    ).toBe(2);
  });

  test("clamps before the opening and after the deadline", () => {
    expect(
      applicationProgress(new Date("2026-09-20T12:00:00Z"), schedule),
    ).toEqual({ totalDays: 29, elapsedDays: 0, daysLeft: 37 });
    expect(
      applicationProgress(new Date("2026-10-27T12:00:00Z"), schedule),
    ).toEqual({ totalDays: 29, elapsedDays: 29, daysLeft: 0 });
    expect(
      applicationProgress(new Date("2026-11-03T12:00:00Z"), schedule),
    ).toEqual({ totalDays: 29, elapsedDays: 29, daysLeft: -7 });
  });
});

describe("recruitingTimeline", () => {
  test("names the live round's windows in words", () => {
    for (const window of Object.values(recruitingTimeline)) {
      expect(window).toMatch(/^[A-Z][a-z]+ \d{1,2}[a-z]{2} - [A-Z]/);
    }
  });
});
