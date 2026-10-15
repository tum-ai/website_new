import { expect, test } from "vitest";
import {
  eLabCopyFixture,
  eLabSelectionFixture,
} from "@/lib/cms-fixtures/programmes";
import { buildStages, gatesOf, scaleTicks } from "./selection";

const stages = buildStages(eLabCopyFixture.gates.stages, eLabSelectionFixture);
const gates = gatesOf(stages);
test("gates scale from the supplied facts", () => {
  expect(gates.map((gate) => gate.teams)).toEqual(
    Object.values(eLabSelectionFixture),
  );
  for (const gate of gates)
    expect(gate.share).toBe(gate.teams / eLabSelectionFixture.applications);
  expect(gates[0]?.share).toBe(1);
});
test("updated facts change the same structural drawing", () => {
  const changed = buildStages(eLabCopyFixture.gates.stages, {
    ...eLabSelectionFixture,
    finalPitch: 10,
  });
  expect(gatesOf(changed).at(-1)?.teams).toBe(10);
  expect(changed.find((stage) => stage.kind === "phase")).toEqual(
    stages.find((stage) => stage.kind === "phase"),
  );
});
test("tick positions are shares of the supplied maximum", () => {
  expect(scaleTicks(120, 40)).toEqual([
    { teams: 0, at: 0 },
    { teams: 40, at: 1 / 3 },
    { teams: 80, at: 2 / 3 },
    { teams: 120, at: 1 },
  ]);
});
