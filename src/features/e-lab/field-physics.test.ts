import { describe, expect, test } from "vitest";
import {
  eLabCopyFixture,
  eLabSelectionFixture,
} from "@/lib/cms-fixtures/programmes";
import { applicationField } from "./data/field";
import { buildStages, gatesOf } from "./data/selection";

const gates = gatesOf(
  buildStages(eLabCopyFixture.gates.stages, eLabSelectionFixture),
);

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

describe("the hero's field as drawn", () => {
  // The default cohort's layout as ApplicationField builds it: the dots in
  // group order, the last gate's lit ones opening to FieldDots' logo size.
  const field = applicationField([...gates]);
  const finalGate = gates.length - 1;
  const drawn = field.groups.flatMap((group) =>
    group.dots.map((dot) => ({ ...dot, lit: group.gateIndex === finalGate })),
  );
  const heroBodies: FieldBodies = {
    rest: drawn,
    radius: RADIUS,
    peaks: drawn.map((dot) => (dot.lit ? PEAK : 1)),
  };
  const lit = drawn.flatMap((dot, index) => (dot.lit ? [index] : []));
  /** Ten seconds of frames at 60 Hz: the loop must be idle well before. */
  const MAX_FRAMES = 600;

  /** Frame times as a browser reports them: ~16.7 ms with some jitter. */
  function frameTimes(seed: number) {
    let state = seed;
    return () => {
      state = (state * 16807) % 2147483647;
      return 1 / 60 + (state / 2147483647 - 0.5) * 0.004;
    };
  }

  /** Frames until `stepField` reports rest, or `Infinity`. */
  function framesToRest(sim: FieldSim, aimed: number, dt: () => number) {
    for (let frame = 0; frame < MAX_FRAMES; frame++) {
      if (!stepField(sim, heroBodies, aimed, dt())) return frame;
    }
    return Number.POSITIVE_INFINITY;
  }

  test("uses the default cohort: 500 dots, 10 of them lit", () => {
    expect(drawn).toHaveLength(gates[0]?.teams ?? 0);
    expect(lit).toHaveLength(gates[finalGate]?.teams ?? 0);
  });

  // With the frame time as the step, dots 495 and 499 of this layout kept
  // the loop running for good, rewriting all 500 circles every frame.
  test.each([
    ["steady 16.7 ms frames", () => () => 0.0167],
    ["jittered frames", frameTimes],
  ])(
    "every lit dot opens and closes to rest, with %s",
    (_, times) => {
      for (const aimed of lit) {
        const dt = times(aimed);
        const sim = createFieldSim(drawn.length);
        expect(framesToRest(sim, aimed, dt), `open ${aimed}`).toBeLessThan(
          MAX_FRAMES,
        );
        expect(framesToRest(sim, -1, dt), `close ${aimed}`).toBeLessThan(
          MAX_FRAMES,
        );
      }
    },
    // Thousands of full-field steps: about 15 s under CI's v8 coverage, and
    // past 20 s on a slow runner, so leave headroom.
    60_000,
  );
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
