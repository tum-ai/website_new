import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { Event, EventFilters } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export const scrollToSection = () => {
  const element = document.getElementById("become-partner");
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { routes } from "@/data/routes";
const SITE_NAME = "TUM.ai";

export function TitleManager({}) {
  const location = useLocation();

  useEffect(() => {
    const route = routes.find((r) => r.path === location.pathname);
    document.title = route?.title ? `${route.title} - ${SITE_NAME}` : SITE_NAME;
  }, [location.pathname]);

  return null;
}
