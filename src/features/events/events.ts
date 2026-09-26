import { format } from "date-fns";
import type { Event } from "@/lib/types";

/** The /events filter chips: one category and one city, or "All …". */
export interface EventFilters {
  category: string;
  city: string;
}

export function groupEventsByMonth(events: Event[]) {
  return events.reduce((groups: Record<string, Event[]>, event) => {
    const date = new Date(event.event_date);
    const month = format(date, "MMMM yyyy");

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(event);
    return groups;
  }, {});
}

export function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter((event) => {
    // Category filter
    if (
      filters.category !== "All Categories" &&
      event.category !== filters.category
    ) {
      return false;
    }

    // City filter
    if (filters.city !== "All Cities" && event.city !== filters.city) {
      return false;
    }

    return true;
  });
}
