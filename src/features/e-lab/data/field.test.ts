import { expect, test } from "vitest";
import { applicationField } from "./field";
import { gates } from "./selection";

const field = applicationField(gates);
const allDots = field.groups.flatMap((group) => group.dots);

test("one dot per application, no two in the same place", () => {
  expect(allDots).toHaveLength(gates[0]?.teams ?? 0);
  const places = new Set(
    allDots.map((dot) => `${dot.x.toFixed(3)}:${dot.y.toFixed(3)}`),
  );
  expect(places.size).toBe(allDots.length);
});

test("the dots are evenly spaced in an irregular outline, not a disc", () => {
  // Nearest neighbours sit exactly one pitch apart.
  const first = allDots[0];
  if (!first) throw new Error("empty field");
  const nearest = Math.min(
    ...allDots
      .filter((dot) => dot !== first)
      .map((dot) => Math.hypot(dot.x - first.x, dot.y - first.y)),
  );
  expect(nearest).toBeCloseTo(1, 6);

  // A disc of the same dots would end at this radius; the outline reaches
  // well past it in some directions.
  const discRadius = Math.sqrt((allDots.length * Math.sqrt(3)) / 2 / Math.PI);
  const farthest = Math.max(...allDots.map((dot) => Math.hypot(dot.x, dot.y)));
  expect(farthest).toBeGreaterThan(discRadius * 1.15);

  for (const dot of allDots) {
    expect(dot.x).toBeGreaterThanOrEqual(field.bounds.minX);
    expect(dot.x).toBeLessThanOrEqual(field.bounds.maxX);
    expect(dot.y).toBeGreaterThanOrEqual(field.bounds.minY);
    expect(dot.y).toBeLessThanOrEqual(field.bounds.maxY);
  }
});

test("the dots still lit after each gate are exactly that gate's teams", () => {
  for (const [index, gate] of gates.entries()) {
    const reached = field.groups
      .filter((group) => group.gateIndex >= index)
      .reduce((sum, group) => sum + group.dots.length, 0);
    expect(reached, gate.name).toBe(gate.teams);
  }
});

test("the field is the same on every render", () => {
  expect(applicationField(gates)).toStrictEqual(field);
});
