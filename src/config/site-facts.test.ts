import { expect, test } from "vitest";
import {
  eLabApplicationCopy,
  eLabCompletedIterations,
  eLabProgramSummary,
} from "./e-lab";
import { publicationVenuesText } from "./impact";
import { officialMembers } from "./organization";
import { deriveSiteFacts, siteFactsFallback } from "./site-facts";

test("the derived facts of the code facts are the config's constants", () => {
  expect(deriveSiteFacts(siteFactsFallback)).toStrictEqual({
    officialMembers,
    publicationVenuesText,
    eLabProgramSummary,
    eLabCompletedIterations,
    eLabCohortName: eLabApplicationCopy.cohortName,
  });
});

test("derived facts follow edited base facts", () => {
  const derived = deriveSiteFacts({
    ...siteFactsFallback,
    organization: { ...siteFactsFallback.organization, alumni: 0 },
    impact: { ...siteFactsFallback.impact, publicationVenues: ["A", "B"] },
    eLab: {
      ...siteFactsFallback.eLab,
      currentIteration: "9.0",
      programWeeks: 3,
    },
  });
  expect(derived).toMatchObject({
    officialMembers: siteFactsFallback.organization.activeMembers,
    publicationVenuesText: "A and B",
    eLabProgramSummary: "3-week equity-free AI startup incubator",
    eLabCompletedIterations: 8,
    eLabCohortName: "E-Lab 9.0",
  });
});
