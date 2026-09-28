import { describe, expect, test } from "vitest";
import type { EventCategory, EventCity } from "@/lib/types";
import {
  ALL_CATEGORIES,
  ALL_CITIES,
  countFilterOptions,
  DEFAULT_EVENT_FILTERS,
  eventCategories,
  eventCities,
  hasActiveFilters,
  matchesFilters,
  toCategoryFilter,
  toCityFilter,
} from "./filters";

const events: { category?: EventCategory; city?: EventCity }[] = [
  { category: "Hackathon", city: "Munich" },
  { category: "Speaker", city: "Munich" },
  { category: "Speaker", city: "Online" },
  { category: "E-Lab" },
  {},
];

describe("filter options", () => {
  test("offer every category and city once", () => {
    expect(new Set(eventCategories).size).toBe(eventCategories.length);
    expect(new Set(eventCities).size).toBe(eventCities.length);
    expect(eventCategories).not.toContain(ALL_CATEGORIES);
    expect(eventCities).not.toContain(ALL_CITIES);
  });

  test("chip values parse back, and anything unknown means All", () => {
    for (const category of eventCategories) {
      expect(toCategoryFilter(category)).toBe(category);
    }
    for (const city of eventCities) {
      expect(toCityFilter(city)).toBe(city);
    }
    expect(toCategoryFilter("Workshop")).toBe(ALL_CATEGORIES);
    expect(toCityFilter("Berlin")).toBe(ALL_CITIES);
  });
});

describe("matchesFilters", () => {
  test("the defaults match every event, including ones without a category or city", () => {
    expect(
      events.every((event) => matchesFilters(event, DEFAULT_EVENT_FILTERS)),
    ).toBe(true);
    expect(hasActiveFilters(DEFAULT_EVENT_FILTERS)).toBe(false);
  });

  test("category and city combine", () => {
    const filters = { category: "Speaker", city: "Online" } as const;
    expect(events.filter((event) => matchesFilters(event, filters))).toEqual([
      { category: "Speaker", city: "Online" },
    ]);
    expect(hasActiveFilters(filters)).toBe(true);
  });
});

describe("countFilterOptions", () => {
  test("counts each chip under the other filter (faceted)", () => {
    const counts = countFilterOptions(events, {
      category: ALL_CATEGORIES,
      city: "Munich",
    });
    expect(counts.category).toEqual({
      [ALL_CATEGORIES]: 2,
      Hackathon: 1,
      Speaker: 1,
      Event: 0,
      "E-Lab": 0,
    });
    // City chips ignore the city selection and apply the category one.
    expect(counts.city).toEqual({ [ALL_CITIES]: 5, Munich: 2, Online: 1 });
  });

  test("has a count for every chip", () => {
    const counts = countFilterOptions(events, DEFAULT_EVENT_FILTERS);
    expect(Object.keys(counts.category)).toEqual([
      ALL_CATEGORIES,
      ...eventCategories,
    ]);
    expect(Object.keys(counts.city)).toEqual([ALL_CITIES, ...eventCities]);
  });
});
