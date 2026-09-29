import { stegaEncode } from "@test/stega";
import { describe, expect, test } from "vitest";
import type { EventCategory } from "@/lib/types";
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

describe("in draft mode, with stega-encoded categories", () => {
  const draft = (category: EventCategory, id = "event-1") =>
    stegaEncode(category, id, "category") as EventCategory;

  test("an event still reads by its category's name", () => {
    expect(categoryLabel(draft("Hackathon"))).toBe("Hackathon");
    expect(categoryLabel(draft("Speaker"))).toBe("Talk");
  });

  test("the chips still match and count the events", () => {
    const events = [
      { category: draft("Hackathon", "event-1") },
      { category: draft("Hackathon", "event-2") },
      { category: draft("Speaker", "event-3") },
    ];
    expect(matchesFilter(events[0], "Hackathon")).toBe(true);
    expect(countFilterOptions(events)).toEqual({
      All: 3,
      Hackathon: 2,
      Speaker: 1,
      "E-Lab": 0,
      Event: 0,
    });
  });
});
