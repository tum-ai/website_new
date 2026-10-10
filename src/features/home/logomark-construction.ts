/**
 * The geometry of the logomark the home page draws as the brand guide's logo
 * construction sheet (the hero aperture and the join band), in the official
 * 477 x 406 viewBox, together with the mark itself (`constructionMarkPath`).
 *
 * The official paths (`public/assets/tum_ai_logo_new.svg`, the ds BrandMark)
 * are not quite symmetric: the apex is the left stroke's cap, 2.3 units left
 * of the counter's axis, so a guide through one centre misses the other. The
 * construction sheet needs the mark to agree with its own guides, so the A
 * (left and middle strokes) is rebuilt here mirror-symmetric about the
 * midpoint of its two feet: the feet stay where the official mark has them
 * (the footer's continuation of the join mark still lines up), the middle
 * stroke moves under 0.3 units, and the left stroke pivots on its foot so its
 * top shifts 2.7 units right. The right stroke is the official path.
 * logomark-construction.test.ts checks that each circle is tangent to its
 * stroke edges and that the A is symmetric.
 */

type Point = { x: number; y: number };

/** A straight edge of a stroke, as two points on it. */
export type Edge = { from: Point; to: Point };

export type Circle = Point & { r: number };

/** A line segment to draw. */
export type Segment = { x1: number; y1: number; x2: number; y2: number };

/** Default distance the guides run past the mark, in viewBox units. */
const OVERSHOOT = 90;
const VIEWBOX = { width: 477, height: 406 };

/** Half the width of a stroke: the radius of its round caps. */
const STROKE_R = 39.4;

/** The A's axis of symmetry, midway between its two feet. */
export const AXIS_X = 176.57;

/** The apex cap's centre, its top on the mark's top edge (y 0). */
const apex = { x: AXIS_X, y: STROKE_R };

/** The feet's cap centres, from the official mark, on the baseline 405.9. */
const feet = {
  left: { x: 39.71, y: 366.5 },
  middle: { x: 2 * AXIS_X - 39.71, y: 366.5 },
};

/** The counter's radius, from the official mark. */
const COUNTER_R = 31.91;

/** The official right stroke, unchanged (its own subpath of the mark). */
const RIGHT_STROKE_PATH =
  "M476.36 365.87c0 3.49-.45 6.88-1.29 10.11-.9 3.45-2.25 6.72-3.99 9.74l-.01.02c-6.32 10.97-17.7 18.65-30.95 19.84-.6.06-1.2.1-1.81.13h-3.64c-.61-.03-1.21-.07-1.81-.13-13.06-1.18-24.3-8.65-30.67-19.36l-4.3-10.31L266.92 61.79l-5.71-13.68c-.56-2.66-.85-5.41-.85-8.24 0-4.28.68-8.41 1.93-12.28.63-1.95 1.4-3.83 2.32-5.64C271.17 8.93 284.66 0 300.23 0c13.49 0 25.41 6.7 32.63 16.96l6.61 15.8 129.85 310.48 6.35 15.19c.45 2.41.69 4.9.69 7.44Z";

const add = (p: Point, q: Point, k = 1): Point => ({
  x: p.x + k * q.x,
  y: p.y + k * q.y,
});

/**
 * A stroke running from the apex to a foot: its unit direction and the unit
 * normals to its outer side (away from the axis) and inner side.
 */
function stroke(foot: Point) {
  const dx = foot.x - apex.x;
  const dy = foot.y - apex.y;
  const length = Math.hypot(dx, dy);
  const along = { x: dx / length, y: dy / length };
  // The normal pointing away from the axis, i.e. towards the foot's side.
  const side = Math.sign(dx);
  const outer = { x: side * along.y, y: -side * along.x };
  const inner = { x: -outer.x, y: -outer.y };
  return { foot, along, outer, inner };
}

const left = stroke(feet.left);
const middle = stroke(feet.middle);

/** An edge of a stroke, offset from its centre line along `normal`. */
function edge(normal: Point, foot: Point): Edge {
  return {
    from: add(apex, normal, STROKE_R),
    to: add(foot, normal, STROKE_R),
  };
}

/**
 * The counter (the opening under the apex), on the axis and tangent to both
 * inner edges. The inner edges meet on the axis STROKE_R / sin φ below the
 * apex centre (φ the strokes' angle off vertical); the circle sits
 * COUNTER_R / sin φ further down.
 */
const sinPhi = Math.abs(left.along.x);
export const counterCircle: Circle = {
  x: AXIS_X,
  y: apex.y + (STROKE_R + COUNTER_R) / sinPhi,
  r: COUNTER_R,
};

