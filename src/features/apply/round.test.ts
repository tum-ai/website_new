import { describe, expect, test } from "vitest";
import type { MembershipConfig } from "@/config/membership";
import { closingLead, closingTitle, recruitingCall } from "./round";

const config: MembershipConfig = {
  applicationsOpen: true,
  applicationUrl: "https://example.com/form",
  round: {
    name: "Winter semester 2026/27",
    opens: "28.09.2026",
    deadlineDate: "27.10.2026",
    deadlineTime: "23:59",
    interviews: { from: "02.11.2026", to: "08.11.2026" },
    onboarding: { from: "14.11.2026", to: "16.11.2026" },
  },
};

const at = (iso: string) => recruitingCall(new Date(iso), config);
const states = (iso: string) =>
  at(iso).keyDates.map((row) => `${row.id}:${row.state}`);

describe("recruitingCall", () => {
  test("words the dates in Munich for the register and the copy", () => {
    const call = at("2026-10-01T12:00:00Z");
    expect(call.keyDates.map((row) => row.date)).toEqual([
      "28 Sep",
      "27 Oct",
      "2 - 8 Nov",
      "14 - 16 Nov",
    ]);
    expect(call.words).toEqual({
      opens: "28 September",
      deadline: "27 October",
      deadlineTime: "23:59",
      interviews: "2 to 8 November",
      onboarding: "14 to 16 November",
    });
  });

  test("while open: the opening is past, the deadline is next with the days left", () => {
    const call = at("2026-10-01T12:00:00Z");
    expect(call.phase).toBe("open");
    expect(states("2026-10-01T12:00:00Z")).toEqual([
      "opens:past",
      "deadline:next",
      "interviews:upcoming",
      "onboarding:upcoming",
    ]);
    expect(call.keyDates[1].note).toBe("26 days left");
    expect(call.progress).toEqual({
      totalDays: 29,
      elapsedDays: 3,
      daysLeft: 26,
    });
  });

  test("counts down to the last day and closes at the deadline minute", () => {
    expect(at("2026-10-26T12:00:00Z").daysLeftLabel).toBe("1 day left");
    expect(at("2026-10-27T12:00:00Z").daysLeftLabel).toBe("Closes today");
    const closed = at("2026-10-27T22:59:00Z");
    expect(closed.phase).toBe("closed");
    expect(closed.daysLeftLabel).toBe("");
    expect(states("2026-10-27T22:59:00Z").slice(0, 3)).toEqual([
      "opens:past",
      "deadline:past",
      "interviews:next",
    ]);
    expect(closed.keyDates[2].note).toBe("In 6 days");
  });

  test("marks a span as now while it runs, and past from the day after", () => {
    expect(at("2026-11-04T12:00:00Z").keyDates[2]).toMatchObject({
      state: "next",
      note: "Now",
    });
    expect(states("2026-11-09T12:00:00Z")[2]).toBe("interviews:past");
  });

  test("before the opening, the opening is next", () => {
    const call = at("2026-09-20T12:00:00Z");
    expect(call.phase).toBe("upcoming");
    expect(call.keyDates[0]).toMatchObject({
      state: "next",
      note: "In 8 days",
    });
  });

  test("after the round, every date is past", () => {
    expect(
      states("2026-12-01T12:00:00Z").every((s) => s.endsWith(":past")),
    ).toBe(true);
  });

  test("the master switch closes the call early", () => {
    const call = recruitingCall(new Date("2026-10-01T12:00:00Z"), {
      ...config,
      applicationsOpen: false,
    });
    expect(call.phase).toBe("closed");
    expect(call.daysLeftLabel).toBe("");
  });

  test("the close names the one date that matters in each phase", () => {
    const open = at("2026-10-20T12:00:00Z");
    expect(closingTitle(open)).toBe("Applications close on 27 October.");
    expect(closingLead(open)).toMatch(
      /^7 days left\. The form closes at 23:59/,
    );
    expect(closingTitle(at("2026-09-20T12:00:00Z"))).toBe(
      "Applications open on 28 September.",
    );
    expect(closingTitle(at("2026-11-01T12:00:00Z"))).toBe(
      "This call is closed.",
    );
  });
});
