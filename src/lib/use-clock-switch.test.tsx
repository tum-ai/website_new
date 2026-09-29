import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useClockSwitch } from "./use-clock-switch";

const opensAt = new Date("2026-09-27T22:00:00Z");
const closesAt = new Date("2026-10-27T22:59:00Z");
const boundaries = [opensAt, closesAt];
const isOn = (now: Date) => now >= opensAt && now < closesAt;

function renderSwitch(options: { initial?: boolean; live?: boolean } = {}) {
  return renderHook(() => useClockSwitch({ isOn, boundaries, ...options }));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useClockSwitch", () => {
  test("turns on at the opening and off at the closing, by itself", () => {
    const start = new Date("2026-09-27T22:00:00Z");
    const end = new Date(start.getTime() + 10_000);
    const shortWindow = [start, end];
    const inShortWindow = (now: Date) => now >= start && now < end;
    vi.setSystemTime(start.getTime() - 5000);
    const { result } = renderHook(() =>
      useClockSwitch({ isOn: inShortWindow, boundaries: shortWindow }),
    );
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(4000));
    expect(result.current).toBe(false);
    // Each timer fires just after its boundary instant.
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(false);
  });

  test("is on from exactly the opening instant", () => {
    vi.setSystemTime(opensAt);
    expect(renderSwitch().result.current).toBe(true);
    vi.setSystemTime(opensAt.getTime() - 1);
    expect(renderSwitch().result.current).toBe(false);
  });

  test("corrects a stale server answer right after mount", () => {
    vi.setSystemTime(closesAt.getTime() + 60_000);
    const { result } = renderSwitch({ initial: true });
    expect(result.current).toBe(false);
  });

  test("keeps the server's answer on a fixed clock", () => {
    vi.setSystemTime(closesAt.getTime() + 60_000);
    const { result } = renderSwitch({ initial: true, live: false });
    expect(result.current).toBe(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(true);
  });

  test("re-checks when a throttled background tab becomes visible", () => {
    vi.setSystemTime(closesAt.getTime() - 1000);
    const { result } = renderSwitch();
    expect(result.current).toBe(true);

    // Move past the boundary without running the timer, as a throttled
    // background tab would.
    vi.setSystemTime(closesAt.getTime() + 1000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);
  });
});
