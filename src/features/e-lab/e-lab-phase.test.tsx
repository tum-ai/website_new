import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { ClockWindow } from "@/lib/clock-window";
import { ELabPhase } from "./e-lab-phase";

/** An injected window, so the test doesn't move with the config or the CMS. */
const closesAt = Date.parse("2026-09-27T21:59:00Z");
const clock: ClockWindow = { switchedOn: true, opensAt: null, closesAt };

function renderPhase() {
  render(
    <ELabPhase
      clock={clock}
      open={<p>Apply now</p>}
      closed={<p>Applications closed</p>}
    />,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

test("follows the real clock, live", () => {
  vi.setSystemTime(closesAt - 1);
  renderPhase();
  expect(screen.getByText("Apply now")).toBeInTheDocument();

  vi.setSystemTime(closesAt);
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(screen.getByText("Applications closed")).toBeInTheDocument();
});

test("on the fixed mock clock, renders by it and keeps that answer", () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  vi.stubEnv("MOCK_CMS_NOW", "2026-09-20T12:00:00Z");
  // The machine's clock is past the deadline; the render clock is not.
  vi.setSystemTime(closesAt + 1);
  renderPhase();
  expect(screen.getByText("Apply now")).toBeInTheDocument();

  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(screen.getByText("Apply now")).toBeInTheDocument();
});
