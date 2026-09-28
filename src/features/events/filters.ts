import type { EventCategory, EventCity } from "@/lib/types";

/*
 * The chip options mirror the event schema's `options.list`, in the Studio's
 * order. `satisfies Record<…>` makes a category or city that the schema adds
 * or drops (after `pnpm sanity:typegen`) a type error here, so the filters
 * never drift from what editors can pick.
 */
const categories = {
  Hackathon: true,
  Speaker: true,
  Event: true,
  "E-Lab": true,
} satisfies Record<EventCategory, true>;

const cities = {
  Munich: true,
  Online: true,
} satisfies Record<EventCity, true>;

/** Every event category, in the Studio's order. */
export const eventCategories = Object.keys(categories) as EventCategory[];

/** Every event city, in the Studio's order. */
export const eventCities = Object.keys(cities) as EventCity[];

/** The category chip that matches every event. */
export const ALL_CATEGORIES = "All Categories";

/** The city chip that matches every event. */
export const ALL_CITIES = "All Cities";

/** The /events filter chips: one category and one city, or "All …". */
export type EventFilters = {
  category: EventCategory | typeof ALL_CATEGORIES;
  city: EventCity | typeof ALL_CITIES;
};

/** The category chips in order: "All Categories", then every category. */
export const categoryFilterValues: EventFilters["category"][] = [
  ALL_CATEGORIES,
  ...eventCategories,
];

/** The city chips in order: "All Cities", then every city. */
export const cityFilterValues: EventFilters["city"][] = [
  ALL_CITIES,
  ...eventCities,
];

/** No filter: every event matches. */
export const DEFAULT_EVENT_FILTERS: EventFilters = {
  category: ALL_CATEGORIES,
  city: ALL_CITIES,
};

/** The fields the filters read. */
export type FilterableEvent = { category?: EventCategory; city?: EventCity };

/** Whether an event passes both the category and the city filter. */
export function matchesFilters(
  event: FilterableEvent,
  filters: EventFilters,
): boolean {
  return (
    (filters.category === ALL_CATEGORIES ||
      event.category === filters.category) &&
    (filters.city === ALL_CITIES || event.city === filters.city)
  );
}

/** Whether any filter differs from "All …". */
export function hasActiveFilters(filters: EventFilters): boolean {
  return (
    filters.category !== DEFAULT_EVENT_FILTERS.category ||
    filters.city !== DEFAULT_EVENT_FILTERS.city
  );
}

/** A chip value as a category filter; unknown values select "All". */
export function toCategoryFilter(value: string): EventFilters["category"] {
  return (
    eventCategories.find((category) => category === value) ?? ALL_CATEGORIES
  );
}

/** A chip value as a city filter; unknown values select "All". */
export function toCityFilter(value: string): EventFilters["city"] {
  return eventCities.find((city) => city === value) ?? ALL_CITIES;
}

/** Per-chip result counts, keyed by chip value (including "All …"). */
export type FilterCounts = {
  category: Record<string, number>;
  city: Record<string, number>;
};

/**
 * Faceted counts: each category chip counts the events it would show under
 * the current city filter, and each city chip under the current category.
 */
export function countFilterOptions(
  events: readonly FilterableEvent[],
  filters: EventFilters,
): FilterCounts {
  const count = (next: EventFilters) =>
    events.filter((event) => matchesFilters(event, next)).length;
  return {
    category: Object.fromEntries(
      categoryFilterValues.map((category) => [
        category,
        count({ ...filters, category }),
      ]),
    ),
    city: Object.fromEntries(
      cityFilterValues.map((city) => [city, count({ ...filters, city })]),
    ),
  };
}
