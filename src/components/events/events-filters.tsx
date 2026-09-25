"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRef } from "react";
import { Button, Card, ChipGroup } from "@/components/ds";
import type { EventFilters } from "@/lib/types";

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  category: "All Categories",
  city: "All Cities",
};

export const eventCategories = ["All Categories", "Hackathon", "Speaker"];

export const eventCities = ["All Cities", "Munich", "Online"];

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  eventCount: number;
  /** Optional per-option result counts, keyed by option value. */
  categoryCounts?: Record<string, number>;
  cityCounts?: Record<string, number>;
}

/**
 * Category and city filter chips with the live result count. Sits on a dark
 * band (the page hero), so it uses the glass card surface.
 */
export default function EventFiltersComponent({
  filters,
  onFiltersChange,
  eventCount,
  categoryCounts,
  cityCounts,
}: EventFiltersProps) {
  const chipsRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_EVENT_FILTERS);
    // The Clear button unmounts; keep keyboard focus inside the panel.
    requestAnimationFrame(() => {
      chipsRef.current
        ?.querySelector<HTMLElement>('[aria-pressed="true"]')
        ?.focus();
    });
  };

  const hasActiveFilters =
    filters.category !== DEFAULT_EVENT_FILTERS.category ||
    filters.city !== DEFAULT_EVENT_FILTERS.city;

  return (
    <Card
      as="section"
      variant="glass"
      padding="none"
      aria-labelledby="event-filters-title"
      className="rounded-4xl p-5 sm:p-6 md:p-8"
    >
      <div className="flex min-h-9 items-center justify-between gap-4 border-b border-hairline pb-5">
        <div className="flex items-center gap-3">
          <SlidersHorizontal
            aria-hidden
            className="size-4 shrink-0 text-highlight"
            strokeWidth={1.75}
          />
          <div className="flex items-baseline gap-3">
            <h2
              id="event-filters-title"
              className="text-heading-sm leading-6 text-fg"
            >
              Filters
            </h2>
            <p aria-live="polite" className="tabular text-meta text-fg-subtle">
              ({eventCount} {eventCount === 1 ? "event" : "events"})
            </p>
          </div>
        </div>
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X aria-hidden className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <div ref={chipsRef} className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10">
        <div>
          <p
            id="event-filter-category"
            className="text-eyebrow text-fg-subtle uppercase"
          >
            Category
          </p>
          <ChipGroup
            label="Category"
            labelledBy="event-filter-category"
            className="mt-3"
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
            options={eventCategories.map((category) => ({
              value: category,
              label: category,
              count: categoryCounts?.[category],
            }))}
          />
        </div>
        <div>
          <p
            id="event-filter-city"
            className="text-eyebrow text-fg-subtle uppercase"
          >
            City
          </p>
          <ChipGroup
            label="City"
            labelledBy="event-filter-city"
            className="mt-3"
            value={filters.city}
            onValueChange={(value) => handleFilterChange("city", value)}
            options={eventCities.map((city) => ({
              value: city,
              label: city,
              count: cityCounts?.[city],
            }))}
          />
        </div>
      </div>
    </Card>
  );
}
