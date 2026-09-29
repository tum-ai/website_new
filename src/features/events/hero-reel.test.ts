import { describe, expect, test } from "vitest";
import { reelTakesWheel, settle, wheelRows } from "./hero-reel";

describe("wheelRows", () => {
  test("pixel deltas move a little less than a row per row of travel", () => {
    expect(wheelRows(140, 0, 100)).toBeCloseTo(1);
    expect(wheelRows(-70, 0, 100)).toBeCloseTo(-0.5);
  });

  test("line and page deltas are converted to pixels first", () => {
    expect(wheelRows(3, 1, 100)).toBeCloseTo((3 * 16) / 140);
    expect(wheelRows(1, 2, 100)).toBeCloseTo(100 / 140);
  });
});

describe("settle", () => {
  test("lands on the nearest name at rest", () => {
    expect(settle(3.4)).toBe(3);
    expect(settle(-2.6)).toBe(-3);
  });

  test("a throw carries on in its direction", () => {
    expect(settle(3.4, 8)).toBe(5);
    expect(settle(3.4, -8)).toBe(1);
  });
});

describe("reelTakesWheel", () => {
  const wheel = (deltaX: number, deltaY: number, lapRows: number) =>
    reelTakesWheel({ deltaX, deltaY, lapRows, count: 9 });

  test("a horizontal gesture always turns the reel", () => {
    expect(wheel(40, 5, 0)).toBe(true);
    expect(wheel(-40, 5, 50)).toBe(true);
  });

  test("a vertical gesture turns the reel without a click first", () => {
    expect(wheel(0, 80, 0)).toBe(true);
    expect(wheel(0, -80, 8.5)).toBe(true);
  });

  test("after one lap through the names the page scrolls on", () => {
    expect(wheel(0, 80, 9)).toBe(false);
    expect(wheel(0, -80, 12)).toBe(false);
  });
});
