import { describe, expect, test } from "vitest";
import { reelTarget } from "./hero-scroll";

describe("reelTarget", () => {
  test("the track is one full turn: it starts and ends on the first name", () => {
    expect(reelTarget(0, 16)).toBe(0);
    expect(reelTarget(1, 16)).toBe(16);
  });

  test("each name holds still in the slot at the edges of its stretch", () => {
    const stretch = 1 / 16;
    expect(reelTarget(stretch * 3.1, 16)).toBe(3);
    expect(reelTarget(stretch * 3.9, 16)).toBe(4);
    expect(reelTarget(stretch * 3.5, 16)).toBeCloseTo(3.5);
  });

  test("clamps the progress", () => {
    expect(reelTarget(-2, 5)).toBe(0);
    expect(reelTarget(3, 5)).toBe(5);
  });
});
