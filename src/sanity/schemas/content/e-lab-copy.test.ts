import { expect, test } from "vitest";
import { validateStages } from "./e-lab-copy";

const gate = (figure: string) => ({ _type: "gateStage", figure });
const phase = { _type: "phaseStage" };
const all = [
  gate("applications"),
  gate("admitted"),
  phase,
  gate("midterm"),
  gate("selectionDay"),
  gate("finalPitch"),
];

test("the stages hold every gate once, starting with the applications", () => {
  expect(validateStages(all)).toBe(true);
  expect(validateStages(undefined)).toBe(true);
  expect(validateStages([phase, ...all])).toMatch(/Start with the Team/);
  expect(validateStages([...all, gate("midterm")])).toMatch(/one gate only/);
});

test("a stage list without one of the gates is refused, as the page would ignore it", () => {
  expect(validateStages(all.filter((stage) => stage !== all[3]))).toBe(
    "Add a gate for Midterm Pitch: the page needs all five.",
  );
});
