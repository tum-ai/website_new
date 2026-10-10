import { describe, expect, test } from "vitest";
import {
  type ClockWindow,
  clockWindowBoundaries,
  clockWindowPhase,
  isClockWindowOpen,
} from "./clock-window";

const opensAt = Date.parse("2026-09-27T22:00:00Z");
const closesAt = Date.parse("2026-10-27T22:59:00Z");
const clock: ClockWindow = { switchedOn: true, opensAt, closesAt };
const at = (instant: number) => new Date(instant);

describe("isClockWindowOpen", () => {
  test("opens at the opening instant and closes at the closing one", () => {
    expect(isClockWindowOpen(clock, at(opensAt - 1))).toBe(false);
    expect(isClockWindowOpen(clock, at(opensAt))).toBe(true);
    expect(isClockWindowOpen(clock, at(closesAt - 1))).toBe(true);
    expect(isClockWindowOpen(clock, at(closesAt))).toBe(false);
  });

  test("stays closed while switched off", () => {
    expect(
      isClockWindowOpen({ ...clock, switchedOn: false }, at(opensAt)),
    ).toBe(false);
  });

  test("a missing end never closes, a missing start is open from the start", () => {
    expect(
      isClockWindowOpen({ ...clock, closesAt: null }, at(closesAt + 1e10)),
    ).toBe(true);
    expect(isClockWindowOpen({ ...clock, opensAt: null }, at(0))).toBe(true);
  });
});

test("the boundaries are the instants that are set", () => {
  expect(clockWindowBoundaries(clock)).toStrictEqual([
    at(opensAt),
    at(closesAt),
  ]);
  expect(clockWindowBoundaries({ ...clock, opensAt: null })).toStrictEqual([
    at(closesAt),
  ]);
});

describe("clockWindowPhase", () => {
  test("is upcoming before the opening, open inside, closed after", () => {
    expect(clockWindowPhase(clock, at(opensAt - 1))).toBe("upcoming");
    expect(clockWindowPhase(clock, at(opensAt))).toBe("open");
    expect(clockWindowPhase(clock, at(closesAt))).toBe("closed");
  });

  test("is closed at every instant while switched off", () => {
    const off = { ...clock, switchedOn: false };
    expect(clockWindowPhase(off, at(opensAt - 1))).toBe("closed");
    expect(clockWindowPhase(off, at(opensAt))).toBe("closed");
  });

  test("is never upcoming without an opening instant", () => {
    const always = { ...clock, opensAt: null };
    expect(clockWindowPhase(always, at(opensAt - 1))).toBe("open");
    expect(clockWindowPhase(always, at(closesAt))).toBe("closed");
  });
});
