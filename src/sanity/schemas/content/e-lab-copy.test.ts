import { describe, expect, test } from "vitest";
import { eLabCopyType, phaseWeeksProblem, validateStages } from "./e-lab-copy";

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

describe("the phases against the program length", () => {
  const phases = (...durations: [number, string][]) => [
    gate("applications"),
    ...durations.map(([amount, unit]) => ({
      _type: "phaseStage",
      duration: { amount, unit },
    })),
    gate("finalPitch"),
  ];

  test("phases that fill the program pass, within a week", () => {
    expect(phaseWeeksProblem(phases([4, "weeks"], [10, "weeks"]), 14)).toBe(
      true,
    );
    expect(
      phaseWeeksProblem(phases([3, "days"], [4, "weeks"], [9, "weeks"]), 14),
    ).toBe(true);
  });

  test("a gap is reported with the phases' sum and the program length", () => {
    expect(
      phaseWeeksProblem(phases([3, "days"], [4, "weeks"], [6, "weeks"]), 14),
    ).toBe(
      "The phases add up to about 10.4 weeks (3 days + 4 weeks + 6 weeks), but the site settings give the program 14 weeks. The page states both: adjust a phase or the program length.",
    );
    expect(phaseWeeksProblem(phases([16, "weeks"]), 14)).toMatch(
      /add up to 16 weeks/,
    );
  });

  test("nothing to compare: no program length or no timed phase", () => {
    expect(phaseWeeksProblem(phases([4, "weeks"]), null)).toBe(true);
    expect(phaseWeeksProblem(all, 14)).toBe(true);
    expect(phaseWeeksProblem(undefined, 14)).toBe(true);
  });
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
