import { expect, test } from "vitest";
import { settingsFixtureFacts as siteFactsFallback } from "@/lib/cms-fixtures/settings";
import { deriveSiteFacts } from "./site-facts";

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
