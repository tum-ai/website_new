import { describe, expect, test } from "vitest";
import {
  type Circle,
  capCircles,
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
    ["leftTop", capCircles.leftTop, strokeEdges.left],
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
    // Top caps reach the path's highest points (y 0.21 and 0).
    expect(capCircles.leftTop.y - capCircles.leftTop.r).toBeCloseTo(0.21, 1);
    expect(capCircles.rightTop.y - capCircles.rightTop.r).toBeCloseTo(0, 1);
    // Bottom caps reach the baseline (y 405.94 and 405.71).
    expect(capCircles.leftBottom.y + capCircles.leftBottom.r).toBeCloseTo(
      405.94,
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
    // Its top is the arch of the path (y 190.4).
    expect(counterCircle.y - counterCircle.r).toBeCloseTo(190.4, 1);
  });

  test("edge guides run along the stroke edges", () => {
    const guides = edgeGuides();
    expect(guides).toHaveLength(6);
    const outer = strokeEdges.left.outer;
    const guide = guides[0];
    expect(guide?.x1).toBeCloseTo(edgeX(outer, guide?.y1 ?? 0), 6);
    expect(edgeX(outer, outer.from.y)).toBeCloseTo(outer.from.x, 6);
  });

  test("vertical guides run only through the cap centres", () => {
    // The counter's centre is 2.26 units off the apex cap's; a guide through
    // both would draw two hairlines side by side.
    expect(verticalGuides().map((guide) => guide.x1)).toEqual(
      Object.values(capCircles).map((circle) => circle.x),
    );
  });
});
