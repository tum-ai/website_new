import { describe, expect, test } from "vitest";
import { reelWheelDelta, settle, wheelRows } from "./hero-reel";

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

describe("reelWheelDelta", () => {
  test("a horizontal gesture always turns the reel", () => {
    expect(reelWheelDelta(40, 5, false)).toBe(40);
    expect(reelWheelDelta(-40, 5, true)).toBe(-40);
  });

  test("a vertical gesture scrolls the page until the reel has focus", () => {
    expect(reelWheelDelta(0, 80, false)).toBeNull();
    expect(reelWheelDelta(0, 80, true)).toBe(80);
  });
});
