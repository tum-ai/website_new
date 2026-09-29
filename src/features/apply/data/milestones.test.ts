import { expect, test } from "vitest";
import { organizationFacts } from "@/config/organization";
import {
  milestoneKinds,
  milestones,
  milestonesIn,
  milestoneYears,
} from "./milestones";

test("the matrix spans every year from the founding, without gaps", () => {
  expect(milestoneYears[0]).toBe(organizationFacts.foundingYear);
  milestoneYears.forEach((year, index) => {
    expect(year).toBe(organizationFacts.foundingYear + index);
    expect(milestones.some((milestone) => milestone.year === year)).toBe(true);
  });
});

test("every milestone sits in exactly one cell, once", () => {
  const placed = milestoneKinds.flatMap((kind) =>
    milestoneYears.flatMap((year) => milestonesIn(kind.id, year)),
  );
  expect(placed).toHaveLength(milestones.length);
  expect(new Set(placed).size).toBe(milestones.length);
});

test("titles are unique within a year (they key the cells' lists)", () => {
  for (const year of milestoneYears) {
    const titles = milestones
      .filter((milestone) => milestone.year === year)
      .map((milestone) => milestone.title);
    expect(new Set(titles).size).toBe(titles.length);
  }
});
