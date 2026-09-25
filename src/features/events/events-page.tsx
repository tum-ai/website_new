"use client";

import { ArrowDown, CalendarSearch, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button,
  Container,
  EmptyState,
  PageHero,
  Section,
  SectionHeader,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import type { Event } from "@/lib/types";
import type { EventFilters } from "./events";
import { filterEvents } from "./events";
import {
  DEFAULT_EVENT_FILTERS,
  EventFiltersComponent,
  eventCategories,
  eventCities,
} from "./events-filters";
import { PastEvents } from "./past-events";
import { UpcomingEvents } from "./upcoming-events";

export function EventsPage({
  initialEvents = [],
}: {
  initialEvents?: Event[];
}) {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);

  const filteredEvents = useMemo(
    () => filterEvents(initialEvents, filters),
    [filters, initialEvents],
  );

  // Faceted counts: each option counts matches under the other filter.
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        eventCategories.map((category) => [
          category,
          filterEvents(initialEvents, { ...filters, category }).length,
        ]),
      ),
    [filters, initialEvents],
  );
  const cityCounts = useMemo(
    () =>
      Object.fromEntries(
        eventCities.map((city) => [
          city,
          filterEvents(initialEvents, { ...filters, city }).length,
        ]),
      ),
    [filters, initialEvents],
  );

  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) >= currentDate,
  );
  // `filter` returns a new array, so sorting it leaves the props untouched.
  const pastEvents = filteredEvents
    .filter((event) => new Date(event.event_date) < currentDate)
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );

  const clearFromEmptyState = () => {
    setFilters(DEFAULT_EVENT_FILTERS);
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          '[aria-labelledby="event-filters-title"] [aria-pressed="true"]',
        )
        ?.focus();
    });
  };

  return (
    <main>
      <PageHero
        title="Events"
        lead="Explore TUM.ai's upcoming events including workshops, hackathons, and meetups. Join us to learn, network, and innovate in the field of artificial intelligence."
        media={
          <EventTotals
            upcoming={upcomingEvents.length}
            past={pastEvents.length}
          />
        }
      >
        <EventFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          eventCount={filteredEvents.length}
          categoryCounts={categoryCounts}
          cityCounts={cityCounts}
        />
      </PageHero>

      {filteredEvents.length === 0 ? (
        <Section tone="paper" spacing="md">
          <Container size="narrow">
            <EmptyState
              icon={CalendarSearch}
              title="No events found matching your filters."
              action={
                <Button variant="outline" onClick={clearFromEmptyState}>
                  <X aria-hidden className="size-4" />
                  Clear
                </Button>
              }
            >
              Try adjusting your search criteria.
            </EmptyState>
          </Container>
        </Section>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <Section
          tone="paper"
          id="upcoming-events"
          aria-labelledby="upcoming-events-title"
          className="scroll-mt-(--header-height)"
        >
          <Container>
            <SectionHeader
              id="upcoming-events-title"
              eyebrow="Calendar"
              index={1}
              layout="stack"
              title={
                <>
                  Upcoming Events <SectionCount value={upcomingEvents.length} />
                </>
              }
            />
            <UpcomingEvents events={upcomingEvents} />
          </Container>
        </Section>
      ) : null}

      {pastEvents.length > 0 ? (
        <Section
          tone="mist"
          id="past-events"
          aria-labelledby="past-events-title"
          className="scroll-mt-(--header-height)"
        >
          <Container>
            <SectionHeader
              id="past-events-title"
              eyebrow="Archive"
              index={upcomingEvents.length > 0 ? 2 : 1}
              layout="stack"
              title={
                <>
                  Past Events <SectionCount value={pastEvents.length} />
                </>
              }
            />
            <PastEvents events={pastEvents} />
          </Container>
        </Section>
      ) : null}
    </main>
  );
}

/** "(4)" set small and raised after a section title. */
function SectionCount({ value }: { value: number }) {
  return (
    <span className="tabular relative -top-[0.9em] ml-1 text-[0.42em] font-semibold tracking-[-0.01em] text-highlight">
      ({value})
    </span>
  );
}

/**
 * Hero figures for the current filter result. Each links to its section when
 * that section is on the page.
 */
function EventTotals({ upcoming, past }: { upcoming: number; past: number }) {
  const items = [
    {
      label: "Upcoming Events",
      value: upcoming,
      href: "#upcoming-events",
      live: true,
    },
    { label: "Past Events", value: past, href: "#past-events", live: false },
  ];

  return (
    <div className="grid grid-cols-2 border-t border-hairline-strong lg:ml-auto lg:max-w-md">
      {items.map((item, index) => {
        const content = (
          <>
            <span className="flex items-center gap-2 text-small font-medium text-fg-muted">
              {item.live && item.value > 0 ? (
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inset-0 rounded-full bg-violet-400 motion-safe:animate-pulse-ring" />
                  <span className="relative size-2 rounded-full bg-violet-400" />
                </span>
              ) : null}
              {item.label}
            </span>
            <span className="mt-auto flex items-end justify-between gap-3 pt-4">
              <span className="tabular text-[clamp(3.25rem,2.4rem+3vw,5.5rem)] leading-[0.9] font-medium tracking-[-0.05em] text-fg">
                {item.value}
              </span>
              {item.value > 0 ? (
                <ArrowDown
                  aria-hidden
                  className="mb-1.5 size-5 text-fg-subtle transition-[translate,color] duration-500 ease-brand group-hover/total:translate-y-1 group-hover/total:text-fg motion-reduce:transition-none"
                />
              ) : null}
            </span>
          </>
        );
        const className = cn(
          "group/total flex flex-col pt-5 pb-1",
          index === 0
            ? "border-r border-hairline pr-5 sm:pr-8"
            : "pl-5 sm:pl-8",
        );
        return item.value > 0 ? (
          <a key={item.label} href={item.href} className={className}>
            {content}
          </a>
        ) : (
          <div key={item.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