/** The straight edges of the three strokes. */
export const strokeEdges = {
  left: {
    outer: edge(left.outer, left.foot),
    inner: edge(left.inner, left.foot),
  },
  middle: {
    outer: edge(middle.outer, middle.foot),
    inner: edge(middle.inner, middle.foot),
  },
  right: {
    outer: { from: { x: 339.47, y: 32.76 }, to: { x: 469.32, y: 343.24 } },
    inner: { from: { x: 266.92, y: 61.79 }, to: { x: 397.89, y: 375.91 } },
  },
} satisfies Record<string, { outer: Edge; inner: Edge }>;

/**
 * The round caps: each circle is tangent to both edges of its stroke and to
 * the mark's top or baseline. The apex is the left and middle strokes' shared
 * top cap.
 */
export const capCircles = {
  apex: { ...apex, r: STROKE_R },
  leftBottom: { ...feet.left, r: STROKE_R },
  middleBottom: { ...feet.middle, r: STROKE_R },
  rightTop: { x: 299.77, y: 39.06, r: 39.06 },
  rightBottom: { x: 436.49, y: 366.45, r: 39.26 },
} satisfies Record<string, Circle>;

const fmt = (p: Point) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

/**
 * The mark's outline as one path (separate pieces meeting edge to edge leave
 * an antialiased seam): the A clockwise from the apex (the apex arc, down the
 * middle stroke's outer edge, round its foot, up its inner edge, over the
 * counter, down the left stroke's inner edge, round its foot, up its outer
 * edge), then the right stroke.
 */
function markPath(): string {
  const r = STROKE_R;
  const arc = (to: Point, sweep: 0 | 1, radius = r) =>
    `A${radius} ${radius} 0 0 ${sweep} ${fmt(to)}`;
  const tangent = (normal: Point) => add(counterCircle, normal, -COUNTER_R);
  const a = [
    `M${fmt(add(apex, left.outer, r))}`,
    arc(add(apex, middle.outer, r), 1),
    `L${fmt(add(middle.foot, middle.outer, r))}`,
    arc(add(middle.foot, middle.along, r), 1),
    arc(add(middle.foot, middle.inner, r), 1),
    `L${fmt(tangent(middle.inner))}`,
    arc(tangent(left.inner), 0, COUNTER_R),
    `L${fmt(add(left.foot, left.inner, r))}`,
    arc(add(left.foot, left.along, r), 1),
    arc(add(left.foot, left.outer, r), 1),
    "Z",
  ].join("");
  return `${a}${RIGHT_STROKE_PATH}`;
}

/** The symmetric mark the construction sheet is drawn on. */
export const constructionMarkPath = markPath();

/** The mark as a CSS mask image (the hero's photo aperture). */
export const constructionMarkMask = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}"><path d="${constructionMarkPath}"/></svg>`,
)}")`;

/** Top of the caps, their centre lines, and the baseline. */
const horizontals = [0, STROKE_R, feet.left.y, feet.left.y + STROKE_R] as const;

/** The x of an edge's line at height y. */
export function edgeX(edge: Edge, y: number): number {
  const { from, to } = edge;
  return from.x + ((y - from.y) * (to.x - from.x)) / (to.y - from.y);
}

/** Every stroke edge, extended `overshoot` past the mark top and bottom. */
export function edgeGuides(overshoot = OVERSHOOT): Segment[] {
  const top = -overshoot;
  const bottom = VIEWBOX.height + overshoot;
  return Object.values(strokeEdges).flatMap((stroke) =>
    [stroke.outer, stroke.inner].map((edge) => ({
      x1: edgeX(edge, top),
      y1: top,
      x2: edgeX(edge, bottom),
      y2: bottom,
    })),
  );
}

/** Horizontal guides across the mark, `overshoot` past it on both sides. */
export function horizontalGuides(overshoot = OVERSHOOT): Segment[] {
  return horizontals.map((y) => ({
    x1: -overshoot,
    y1: y,
    x2: VIEWBOX.width + overshoot,
    y2: y,
  }));
}

/**
 * Vertical guides through the circle centres, `overshoot` past the mark; the
 * apex and the counter share the axis, so it is drawn once.
 */
export function verticalGuides(overshoot = OVERSHOOT): Segment[] {
  const xs = new Set(constructionCircles().map(({ x }) => x));
  return [...xs].map((x) => ({
    x1: x,
    y1: -overshoot,
    x2: x,
    y2: VIEWBOX.height + overshoot,
  }));
}

/** Every construction circle: the caps and the counter. */
export function constructionCircles(): Circle[] {
  return [...Object.values(capCircles), counterCircle];
}
