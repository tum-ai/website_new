import type { ValidationContext } from "sanity";
import { describe, expect, test } from "vitest";
import { evaluateMockQuery } from "@/lib/cms-content-mock";
import { cohortProblem, validateListedVenture } from "./venture-trace";

test("the cohort must be the founder's testimonial context", () => {
  expect(cohortProblem("E-Lab 1.0", "E-Lab 1.0")).toBe(true);
  expect(cohortProblem(" E-Lab 1.0", "E-Lab 1.0 ")).toBe(true);
  expect(cohortProblem("E-Lab 2.0", "E-Lab 1.0")).toBe(
    "The founder's testimonial names “E-Lab 1.0”. Use the same cohort here, or change the testimonial's context first.",
  );
  expect(cohortProblem("E-Lab 2.0", null)).toMatch(/names no cohort/);
  expect(cohortProblem(undefined, "E-Lab 1.0")).toBe(true);
});

describe("the traced venture", () => {
  const list = (ids: string[], id = "logolist-e-lab-ventures") => ({
    _id: id,
    _type: "logoList",
    organizations: ids.map((ref) => ({ _type: "reference", _ref: ref })),
  });
  const check = (ref: string, documents: Record<string, unknown>[]) =>
    validateListedVenture({ _type: "reference", _ref: ref }, {
      getClient: () => ({
        fetch: (query: string, params: Record<string, unknown> = {}) =>
          evaluateMockQuery(query, params, documents as never),
      }),
    } as unknown as ValidationContext);

  test("must be in the published E-Lab ventures list", async () => {
    await expect(
      check("organization-spherecast", [list(["organization-spherecast"])]),
    ).resolves.toBe(true);
    await expect(
      check("organization-accel", [
        list(["organization-spherecast"]),
        list(["organization-accel"], "drafts.logolist-e-lab-ventures"),
      ]),
    ).resolves.toMatch(/Add this organisation to the E-Lab ventures/);
  });

  test("is not checked while no list is published (the code list shows)", async () => {
    await expect(check("organization-accel", [])).resolves.toBe(true);
  });
});
