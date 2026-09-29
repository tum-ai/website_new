import type { Gate } from "./selection";

/** One team application in the hero's field, in grid units from its centre. */
export type FieldDot = {
  x: number;
  y: number;
};

/**
 * The dots that go no further than one gate: `gateIndex` is the last gate
 * those teams reached. The last group reached the final gate.
 */
export type FieldGroup = {
  gateIndex: number;
  dots: FieldDot[];
};

/** The field: its dots by gate, and the box around their centres. */
export type Field = {
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  groups: FieldGroup[];
};

/** Row spacing of a hexagonal lattice with a pitch of 1. */
const ROW_HEIGHT = Math.sqrt(3) / 2;

/** Mulberry32: a small seeded PRNG, so the field is the same on every render. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The `count` points of a hexagonal lattice (pitch 1, every other row offset
 * by half a pitch) inside an irregular outline: each point's distance from
 * the origin is divided by the outline's reach in its direction (a few
 * seeded lobes), plus a little seeded noise per point that roughens the rim,
 * and the `count` smallest are kept. Exact count, even spacing, organic edge.
 */
function latticeBlob(count: number, random: () => number): FieldDot[] {
  const phases = [random(), random(), random()].map((r) => r * 2 * Math.PI);
  const reachAt = (angle: number) =>
    1 +
    0.22 * Math.sin(2 * angle + (phases[0] ?? 0)) +
    0.14 * Math.sin(3 * angle + (phases[1] ?? 0)) +
    0.08 * Math.sin(5 * angle + (phases[2] ?? 0));

  const reach = Math.ceil(1.6 * Math.sqrt((count * ROW_HEIGHT) / Math.PI)) + 2;
  const rows = Math.ceil(reach / ROW_HEIGHT);
  const candidates: { point: FieldDot; score: number }[] = [];
  for (let row = -rows; row <= rows; row++) {
    const offset = Math.abs(row) % 2 === 1 ? 0.5 : 0;
    for (let column = -reach; column <= reach; column++) {
      const point = { x: column + offset, y: row * ROW_HEIGHT };
      const angle = Math.atan2(point.y, point.x);
      const rim = 1 + (random() - 0.5) * 0.16;
      candidates.push({
        point,
        score: Math.hypot(point.x, point.y) / (reachAt(angle) * rim),
      });
    }
  }
  return candidates
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((candidate) => candidate.point);
}

/**
 * One dot per application of the first gate, as an irregular field, with each
 * dot assigned the last gate its team reached: exactly
 * `gates[i].teams - gates[i + 1].teams` dots stop at gate i, and
 * `gates.at(-1).teams` dots reach the last one. Which dots go where is a
 * seeded shuffle, so the pattern looks scattered but never changes between
 * renders (no hydration or visual-test drift).
 */
export function applicationField(
  gates: Pick<Gate, "teams">[],
  seed = 6,
): Field {
  const random = seededRandom(seed);
  const dots = latticeBlob(gates[0]?.teams ?? 0, random);
  const xs = dots.map((dot) => dot.x);
  const ys = dots.map((dot) => dot.y);
  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };

  for (let index = dots.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [dots[index], dots[swap]] = [dots[swap], dots[index]] as [
      FieldDot,
      FieldDot,
    ];
  }

  let taken = 0;
  const groups = gates.map((gate, gateIndex) => {
    const next = gates[gateIndex + 1]?.teams ?? 0;
    const size = gate.teams - next;
    const group = { gateIndex, dots: dots.slice(taken, taken + size) };
    taken += size;
    return group;
  });

  return { bounds, groups };
}
