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

test("the dots form a round field, evenly spaced", () => {
  for (const dot of allDots) {
    expect(Math.hypot(dot.x, dot.y)).toBeLessThanOrEqual(field.radius);
  }
  // A disc of that radius holds about as many lattice points as dots.
  const cellArea = Math.sqrt(3) / 2;
  const expected = (Math.PI * field.radius ** 2) / cellArea;
  expect(allDots.length).toBeGreaterThan(expected * 0.85);
  expect(allDots.length).toBeLessThan(expected * 1.15);
  // Nearest neighbours sit exactly one pitch apart.
  const first = allDots[0];
  if (!first) throw new Error("empty field");
  const nearest = Math.min(
    ...allDots
      .filter((dot) => dot !== first)
      .map((dot) => Math.hypot(dot.x - first.x, dot.y - first.y)),
  );
  expect(nearest).toBeCloseTo(1, 6);
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
