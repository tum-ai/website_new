/**
 * A field of discs as a small spring simulation: one disc grows while aimed
 * at and shoves the others aside, which shove theirs in turn, and every
 * disc springs back home. Units are the caller's: the E-Lab field
 * (`features/e-lab/field-dots.tsx`) works in lattice units, the homepage's
 * member faces (`features/home/member-faces.tsx`) in pixels.
 */

/** A dot's rest position (on the E-Lab lattice, neighbours sit 1 apart). */
type FieldPoint = { x: number; y: number };

/** The fixed side of the simulation: where the dots rest and how big they get. */
export type FieldBodies = {
  rest: readonly FieldPoint[];
  /** Dot radius at rest. */
  radius: number;
  /** Each dot's scale while aimed at, as a multiple of `radius`. */
  peaks: readonly number[];
  /**
   * Clearance two dots keep between their edges; {@link GAP} by default.
   * Negative for discs that overlap at rest, like a stack of portraits: at
   * `2 * radius + gap` apart they touch, so the stack rests as laid out.
   */
  gap?: number;
  /** Damping of the position spring (per second); {@link DAMPING} by default. */
  damping?: number;
  /**
   * Damping of the size spring (per second); {@link DAMPING} by default.
   * `2 * Math.sqrt(STIFFNESS)` is critical: a shrinking dot then never dips
   * below its rest size.
   */
  scaleDamping?: number;
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
  /** Frame time not yet simulated, in seconds: always under one step. */
  lag: number;
};

/** Spring stiffness and damping (per second): lively, with a small overshoot. */
export const STIFFNESS = 180;
const DAMPING = 16;
/** Default clearance between two dots' edges; the E-Lab lattice rests at 0.4. */
export const GAP = 0.25;
/** Smallest drawn and colliding scale, so a spring's overshoot never inverts a dot. */
export const MIN_SCALE = 0.2;
/**
 * The fixed step the spring integrates, in seconds, with contact passes per
 * step. A fixed step makes the motion the same at every frame rate and under
 * frame-time jitter: a step that varied with the frame turned the contacts'
 * leftover pushes into fresh velocity, and a packed field never came to rest.
 * At 60 Hz this is two steps per frame.
 */
const STEP = 1 / 120;
const CONTACT_PASSES = 3;
/** Contact passes for the reduced-motion jump straight to the end state. */
const RELAX_PASSES = 80;
/**
 * Below this summed speed and distance to target (lattice units and scale
 * per second) a dot counts as settled: finer motion is under a hundredth of
 * a pixel.
 */
const REST = 0.002;
/**
 * A dot held by a neighbour counts as settled below this speed over the
 * frame (lattice units per second, under a pixel per second on /e-lab). Its
 * velocity is not a measure there: the spring and the contact cancel each
 * step, leaving velocity on a dot that no longer moves, and the pushes the
 * contact passes leave over make a packed rim creep slower than this.
 */
const CONTACT_REST = 0.03;

/** A field of `count` dots at rest. */
export function createFieldSim(count: number): FieldSim {
  return {
    ox: new Float32Array(count),
    oy: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    s: new Float32Array(count).fill(1),
    vs: new Float32Array(count),
    lag: 0,
  };
}

/** A dot's scale target: its peak while aimed at, else its rest size. */
const targetScale = (bodies: FieldBodies, index: number, aimed: number) =>
  index === aimed ? (bodies.peaks[index] ?? 1) : 1;

/**
 * Advances the field by `dt` seconds with `aimed` as the open dot (-1 for
 * none) and returns whether anything still moves. Every dot springs back
 * toward its rest position and size; then dots that overlap (closer than
 * their radii plus the bodies' `gap`) are pushed apart, and the push becomes
 * velocity, so an opening dot shoves its neighbours, which shove theirs:
 * the field ripples outward and settles. The aimed dot has infinite mass
 * and stays under the pointer. Time advances in fixed steps of
 * {@link STEP}; the rest of `dt` carries over to the next call. A call
 * shorter than a step (a loop's first frame, of no time) changes nothing
 * and reports motion, so the loop goes on. A dot held by a neighbour is
 * settled once it moves less than {@link CONTACT_REST} over the call.
 */
export function stepField(
  sim: FieldSim,
  bodies: FieldBodies,
  aimed: number,
  dt: number,
): boolean {
  if (!(dt > 0)) return true;
  sim.lag += dt;
  // Pushes become velocity by dividing by the step: none without a step.
  const steps = Math.floor(sim.lag / STEP + 1e-6);
  if (steps === 0) return true;
  sim.lag = Math.max(sim.lag - steps * STEP, 0);
  const count = bodies.rest.length;
  const h = STEP;
  const damping = bodies.damping ?? DAMPING;
  const scaleDamping = bodies.scaleDamping ?? DAMPING;
  const startX = Float32Array.from(sim.ox);
  const startY = Float32Array.from(sim.oy);
  const cx = new Float32Array(count);
  const cy = new Float32Array(count);
  const touched = new Uint8Array(count);
  for (let step = 0; step < steps; step++) {
    for (let index = 0; index < count; index++) {
      const ts = targetScale(bodies, index, aimed);
      const ox = sim.ox[index] ?? 0;
      const oy = sim.oy[index] ?? 0;
      const s = sim.s[index] ?? 1;
      const vx = (sim.vx[index] ?? 0) * (1 - damping * h) - STIFFNESS * ox * h;
      const vy = (sim.vy[index] ?? 0) * (1 - damping * h) - STIFFNESS * oy * h;
      const vs =
        (sim.vs[index] ?? 0) * (1 - scaleDamping * h) +
        STIFFNESS * (ts - s) * h;
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

  const elapsed = steps * h;
  for (let index = 0; index < count; index++) {
    const growth = Math.abs(
      targetScale(bodies, index, aimed) - (sim.s[index] ?? 1),
    );
    const sizing = Math.abs(sim.vs[index] ?? 0);
    if (growth > REST || sizing > REST) return true;
    if (touched[index]) {
      // Held out by a neighbour: at rest off home once it stops moving.
      const moved =
        Math.abs((sim.ox[index] ?? 0) - (startX[index] ?? 0)) +
        Math.abs((sim.oy[index] ?? 0) - (startY[index] ?? 0));
      if (moved / elapsed > CONTACT_REST) return true;
      continue;
    }
    const speed = Math.abs(sim.vx[index] ?? 0) + Math.abs(sim.vy[index] ?? 0);
    const away = Math.abs(sim.ox[index] ?? 0) + Math.abs(sim.oy[index] ?? 0);
    if (speed > REST || away > REST) return true;
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
  const { rest, radius, gap = GAP } = bodies;
  const count = rest.length;
  const cell = 2 * radius + gap;
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
    const reach = radius * (scale(a) + scale(b)) + gap;
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
