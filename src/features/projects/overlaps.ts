/**
 * Geometry of the /projects figure: one circle for AI at the origin and a
 * ring of "seats", one circle per field, each overlapping it. The overlap
 * (the lens) is the task force. Units are SVG user units with y pointing
 * down; the figure and its links are placed from these numbers only.
 */

/** Radius of the AI circle. */
export const AI_RADIUS = 100;
/** Distance from the origin to every seat's centre. */
export const SEAT_DISTANCE = 120;
/** Seat radius when the ring has room for it. */
const MAX_SEAT_RADIUS = 55;
/** Neighbouring seats keep this share of the room between them free. */
const NEIGHBOUR_CLEARANCE = 0.9;
/** Space around the outermost circles, so strokes and focus rings aren't clipped. */
const PADDING = 6;
/**
 * How far a seat's label sits out from the seat's centre along its axis, as
 * a share of the seat radius: into the crescent beyond the AI circle.
 */
const LABEL_OFFSET = 0.22;
/** Share of the crescent's width the label may fill. */
const LABEL_FILL = 0.9;

/** A seat's circle, its lens and where its label goes. */
export type Seat = {
  /** Position in the ring, clockwise from the top. */
  index: number;
  /** Centre of the seat's circle. */
  cx: number;
  cy: number;
  /** Radius of the seat's circle. */
  r: number;
  /** Unit vector from the origin to the seat's centre. */
  ux: number;
  uy: number;
  /** The two points where the seat's circle crosses the AI circle. */
  crossings: readonly [Point, Point];
  /** SVG path of the lens, the region inside both circles. */
  lens: string;
  /**
   * The seat's label: its centre, and the width it may take, which is the
   * part of the seat's chord at the label's height that lies outside the AI
   * circle (the crescent), less a margin. Labels are set horizontally, so a
   * seat to the side needs its label moved sideways, not along its axis.
   */
  label: Point & { width: number };
};

type Point = { x: number; y: number };

/**
 * Seat radius for a ring of `count` seats: as large as allowed, but small
 * enough that neighbours, whose centres are 2d·sin(π/count) apart, keep a
 * gap between them.
 */
export function seatRadius(count: number) {
  const room = SEAT_DISTANCE * Math.sin(Math.PI / count);
  return Math.min(MAX_SEAT_RADIUS, NEIGHBOUR_CLEARANCE * room);
}

/** Half the side of the square that holds the whole figure. */
export function figureExtent(count: number) {
  return SEAT_DISTANCE + seatRadius(count) + PADDING;
}

/** The SVG viewBox of the whole figure, centred on the AI circle. */
export function figureViewBox(count: number) {
  const e = figureExtent(count);
  return `${-e} ${-e} ${2 * e} ${2 * e}`;
}

/**
 * Lays out `count` seats evenly around the AI circle, clockwise from the
 * top. Each seat's lens is the two arcs between its crossings: the AI
 * circle's arc on the seat's side, then the seat circle's arc on the
 * origin's side. Both are minor arcs, drawn counter-clockwise (sweep 0),
 * because both centres lie outside the other circle's chord.
 */
export function layoutSeats(count: number): Seat[] {
  const r = seatRadius(count);
  const d = SEAT_DISTANCE;
  const R = AI_RADIUS;
  // Distance from the origin to the chord through both crossings, and the
  // chord's half-length.
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(R * R - a * a);

  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const first = { x: a * ux - h * uy, y: a * uy + h * ux };
    const second = { x: a * ux + h * uy, y: a * uy - h * ux };
    const lens = [
      `M ${fixed(first.x)} ${fixed(first.y)}`,
      `A ${R} ${R} 0 0 0 ${fixed(second.x)} ${fixed(second.y)}`,
      `A ${fixed(r)} ${fixed(r)} 0 0 0 ${fixed(first.x)} ${fixed(first.y)}`,
      "Z",
    ].join(" ");
    const label = labelPlace(d * ux, d * uy, r, uy);
    return {
      index,
      cx: d * ux,
      cy: d * uy,
      r,
      ux,
      uy,
      crossings: [first, second] as const,
      lens,
      label,
    };
  });
}

/**
 * The label of the seat centred at (cx, cy): at LABEL_OFFSET·r along the
 * axis vertically, and horizontally in the middle of the crescent at that
 * height, between the AI circle and the seat's outer edge.
 */
function labelPlace(cx: number, cy: number, r: number, uy: number) {
  const R = AI_RADIUS;
  const y = cy + uy * LABEL_OFFSET * r;
  const halfChord = Math.sqrt(r * r - (y - cy) ** 2);
  let left = cx - halfChord;
  let right = cx + halfChord;
  const aiHalfChord = Math.abs(y) < R ? Math.sqrt(R * R - y * y) : 0;
  // A seat to the side: the AI circle takes the inner part of the chord.
  if (aiHalfChord > 0 && Math.abs(cx) > 1e-9) {
    if (cx > 0) left = Math.max(left, aiHalfChord);
    else right = Math.min(right, -aiHalfChord);
  }
  return { x: (left + right) / 2, y, width: LABEL_FILL * (right - left) };
}

/**
 * The square around a seat's circle, as percentages of the figure, for
 * placing an HTML element (the seat's link) exactly over it.
 */
export function seatBox(seat: Seat, count: number) {
  const e = figureExtent(count);
  const toPercent = (value: number) =>
    `${((value / (2 * e)) * 100).toFixed(4)}%`;
  return {
    left: toPercent(seat.cx - seat.r + e),
    top: toPercent(seat.cy - seat.r + e),
    width: toPercent(2 * seat.r),
    height: toPercent(2 * seat.r),
  };
}

/** The SVG viewBox of a seat's square, in figure units. */
export function seatViewBox(seat: Seat) {
  const size = 2 * seat.r;
  return `${fixed(seat.cx - seat.r)} ${fixed(seat.cy - seat.r)} ${fixed(size)} ${fixed(size)}`;
}

function fixed(value: number) {
  return Number(value.toFixed(3));
}
