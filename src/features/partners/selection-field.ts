/**
 * The geometry of the /partners selection field: one recruiting round drawn
 * to the exact count, one mark per started application, with the admitted
 * share lit. Pure and deterministic, so the server markup is stable and the
 * counts are unit-tested against the config facts.
 */

/** One mark's cell, in SVG viewBox units, shared by every drawing of a round. */
export const MARK_PITCH = 12;
/**
 * Radius of every mark, lit or not. One size keeps the drawing to scale by
 * area as well as by count: the lit marks cover exactly the admitted share
 * of the field's ink (48 of 2100 is 2.3%), and only their colour sets them
 * apart. A larger lit mark would overstate the share by its area ratio.
 */
export const MARK_RADIUS = 2.6;

/** A mark's cell in the field, counted from the top-left corner. */
type FieldCell = { column: number; row: number };

/** A field laid out on a fixed number of columns. */
export type SelectionField = {
  columns: number;
  /** Rows including a partly filled last row. */
  rows: number;
  /** Marks in the last row: `columns` when the count fills whole rows. */
  lastRow: number;
  /** Every mark the field holds: exactly the started applications. */
  marks: number;
  /**
   * The lit cells, in the order they light up: the order that placed
   * them, so marks lit one after another sit far apart.
   */
  lit: FieldCell[];
};

/*
 * Blue noise: Mitchell's best candidate. Each new lit mark is the free cell,
 * among a few drawn at random, farthest from every mark lit so far, so the
 * admitted spread evenly with no clumps (a plain random pick) and no visible
 * lattice (an even stride or a low-discrepancy sequence on a small grid).
 * A fixed seed keeps the field identical on every render.
 */
const CANDIDATES = 12;
const SEED = 2020;

/** mulberry32: a small seeded generator, uniform on [0, 1). */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lays `marks` out on `columns` columns in reading order and lights `lit` of
 * them. Every drawn mark is a real application: a count that doesn't fill
 * whole rows ends in a short last row rather than padding (2100 fills 30
 * rows of 70 and 50 rows of 42 exactly).
 */
export function selectionField({
  marks,
  lit,
  columns,
}: {
  marks: number;
  lit: number;
  columns: number;
}): SelectionField {
  if (!Number.isInteger(marks) || marks <= 0) {
    throw new Error(`The field needs a whole number of marks, got ${marks}`);
  }
  if (!Number.isInteger(columns) || columns <= 0) {
    throw new Error(
      `The field needs a whole number of columns, got ${columns}`,
    );
  }
  if (!Number.isInteger(lit) || lit < 0 || lit > marks) {
    throw new Error(`Can't light ${lit} of ${marks} marks`);
  }
  const rows = Math.ceil(marks / columns);
  const lastRow = marks - (rows - 1) * columns;
  const random = seededRandom(SEED);
  const taken = new Set<number>();
  const cells: FieldCell[] = [];
  const distance = (a: FieldCell, b: FieldCell) =>
    (a.column - b.column) ** 2 + (a.row - b.row) ** 2;
  while (cells.length < lit) {
    let best: FieldCell | undefined;
    let bestDistance = -1;
    for (let tries = 0; tries < CANDIDATES; tries += 1) {
      const index = Math.floor(random() * marks);
      if (taken.has(index)) continue;
      const candidate = {
        column: index % columns,
        row: Math.floor(index / columns),
      };
      const nearest = cells.reduce(
        (closest, cell) => Math.min(closest, distance(candidate, cell)),
        Number.POSITIVE_INFINITY,
      );
      if (nearest > bestDistance) {
        best = candidate;
        bestDistance = nearest;
      }
    }
    if (!best) continue;
    taken.add(best.row * columns + best.column);
    cells.push(best);
  }
  return { columns, rows, lastRow, marks, lit: cells };
}
