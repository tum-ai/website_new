import { describe, expect, test } from "vitest";
import {
  AXIS_X,
  type Circle,
  capCircles,
  constructionCircles,
  constructionMarkPath,
  counterCircle,
  type Edge,
  edgeGuides,
  edgeX,
  strokeEdges,
  verticalGuides,
} from "./logomark-construction";

/** Perpendicular distance from a circle's centre to an edge's line. */
function distanceToEdge(circle: Circle, edge: Edge): number {
  const dx = edge.to.x - edge.from.x;
  const dy = edge.to.y - edge.from.y;
  const length = Math.hypot(dx, dy);
  return (
    Math.abs(dy * (circle.x - edge.from.x) - dx * (circle.y - edge.from.y)) /
    length
  );
}

/** Tangent within a tenth of a viewBox unit (under 0.2px at hero size). */
const TOLERANCE = 0.1;

describe("logomark construction", () => {
  test.each([
    ["apex (left)", capCircles.apex, strokeEdges.left],
    ["apex (middle)", capCircles.apex, strokeEdges.middle],
    ["leftBottom", capCircles.leftBottom, strokeEdges.left],
    ["middleBottom", capCircles.middleBottom, strokeEdges.middle],
    ["rightTop", capCircles.rightTop, strokeEdges.right],
    ["rightBottom", capCircles.rightBottom, strokeEdges.right],
  ])(
    "the %s cap circle is tangent to both edges of its stroke",
    (_, circle, stroke) => {
      expect(
        Math.abs(distanceToEdge(circle, stroke.outer) - circle.r),
      ).toBeLessThan(TOLERANCE);
      expect(
        Math.abs(distanceToEdge(circle, stroke.inner) - circle.r),
      ).toBeLessThan(TOLERANCE);
    },
  );

  test("cap circles touch the mark's top and baseline", () => {
    expect(capCircles.apex.y - capCircles.apex.r).toBeCloseTo(0, 1);
    expect(capCircles.rightTop.y - capCircles.rightTop.r).toBeCloseTo(0, 1);
    // The official baseline (y 405.94 and 405.71).
    expect(capCircles.leftBottom.y + capCircles.leftBottom.r).toBeCloseTo(
      405.9,
      1,
    );
    expect(capCircles.rightBottom.y + capCircles.rightBottom.r).toBeCloseTo(
      405.71,
      1,
    );
  });

  test("the counter circle fits the opening under the apex", () => {
    expect(
      Math.abs(
        distanceToEdge(counterCircle, strokeEdges.left.inner) - counterCircle.r,
      ),
    ).toBeLessThan(TOLERANCE);
    expect(
      Math.abs(
        distanceToEdge(counterCircle, strokeEdges.middle.inner) -
          counterCircle.r,
      ),
    ).toBeLessThan(TOLERANCE);
  });

  test("the A is mirror-symmetric about its axis", () => {
    for (const y of [0, 200, 406]) {
      expect(
        edgeX(strokeEdges.left.outer, y) + edgeX(strokeEdges.middle.outer, y),
      ).toBeCloseTo(2 * AXIS_X, 6);
      expect(
        edgeX(strokeEdges.left.inner, y) + edgeX(strokeEdges.middle.inner, y),
      ).toBeCloseTo(2 * AXIS_X, 6);
    }
    expect(capCircles.apex.x).toBe(AXIS_X);
    expect(counterCircle.x).toBe(AXIS_X);
  });

  test("the A stays within 0.3 units of the official mark at its feet", () => {
    // Official edge points near the feet (tum_ai_logo_new.svg).
    expect(edgeX(strokeEdges.left.outer, 348.31)).toBeCloseTo(4.25, 0);
    expect(
      Math.abs(edgeX(strokeEdges.middle.outer, 343.47) - 346.26),
    ).toBeLessThan(0.3);
    expect(
      Math.abs(edgeX(strokeEdges.middle.outer, 36.49) - 217.87),
    ).toBeLessThan(0.3);
  });

  test("edge guides run along the stroke edges", () => {
    const guides = edgeGuides();
    expect(guides).toHaveLength(6);
    const outer = strokeEdges.left.outer;
    const guide = guides[0];
    expect(guide?.x1).toBeCloseTo(edgeX(outer, guide?.y1 ?? 0), 6);
    expect(edgeX(outer, outer.from.y)).toBeCloseTo(outer.from.x, 6);
  });

  test("the apex and the counter share one vertical guide", () => {
    const xs = verticalGuides().map((guide) => guide.x1);
    expect(xs.filter((x) => x === AXIS_X)).toHaveLength(1);
    expect(xs).toHaveLength(constructionCircles().length - 1);
  });

  test("the mark path is the A followed by the official right stroke", () => {
    expect(constructionMarkPath).toMatch(/^M[\d. ]+A/);
    expect(constructionMarkPath).toContain("ZM476.36 365.87");
    expect(constructionMarkPath).not.toMatch(/NaN/);
  });
});
