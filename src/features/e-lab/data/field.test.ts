import { expect, test } from "vitest";
import { applicationField } from "./field";
import { gates } from "./selection";

const field = applicationField(gates, 25);
const allDots = field.groups.flatMap((group) => group.dots);

test("one dot per application, each in its own cell of the grid", () => {
  expect(allDots).toHaveLength(gates[0]?.teams ?? 0);
  const cells = new Set(allDots.map((dot) => `${dot.column}:${dot.row}`));
  expect(cells.size).toBe(allDots.length);
  for (const dot of allDots) {
    expect(dot.column).toBeLessThan(field.columns);
    expect(dot.row).toBeLessThan(field.rows);
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
  expect(applicationField(gates, 25)).toStrictEqual(field);
});
