/**
 * The TUM.ai logomark's construction geometry, traced from the official paths
 * (`public/assets/tum_ai_logo_new.svg`, the same paths as the ds BrandMark and
 * `public/assets/brand/logomark-mask.svg`), in their 477 x 406 viewBox. The
 * hero draws it as the brand guide's logo construction sheet around the
 * aperture, so every line and circle must sit exactly on the mark:
 * logomark-construction.test.ts checks that each circle is tangent to its
 * stroke edges.
 */

type Point = { x: number; y: number };

/** A straight edge of a stroke, as two points taken from the path. */
export type Edge = { from: Point; to: Point };

export type Circle = Point & { r: number };

/** A line segment to draw. */
export type Segment = { x1: number; y1: number; x2: number; y2: number };

/** Default distance the guides run past the mark, in viewBox units. */
const OVERSHOOT = 90;
const VIEWBOX = { width: 477, height: 406 };

/**
 * The straight edges of the three strokes, from the path's segment
 * endpoints. The two edges of a stroke are parallel (within 0.1°).
 */
export const strokeEdges = {
  left: {
    outer: { from: { x: 4.25, y: 348.31 }, to: { x: 132.85, y: 35.65 } },
    inner: { from: { x: 148.94, y: 204.51 }, to: { x: 78.45, y: 376.34 } },
  },
  middle: {
    outer: { from: { x: 217.87, y: 36.49 }, to: { x: 346.26, y: 343.47 } },
    inner: { from: { x: 209.11, y: 218.51 }, to: { x: 274.83, y: 376.14 } },
  },
  right: {
    outer: { from: { x: 339.47, y: 32.76 }, to: { x: 469.32, y: 343.24 } },
    inner: { from: { x: 266.92, y: 61.79 }, to: { x: 397.89, y: 375.91 } },
  },
} as const satisfies Record<string, { outer: Edge; inner: Edge }>;

/**
 * The round caps: each circle is tangent to both edges of its stroke and to
 * the path's extreme point at that end.
 */
export const capCircles = {
  leftTop: { x: 173.87, y: 39.69, r: 39.48 },
  leftBottom: { x: 39.71, y: 366.3, r: 39.64 },
  middleBottom: { x: 313.43, y: 366.68, r: 39.26 },
  rightTop: { x: 299.77, y: 39.06, r: 39.06 },
  rightBottom: { x: 436.49, y: 366.45, r: 39.26 },
} as const satisfies Record<string, Circle>;

/**
 * The counter (the opening under the apex): tangent to the left stroke's
 * inner edge and the middle stroke's inner edge, its top on the arch at
 * y 190.4.
 */
export const counterCircle = {
  x: 176.13,
  y: 222.31,
  r: 31.91,
} as const satisfies Circle;

/** Top of the caps, their centre lines, and the baseline. */
const horizontals = [0, 39.4, 366.5, 405.9] as const;

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
 * Vertical guides through every cap centre, `overshoot` past the mark. The
 * counter gets none: its centre sits 2.26 units right of the apex cap's, so
 * its guide would read as a doubled hairline beside the cap's centre mark.
 */
export function verticalGuides(overshoot = OVERSHOOT): Segment[] {
  return Object.values(capCircles).map(({ x }) => ({
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
