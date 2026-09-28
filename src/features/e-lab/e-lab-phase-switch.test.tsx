import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { eLabApplicationsCloseAt } from "@/config/e-lab";
import { ELabPhaseSwitch } from "./e-lab-phase-switch";

/*
 * The deadline comes from the real config; only the master switch is pinned
 * on, so these tests keep working when a maintainer closes a round early.
 */
vi.mock("@/config/e-lab", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/e-lab")>();
  return {
    ...actual,
    isELabApplicationOpen: (now: Date) =>
      actual.isApplicationWindowOpen({
        switchedOn: true,
        closesAt: actual.eLabApplicationsCloseAt,
        now,
      }),
  };
});

const deadline = eLabApplicationsCloseAt.getTime();

function renderSwitch(initialOpen?: boolean) {
  return render(
    <ELabPhaseSwitch
      initialOpen={initialOpen}
      open={<p>Apply now</p>}
      closed={<p>Applications closed</p>}
    />,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ELabPhaseSwitch", () => {
  test("shows the open variant until the deadline and switches by itself", () => {
    vi.setSystemTime(deadline - 5000);
    renderSwitch();
    expect(screen.getByText("Apply now")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByText("Apply now")).toBeInTheDocument();

    // The timer fires just after the deadline instant.
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByText("Applications closed")).toBeInTheDocument();
    expect(screen.queryByText("Apply now")).not.toBeInTheDocument();
  });

  test("is closed at exactly the deadline", () => {
    vi.setSystemTime(deadline);
    renderSwitch();
    expect(screen.getByText("Applications closed")).toBeInTheDocument();
  });

  test("is still open one millisecond before the deadline", () => {
    vi.setSystemTime(deadline - 1);
    renderSwitch();
    expect(screen.getByText("Apply now")).toBeInTheDocument();
  });

  test("corrects a cached server render from before the deadline on mount", () => {
    vi.setSystemTime(deadline + 60_000);
    renderSwitch(true);
    expect(screen.getByText("Applications closed")).toBeInTheDocument();
  });

  test("re-checks when a throttled background tab becomes visible", () => {
    vi.setSystemTime(deadline - 1000);
    renderSwitch();
    expect(screen.getByText("Apply now")).toBeInTheDocument();

    // Move the clock past the deadline without running the timer, as a
    // throttled background tab would.
    vi.setSystemTime(deadline + 1000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByText("Applications closed")).toBeInTheDocument();
  });
});
