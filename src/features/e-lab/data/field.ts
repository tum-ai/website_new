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

/** The field: its dots by gate, and the radius that contains them all. */
export type Field = {
  /** Distance of the outermost dot's centre from the field's centre. */
  radius: number;
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
 * by half a pitch) that lie closest to the origin: a round field of evenly
 * spaced points. Ties at the rim are broken by angle, so the set is exact.
 */
function latticeDisc(count: number): FieldDot[] {
  const reach = Math.ceil(Math.sqrt((count * ROW_HEIGHT) / Math.PI)) + 2;
  const rows = Math.ceil(reach / ROW_HEIGHT);
  const points: FieldDot[] = [];
  for (let row = -rows; row <= rows; row++) {
    const offset = Math.abs(row) % 2 === 1 ? 0.5 : 0;
    for (let column = -reach; column <= reach; column++) {
      points.push({ x: column + offset, y: row * ROW_HEIGHT });
    }
  }
  const distance = (point: FieldDot) => Math.hypot(point.x, point.y);
  return points
    .sort(
      (a, b) =>
        distance(a) - distance(b) ||
        Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x),
    )
    .slice(0, count);
}

/**
 * One dot per application of the first gate, as a round field, with each
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
  const dots = latticeDisc(gates[0]?.teams ?? 0);
  const radius = Math.max(0, ...dots.map((dot) => Math.hypot(dot.x, dot.y)));

  const random = seededRandom(seed);
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

  return { radius, groups };
}
