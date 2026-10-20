import { expect, test } from "vitest";
import {
  eLabCopyFixture,
  eLabSelectionFixture,
} from "@/lib/cms-fixtures/programmes";
import { applicationField, heroGatesOf } from "./field";
import { buildStages, gatesOf } from "./selection";

const gates = gatesOf(
  buildStages(eLabCopyFixture.gates.stages, eLabSelectionFixture),
);

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

test("the hero lights every venture plus the invites, not the Final Pitch count", () => {
  const real = [500, 25, 6, 6, 6].map((teams) => ({ teams }));
  // 7 ventures + 4 invites: the later gates rise to 11 and the steps where
  // nothing would go out drop away.
  expect(heroGatesOf(real, 11).map((gate) => gate.teams)).toEqual([
    500, 25, 11,
  ]);
  const drawn = applicationField(heroGatesOf(real, 11));
  expect(drawn.groups.at(-1)?.dots).toHaveLength(11);
  // Larger real figures are kept; never more lit than applied.
  expect(
    heroGatesOf(
      [500, 30, 24, 16, 10].map((teams) => ({ teams })),
      11,
    ).map((gate) => gate.teams),
  ).toEqual([500, 30, 24, 16, 11]);
  expect(heroGatesOf([{ teams: 8 }, { teams: 2 }], 11)).toEqual([{ teams: 8 }]);
});
