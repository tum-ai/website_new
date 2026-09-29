import type { EventCategory } from "@/lib/types";

/*
 * The chips mirror the event schema's category `options.list`, in the
 * Studio's order, with the name of one event and the chip's plural. `satisfies
 * Record<…>` makes a category that the schema adds or drops (after `pnpm
 * sanity:typegen`) a type error here, so the filters never drift from what
 * editors can pick.
 */
const categoryNames = {
  Hackathon: { one: "Hackathon", many: "Hackathons" },
  Speaker: { one: "Talk", many: "Talks" },
  "E-Lab": { one: "E-Lab", many: "E-Lab" },
  Event: { one: "Event", many: "Other events" },
} satisfies Record<EventCategory, { one: string; many: string }>;

/** Every event category, in the Studio's order. */
export const eventCategories = Object.keys(categoryNames) as EventCategory[];

/** What one event of a category is called: "Hackathon", "Talk". */
export function categoryLabel(category: EventCategory): string {
  return categoryNames[category].one;
}

/** The chip that matches every event. */
export const ALL_EVENTS = "All";

/** The register's filter: one category, or every event. */
export type EventFilter = EventCategory | typeof ALL_EVENTS;

/** The chips in order: "All", then every category. */
export const filterValues: EventFilter[] = [ALL_EVENTS, ...eventCategories];

/** A chip's label. */
export function filterLabel(value: EventFilter): string {
  return value === ALL_EVENTS ? "All" : categoryNames[value].many;
}

/** The field the filter reads. */
export type FilterableEvent = { category?: EventCategory };

/** Whether an event passes the filter. */
export function matchesFilter(
  event: FilterableEvent,
  filter: EventFilter,
): boolean {
  return filter === ALL_EVENTS || event.category === filter;
}

/** A chip value as a filter; unknown values select "All". */
export function toFilter(value: string): EventFilter {
  return eventCategories.find((category) => category === value) ?? ALL_EVENTS;
}

/** The result count of every chip, keyed by its value. */
export function countFilterOptions(
  events: readonly FilterableEvent[],
): Record<EventFilter, number> {
  return Object.fromEntries(
    filterValues.map((value) => [
      value,
      events.filter((event) => matchesFilter(event, value)).length,
    ]),
  ) as Record<EventFilter, number>;
}
