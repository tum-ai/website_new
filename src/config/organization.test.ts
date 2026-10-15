import { expect, test } from "vitest";
import {
  acceptanceRateRoundedOf,
  admittedPerBatchOf,
  linkedinAudienceLabelOf,
} from "./organization";

test("the acceptance rate rounds to a whole percent for copy", () => {
  expect(acceptanceRateRoundedOf(2.3)).toBe(2);
  expect(acceptanceRateRoundedOf(2.5)).toBe(3);
  expect(acceptanceRateRoundedOf(0.4)).toBe(0);
});

test("the LinkedIn audience reads in whole thousands, rounded down", () => {
  expect(linkedinAudienceLabelOf(20000)).toBe("20k");
  expect(linkedinAudienceLabelOf(20999)).toBe("20k");
  expect(linkedinAudienceLabelOf(1000)).toBe("1k");
  expect(linkedinAudienceLabelOf(950)).toBe("950");
});

test("a round admits the accepted share of its applications, in whole people", () => {
  expect(
    admittedPerBatchOf({
      startedApplicationsPerBatch: 2100,
      acceptanceRate: 2.3,
    }),
  ).toBe(48);
  expect(
    admittedPerBatchOf({
      startedApplicationsPerBatch: 1000,
      acceptanceRate: 5,
    }),
  ).toBe(50);
});
