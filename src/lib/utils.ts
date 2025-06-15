import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import type { Event, EventFilters } from "./types"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupEventsByMonth(events: Event[]) {
  return events.reduce((groups: Record<string, Event[]>, event) => {
    const date = new Date(event.date)
    const month = format(date, "MMMM yyyy")

    if (!groups[month]) {
      groups[month] = []
    }

    groups[month].push(event)
    return groups
  }, {})
}

export function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter((event) => {
    // Category filter
    if (filters.category !== "All Categories" && event.category !== filters.category) {
      return false
    }

    // City filter
    if (filters.city !== "All Cities" && event.city !== filters.city) {
      return false
    }

    return true
  })
}

export const scrollToSection = () => {
  const element = document.getElementById("become-partner");
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
