import { describe, expect, test } from "vitest";
import {
  createFieldSim,
  type FieldBodies,
  type FieldSim,
  GAP,
  settleField,
  stepField,
} from "./field-physics";

const RADIUS = 0.3;
const PEAK = 2.4 / RADIUS;

/** A hexagonal patch of lattice points (pitch 1) within `reach` of the origin. */
function hexPatch(reach: number) {
  const rest: { x: number; y: number }[] = [];
  const rowHeight = Math.sqrt(3) / 2;
  const rows = Math.ceil(reach / rowHeight);
  for (let row = -rows; row <= rows; row++) {
    const offset = Math.abs(row) % 2 === 1 ? 0.5 : 0;
    for (let column = -reach - 1; column <= reach + 1; column++) {
      const point = { x: column + offset, y: row * rowHeight };
      if (Math.hypot(point.x, point.y) <= reach) rest.push(point);
    }
  }
  return rest;
}

const rest = hexPatch(7);
const centre = rest.findIndex((point) => point.x === 0 && point.y === 0);
const bodies: FieldBodies = {
  rest,
  radius: RADIUS,
  peaks: rest.map((_, index) => (index === centre ? PEAK : 1)),
};

/** Steps at 60 fps until the field settles; fails if it never does. */
function runToRest(sim: FieldSim, aimed: number) {
  for (let frame = 0; frame < 600; frame++) {
    if (!stepField(sim, bodies, aimed, 1 / 60)) return frame;
  }
  throw new Error("the field never settled");
}

const position = (sim: FieldSim, index: number) => ({
  x: (rest[index]?.x ?? 0) + (sim.ox[index] ?? 0),
  y: (rest[index]?.y ?? 0) + (sim.oy[index] ?? 0),
});

/** The deepest overlap between any two dots, in lattice units (0 for none). */
function worstOverlap(sim: FieldSim) {
  let worst = 0;
  for (let a = 0; a < rest.length; a++) {
    for (let b = a + 1; b < rest.length; b++) {
      const pa = position(sim, a);
      const pb = position(sim, b);
      const reach = RADIUS * ((sim.s[a] ?? 1) + (sim.s[b] ?? 1)) + GAP;
      worst = Math.max(worst, reach - Math.hypot(pb.x - pa.x, pb.y - pa.y));
    }
  }
  return worst;
}

const offset = (sim: FieldSim, index: number) =>
  Math.hypot(sim.ox[index] ?? 0, sim.oy[index] ?? 0);

describe("stepField", () => {
  test("a field at rest stays still", () => {
    const sim = createFieldSim(rest.length);
    expect(stepField(sim, bodies, -1, 1 / 60)).toBe(false);
    expect(worstOverlap(sim)).toBeLessThanOrEqual(0);
  });

  test("a step of no time, as on a loop's first frame, keeps the state finite", () => {
    const sim = createFieldSim(rest.length);
    expect(stepField(sim, bodies, centre, 0)).toBe(true);
    runToRest(sim, centre);
    expect(sim.ox.every(Number.isFinite)).toBe(true);
    expect(sim.s[centre]).toBeCloseTo(PEAK, 2);
  });

  test("an opened dot pushes a ripple of dots that never overlap and stays put", () => {
    const sim = createFieldSim(rest.length);
    runToRest(sim, centre);
    expect(sim.s[centre]).toBeCloseTo(PEAK, 2);
    expect(offset(sim, centre)).toBe(0);
    expect(worstOverlap(sim)).toBeLessThan(0.02);
    // Rest-lattice dots beyond the open disc's reach were moved by their
    // neighbours, not by the disc.
    const discReach = RADIUS * (PEAK + 1) + GAP;
    const pushedOn = rest.filter(
      (point, index) =>
        Math.hypot(point.x, point.y) > discReach && offset(sim, index) > 0.05,
    );
    expect(pushedOn.length).toBeGreaterThan(0);
  });

  test("released, every dot returns to its place and size", () => {
    const sim = createFieldSim(rest.length);
    runToRest(sim, centre);
    runToRest(sim, -1);
    for (let index = 0; index < rest.length; index++) {
      expect(offset(sim, index)).toBeLessThan(0.01);
      expect(sim.s[index]).toBeCloseTo(1, 2);
    }
  });
});

describe("settleField", () => {
  test("jumps straight to a field without overlaps", () => {
    const sim = createFieldSim(rest.length);
    settleField(sim, bodies, centre);
    expect(sim.s[centre]).toBe(PEAK);
    expect(offset(sim, centre)).toBe(0);
    expect(worstOverlap(sim)).toBeLessThan(0.02);
  });
});
