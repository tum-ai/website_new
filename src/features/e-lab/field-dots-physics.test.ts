import { describe, expect, test } from "vitest";
import {
  eLabCopyFixture,
  eLabSelectionFixture,
} from "@/lib/cms-fixtures/programmes";
import {
  createFieldSim,
  type FieldBodies,
  type FieldSim,
  stepField,
} from "@/lib/spring-field";
import { applicationField } from "./data/field";
import { buildStages, gatesOf } from "./data/selection";

const gates = gatesOf(
  buildStages(eLabCopyFixture.gates.stages, eLabSelectionFixture),
);

// FieldDots' rest radius and logo size, in lattice units.
const RADIUS = 0.3;
const PEAK = 2.4 / RADIUS;

describe("the hero's field as drawn", () => {
  // The supplied synthetic cohort's layout as ApplicationField builds it: the dots in
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

  test("uses the supplied cohort counts for the dots and the lit stage", () => {
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
