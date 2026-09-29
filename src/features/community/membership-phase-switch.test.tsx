import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  membershipConfig,
  membershipWindowBoundaries,
} from "@/config/membership";
import { MembershipPhaseSwitch } from "./membership-phase-switch";

const [opensAt, closesAt] = membershipWindowBoundaries;
/** Open inside the window only while the master switch is on. */
const openInWindow = membershipConfig.applicationsOpen;

function renderSwitch() {
  render(
    <MembershipPhaseSwitch
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
    vi.setSystemTime(opensAt.getTime() - 1);
    renderSwitch();
    shows("Become a Member");
  });

  test("follows the master switch from the opening instant", () => {
    vi.setSystemTime(opensAt);
    renderSwitch();
    shows(openInWindow ? "Apply now" : "Become a Member");
  });

  test("closes at exactly the deadline minute", () => {
    vi.setSystemTime(closesAt.getTime() - 1);
    renderSwitch();
    shows(openInWindow ? "Apply now" : "Become a Member");

    vi.setSystemTime(closesAt);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    shows("Become a Member");
  });
});
