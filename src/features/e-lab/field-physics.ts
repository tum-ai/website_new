/** A dot's rest position, in lattice units (neighbours sit 1 apart). */
type FieldPoint = { x: number; y: number };

/** The fixed side of the simulation: where the dots rest and how big they get. */
export type FieldBodies = {
  rest: readonly FieldPoint[];
  /** Dot radius at rest, in lattice units. */
  radius: number;
  /** Each dot's scale while aimed at, as a multiple of `radius`. */
  peaks: readonly number[];
};

/**
 * The moving side: each dot's offset from its rest position, its scale, and
 * their velocities (lattice units and scale per second). Mutated in place.
 */
export type FieldSim = {
  ox: Float32Array;
  oy: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  s: Float32Array;
  vs: Float32Array;
};

/** Spring stiffness and damping (per second): lively, with a small overshoot. */
const STIFFNESS = 180;
const DAMPING = 16;
/** Clearance two dots keep between their edges; the lattice rests at 0.4. */
export const GAP = 0.25;
/** Smallest drawn and colliding scale, so a spring's overshoot never inverts a dot. */
export const MIN_SCALE = 0.2;
/** Substeps per frame and contact passes per substep. */
const SUBSTEPS = 2;
const CONTACT_PASSES = 3;
/** Contact passes for the reduced-motion jump straight to the end state. */
const RELAX_PASSES = 80;
/**
 * Below this summed speed and distance to target (lattice units and scale
 * per second) a dot counts as settled: finer motion is under a hundredth of
 * a pixel.
 */
const REST = 0.002;

/** A field of `count` dots at rest. */
export function createFieldSim(count: number): FieldSim {
  return {
    ox: new Float32Array(count),
    oy: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    s: new Float32Array(count).fill(1),
    vs: new Float32Array(count),
  };
}

/** A dot's scale target: its peak while aimed at, else its rest size. */
const targetScale = (bodies: FieldBodies, index: number, aimed: number) =>
  index === aimed ? (bodies.peaks[index] ?? 1) : 1;

/**
 * Advances the field by `dt` seconds with `aimed` as the open dot (-1 for
 * none) and returns whether anything still moves. Every dot springs back
 * toward its rest position and size; then dots that overlap (closer than
 * their radii plus {@link GAP}) are pushed apart, and the push becomes
 * velocity, so an opening dot shoves its neighbours, which shove theirs:
 * the field ripples outward and settles. The aimed dot has infinite mass
 * and stays under the pointer. A step of no time (a loop's first frame)
 * changes nothing and reports motion, so the loop goes on.
 */
export function stepField(
  sim: FieldSim,
  bodies: FieldBodies,
  aimed: number,
  dt: number,
): boolean {
  // Pushes become velocity by dividing by the substep: none without time.
  if (!(dt > 0)) return true;
  const count = bodies.rest.length;
  const h = dt / SUBSTEPS;
  const cx = new Float32Array(count);
  const cy = new Float32Array(count);
  const touched = new Uint8Array(count);
  for (let sub = 0; sub < SUBSTEPS; sub++) {
    for (let index = 0; index < count; index++) {
      const ts = targetScale(bodies, index, aimed);
      const ox = sim.ox[index] ?? 0;
      const oy = sim.oy[index] ?? 0;
      const s = sim.s[index] ?? 1;
      const vx = (sim.vx[index] ?? 0) * (1 - DAMPING * h) - STIFFNESS * ox * h;
      const vy = (sim.vy[index] ?? 0) * (1 - DAMPING * h) - STIFFNESS * oy * h;
      const vs =
        (sim.vs[index] ?? 0) * (1 - DAMPING * h) + STIFFNESS * (ts - s) * h;
      sim.vx[index] = vx;
      sim.vy[index] = vy;
      sim.vs[index] = vs;
      sim.ox[index] = ox + vx * h;
      sim.oy[index] = oy + vy * h;
      sim.s[index] = s + vs * h;
    }
    cx.fill(0);
    cy.fill(0);
    touched.fill(0);
    separate(sim, bodies, aimed, CONTACT_PASSES, { cx, cy, touched });
    for (let index = 0; index < count; index++) {
      sim.vx[index] = (sim.vx[index] ?? 0) + (cx[index] ?? 0) / h;
      sim.vy[index] = (sim.vy[index] ?? 0) + (cy[index] ?? 0) / h;
    }
  }

  for (let index = 0; index < count; index++) {
    const speed =
      Math.abs(sim.vx[index] ?? 0) +
      Math.abs(sim.vy[index] ?? 0) +
      Math.abs(sim.vs[index] ?? 0);
    const growth = Math.abs(
      targetScale(bodies, index, aimed) - (sim.s[index] ?? 1),
    );
    // A dot held out by a neighbour is at rest off home; a free one is not.
    const away = touched[index]
      ? 0
      : Math.abs(sim.ox[index] ?? 0) + Math.abs(sim.oy[index] ?? 0);
    if (speed > REST || growth > REST || away > REST) return true;
  }
  return false;
}

/**
 * Puts the field straight into its end state for `aimed`, without motion:
 * every dot at its target size, pushed apart from home until nothing
 * overlaps. For reduced motion.
 */
