import type { Gate } from "./selection";

/** One team application in the hero's field, at its grid cell. */
export type FieldDot = {
  column: number;
  row: number;
};

/**
 * The dots that go no further than one gate: `gateIndex` is the last gate
 * those teams reached. The last group reached the final gate.
 */
export type FieldGroup = {
  gateIndex: number;
  dots: FieldDot[];
};

/** The field's grid: one cell per application, filled row by row. */
export type FieldGrid = {
  columns: number;
  rows: number;
  groups: FieldGroup[];
};

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
 * Lays out one dot per application of the first gate in a grid of
 * `columns`, and assigns each dot the last gate its team reached: exactly
 * `gates[i].teams - gates[i + 1].teams` dots stop at gate i, and
 * `gates.at(-1).teams` dots reach the last one. Which cells go where is a
 * seeded shuffle, so the pattern looks scattered but never changes between
 * renders (no hydration or visual-test drift).
 */
export function applicationField(
  gates: Pick<Gate, "teams">[],
  columns: number,
  seed = 6,
): FieldGrid {
  const total = gates[0]?.teams ?? 0;
  const cells = Array.from({ length: total }, (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
  }));

  const random = seededRandom(seed);
  for (let index = cells.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [cells[index], cells[swap]] = [cells[swap], cells[index]] as [
      FieldDot,
      FieldDot,
    ];
  }

  let taken = 0;
  const groups = gates.map((gate, gateIndex) => {
    const next = gates[gateIndex + 1]?.teams ?? 0;
    const size = gate.teams - next;
    const dots = cells.slice(taken, taken + size);
    taken += size;
    return { gateIndex, dots };
  });

  return { columns, rows: Math.ceil(total / columns), groups };
}
