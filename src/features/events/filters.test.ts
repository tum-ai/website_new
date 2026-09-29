import { describe, expect, test } from "vitest";
import {
  ALL_EVENTS,
  categoryLabel,
  countFilterOptions,
  eventCategories,
  filterLabel,
  filterValues,
  matchesFilter,
  toFilter,
} from "./filters";

describe("filter options", () => {
  test("offer All, then every schema category once", () => {
    expect(filterValues[0]).toBe(ALL_EVENTS);
    expect(new Set(filterValues).size).toBe(filterValues.length);
    expect(filterValues.slice(1)).toEqual(eventCategories);
  });

  test("name one event in the singular and a chip in the plural", () => {
    expect(categoryLabel("Speaker")).toBe("Talk");
    expect(filterLabel("Speaker")).toBe("Talks");
    expect(filterLabel(ALL_EVENTS)).toBe("All");
  });

  test("chip values parse back, and anything unknown means All", () => {
    for (const value of filterValues) expect(toFilter(value)).toBe(value);
    expect(toFilter("Workshop")).toBe(ALL_EVENTS);
  });
});

describe("matchesFilter", () => {
  test("All matches every event, including one without a category", () => {
    expect(matchesFilter({}, ALL_EVENTS)).toBe(true);
    expect(matchesFilter({ category: "E-Lab" }, ALL_EVENTS)).toBe(true);
  });

  test("a category matches only its events", () => {
    expect(matchesFilter({ category: "Hackathon" }, "Hackathon")).toBe(true);
    expect(matchesFilter({ category: "Speaker" }, "Hackathon")).toBe(false);
    expect(matchesFilter({}, "Hackathon")).toBe(false);
  });
});

test("countFilterOptions counts every chip", () => {
  expect(
    countFilterOptions([
      { category: "Hackathon" },
      { category: "Hackathon" },
      { category: "Speaker" },
      {},
    ]),
  ).toEqual({ All: 4, Hackathon: 2, Speaker: 1, "E-Lab": 0, Event: 0 });
});
