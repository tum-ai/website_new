import { expect, test } from "vitest";
import { eLabCopyType, validateStages } from "./e-lab-copy";

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

test("gates out of funnel order are refused: the field needs decreasing counts", () => {
  const swapped = [
    gate("applications"),
    gate("admitted"),
    phase,
    gate("finalPitch"),
    gate("selectionDay"),
    gate("midterm"),
  ];
  expect(validateStages(swapped)).toBe(
    "Put the gates in funnel order: Team applications, Admitted to the cohort, Midterm Pitch, Selection Day, Final Pitch.",
  );
  expect(
    validateStages([
      gate("applications"),
      gate("midterm"),
      gate("admitted"),
      gate("selectionDay"),
      gate("finalPitch"),
    ]),
  ).toMatch(/funnel order/);
});

test("voice selections reference the E-Lab testimonial collection", () => {
  const fields = ["founders", "investors"].map((name) =>
    expect.objectContaining({
      name,
      type: "array",
      of: [
        expect.objectContaining({
          type: "reference",
          to: [{ type: "person" }],
          options: { filter: 'placement == "e-lab-testimonial"' },
        }),
      ],
    }),
  );
  expect(eLabCopyType.fields).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "voices",
        fields: expect.arrayContaining(fields),
      }),
    ]),
  );
});
