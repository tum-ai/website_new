"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button, Card, ChipGroup } from "@/components/ds";
import { useEventsFilter } from "./events-browser";
import {
  categoryFilterValues,
  cityFilterValues,
  hasActiveFilters,
  toCategoryFilter,
  toCityFilter,
} from "./filters";

/**
 * Category and city filter chips with the live result count. Sits on a dark
 * band (the page hero), so it uses the glass card surface. Reads and sets
 * the state of the surrounding `EventsFilterProvider`.
 */
export function EventFiltersPanel() {
  const {
    filters,
    setFilters,
    clearFilters,
    chipsRef,
    counts,
    upcomingCount,
    pastCount,
  } = useEventsFilter();
  const eventCount = upcomingCount + pastCount;

  return (
    <Card
      as="section"
      variant="glass"
      padding="none"
      aria-labelledby="event-filters-title"
      className="rounded-4xl p-5 sm:p-6 md:p-8"
    >
      <div className="flex min-h-9 items-center justify-between gap-4 border-hairline border-b pb-5">
        <div className="flex items-center gap-3">
          <SlidersHorizontal
            aria-hidden
            className="size-4 shrink-0 text-highlight"
            strokeWidth={1.75}
          />
          <div className="flex items-baseline gap-3">
            <h2
              id="event-filters-title"
              className="text-fg text-heading-sm leading-6"
            >
              Filters
            </h2>
            <p aria-live="polite" className="tabular text-fg-subtle text-meta">
              ({eventCount} {eventCount === 1 ? "event" : "events"})
            </p>
          </div>
        </div>
        {hasActiveFilters(filters) ? (
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
            onValueChange={(value) =>
              setFilters({ ...filters, category: toCategoryFilter(value) })
            }
            options={categoryFilterValues.map((category) => ({
              value: category,
              label: category,
              count: counts.category[category],
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
            onValueChange={(value) =>
              setFilters({ ...filters, city: toCityFilter(value) })
            }
            options={cityFilterValues.map((city) => ({
              value: city,
              label: city,
              count: counts.city[city],
            }))}
          />
        </div>
      </div>
    </Card>
  );
}
