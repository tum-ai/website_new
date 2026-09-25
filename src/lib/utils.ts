import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { extendTailwindMerge } from "tailwind-merge";
import type { Event, EventFilters } from "./types";

/**
 * tailwind-merge only knows Tailwind's stock scales. Without registering the
 * design-system tokens from src/styles/index.css it would treat
 * `text-display-xl` as a color and drop it next to `text-fg`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-2xl",
        "display-xl",
        "display-lg",
        "display-md",
        "heading-lg",
        "heading-md",
        "heading-sm",
        "lead",
        "body",
        "small",
        "meta",
        "eyebrow",
        "title",
        "subtitle",
        "subtext",
      ],
      color: [
        "canvas",
        "raised",
        "sunken",
        "fg",
        "fg-muted",
        "fg-subtle",
        "hairline",
        "hairline-strong",
        "highlight",
        "glow",
      ],
      shadow: ["soft", "lift", "glow", "inset-hairline"],
      radius: ["4xl", "5xl"],
      ease: ["brand", "snappy", "in-out-soft"],
      animate: [
        "rise",
        "rise-sm",
        "fade",
        "aurora",
        "drift",
        "marquee",
        "marquee-reverse",
        "pulse-ring",
        "shimmer",
        "line",
      ],
    },
  },
});

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
