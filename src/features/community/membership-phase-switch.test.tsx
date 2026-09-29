import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  type MembershipConfig,
  membershipWindowClock,
} from "@/config/membership";
import type { ClockWindow } from "@/lib/clock-window";
import { MembershipPhaseSwitch } from "./membership-phase-switch";

/** An injected round, so the tests don't move with the live config or the CMS. */
const config: MembershipConfig = {
  applicationsOpen: true,
  applicationUrl: "https://example.com/form",
  round: {
    name: "Test round",
    opens: "28.09.2026",
    deadlineDate: "27.10.2026",
    deadlineTime: "23:59",
    interviews: { from: "02.11.2026", to: "08.11.2026" },
    onboarding: { from: "14.11.2026", to: "16.11.2026" },
  },
};
const clock = membershipWindowClock(config);
const opensAt = clock.opensAt ?? 0;
const closesAt = clock.closesAt ?? 0;

function renderSwitch(phase: ClockWindow = clock) {
  render(
    <MembershipPhaseSwitch
      clock={phase}
      open={<p>Apply now</p>}
      closed={<p>Become a Member</p>}
    />,
  );
}

const shows = (label: string) =>
  expect(screen.getByText(label)).toBeInTheDocument();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MembershipPhaseSwitch", () => {
  test("is closed until the form opens at Munich midnight", () => {
    expect(new Date(opensAt).toISOString()).toBe("2026-09-27T22:00:00.000Z");
    vi.setSystemTime(opensAt - 1);
    renderSwitch();
    shows("Become a Member");
  });

  test("is open from the opening instant", () => {
    vi.setSystemTime(opensAt);
    renderSwitch();
    shows("Apply now");
  });

  test("stays closed inside the dates while the master switch is off", () => {
    vi.setSystemTime(opensAt);
    renderSwitch(membershipWindowClock({ ...config, applicationsOpen: false }));
    shows("Become a Member");
  });

  test("closes at exactly the deadline minute", () => {
    vi.setSystemTime(closesAt - 1);
    renderSwitch();
    shows("Apply now");

    vi.setSystemTime(closesAt);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    shows("Become a Member");
  });
});