export function settleField(sim: FieldSim, bodies: FieldBodies, aimed: number) {
  for (let index = 0; index < bodies.rest.length; index++) {
    sim.ox[index] = 0;
    sim.oy[index] = 0;
    sim.vx[index] = 0;
    sim.vy[index] = 0;
    sim.vs[index] = 0;
    sim.s[index] = targetScale(bodies, index, aimed);
  }
  separate(sim, bodies, aimed, RELAX_PASSES);
}

/** Where a pass's corrections are summed, per dot, and which dots touched. */
type Corrections = {
  cx: Float32Array;
  cy: Float32Array;
  touched: Uint8Array;
};

/**
 * Pushes overlapping dots apart, `passes` times over every pair in reach
 * (Gauss-Seidel: each fix sees the ones before it). Dots at rest size go
 * into a grid one contact distance wide, so each checks only its own and
 * the neighbouring cells; the few grown dots check every dot.
 */
function separate(
  sim: FieldSim,
  bodies: FieldBodies,
  aimed: number,
  passes: number,
  corrections?: Corrections,
) {
  const { rest, radius } = bodies;
  const count = rest.length;
  const cell = 2 * radius + GAP;
  const x = (index: number) => (rest[index]?.x ?? 0) + (sim.ox[index] ?? 0);
  const y = (index: number) => (rest[index]?.y ?? 0) + (sim.oy[index] ?? 0);
  const scale = (index: number) => Math.max(sim.s[index] ?? 1, MIN_SCALE);

  const pair = (a: number, b: number) => {
    const wa = a === aimed ? 0 : 1;
    const wb = b === aimed ? 0 : 1;
    if (wa + wb === 0) return;
    let dx = x(b) - x(a);
    let dy = y(b) - y(a);
    let distance = Math.hypot(dx, dy);
    const reach = radius * (scale(a) + scale(b)) + GAP;
    if (distance >= reach) return;
    if (distance < 1e-6) {
      dx = 1;
      dy = 0;
      distance = 1;
    }
    const push = (reach - distance) / (wa + wb) / distance;
    const px = dx * push;
    const py = dy * push;
    sim.ox[a] = (sim.ox[a] ?? 0) - px * wa;
    sim.oy[a] = (sim.oy[a] ?? 0) - py * wa;
    sim.ox[b] = (sim.ox[b] ?? 0) + px * wb;
    sim.oy[b] = (sim.oy[b] ?? 0) + py * wb;
    if (corrections) {
      const { cx, cy, touched } = corrections;
      cx[a] = (cx[a] ?? 0) - px * wa;
      cy[a] = (cy[a] ?? 0) - py * wa;
      cx[b] = (cx[b] ?? 0) + px * wb;
      cy[b] = (cy[b] ?? 0) + py * wb;
      touched[a] = 1;
      touched[b] = 1;
    }
  };

  for (let pass = 0; pass < passes; pass++) {
    const grown: number[] = [];
    const small: number[] = [];
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < count; index++) {
      if (scale(index) > 1) {
        grown.push(index);
        continue;
      }
      small.push(index);
      minX = Math.min(minX, x(index));
      minY = Math.min(minY, y(index));
      maxX = Math.max(maxX, x(index));
      maxY = Math.max(maxY, y(index));
    }

    // Counting sort of the small dots into grid cells.
    const columns = Math.floor((maxX - minX) / cell) + 1;
    const rows = Math.floor((maxY - minY) / cell) + 1;
    const cellOf = new Int32Array(small.length);
    const starts = new Int32Array(small.length ? columns * rows + 1 : 1);
    small.forEach((index, order) => {
      const column = Math.floor((x(index) - minX) / cell);
      const row = Math.floor((y(index) - minY) / cell);
      cellOf[order] = row * columns + column;
      starts[row * columns + column + 1] =
        (starts[row * columns + column + 1] ?? 0) + 1;
    });
    for (let at = 1; at < starts.length; at++) {
      starts[at] = (starts[at] ?? 0) + (starts[at - 1] ?? 0);
    }
    const fill = starts.slice(0, -1);
    const items = new Int32Array(small.length);
    small.forEach((index, order) => {
      const at = cellOf[order] ?? 0;
      items[fill[at] ?? 0] = index;
      fill[at] = (fill[at] ?? 0) + 1;
    });

    // Each pair once: the own cell, then the four forward neighbours.
    for (let row = 0; row < rows && small.length; row++) {
      for (let column = 0; column < columns; column++) {
        const own = row * columns + column;
        const from = starts[own] ?? 0;
        const to = starts[own + 1] ?? 0;
        for (let i = from; i < to; i++) {
          const a = items[i] ?? 0;
          for (let j = i + 1; j < to; j++) pair(a, items[j] ?? 0);
          for (const [dc, dr] of FORWARD) {
            const c = column + dc;
            const r = row + dr;
            if (c < 0 || c >= columns || r >= rows) continue;
            const other = r * columns + c;
            for (
              let j = starts[other] ?? 0;
              j < (starts[other + 1] ?? 0);
              j++
            ) {
              pair(a, items[j] ?? 0);
            }
          }
        }
      }
    }

    grown.forEach((a, order) => {
      for (const b of small) pair(a, b);
      for (const b of grown.slice(order + 1)) pair(a, b);
    });
  }
}

/** Grid neighbours after a cell in scan order, as [column, row] steps. */
const FORWARD = [
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;
