import { expect, test } from "vitest";
import { eLabConfig } from "@/config/e-lab";
import { gates, scaleTicks, selectionStages } from "./selection";

test("each gate's bar is its teams as a share of all applications", () => {
  for (const gate of gates) {
    expect(gate.share).toBe(gate.teams / eLabConfig.selection.applications);
  }
  expect(gates[0]?.share).toBe(1);
});

test("the gates only ever narrow, and every figure comes from the config", () => {
  const figures = gates.map((gate) => gate.teams);
  expect(figures).toStrictEqual(Object.values(eLabConfig.selection));
  for (const [index, teams] of figures.entries()) {
    expect(teams).toBeGreaterThan(0);
    if (index > 0) expect(teams).toBeLessThanOrEqual(figures[index - 1] ?? 0);
  }
});

test("the program opens and closes on a gate, with phases between gates", () => {
  expect(selectionStages.at(0)?.kind).toBe("gate");
  expect(selectionStages.at(-1)?.kind).toBe("gate");
  expect(selectionStages.some((stage) => stage.kind === "phase")).toBe(true);
});

test("scale ticks run from 0 in even steps, placed along the scale", () => {
  expect(scaleTicks(500, 100)).toStrictEqual([
    { teams: 0, at: 0 },
    { teams: 100, at: 0.2 },
    { teams: 200, at: 0.4 },
    { teams: 300, at: 0.6 },
    { teams: 400, at: 0.8 },
    { teams: 500, at: 1 },
  ]);
  expect(scaleTicks(450, 100).at(-1)).toStrictEqual({
    teams: 400,
    at: 400 / 450,
  });
});
