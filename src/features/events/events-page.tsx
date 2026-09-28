import type { ReactNode } from "react";
import { PageHero } from "@/components/ds";
import type { Event } from "@/lib/types";
import { type EventMonth, groupEventsByMonth, splitEvents } from "./events";
import {
  EventListings,
  type EventMonthEntries,
  EventsFilterProvider,
  EventTotals,
} from "./events-browser";
import { EventFiltersPanel } from "./events-filters";
import { PastEventCard } from "./past-events";
import { UpcomingEventCard } from "./upcoming-events";

/** Month groups with each event rendered by `renderCard`, for the island. */
function toEntries(
  months: EventMonth<Event>[],
  renderCard: (event: Event, index: number) => ReactNode,
): EventMonthEntries[] {
  let index = 0;
  return months.map(({ key, monthName, year, events }) => ({
    key,
    monthName,
    year,
    entries: events.map((event) => ({
      id: event.id,
      category: event.category,
      city: event.city,
      card: renderCard(event, index++),
    })),
  }));
}

/**
 * /events: the hero with the filters and totals, then the upcoming and the
 * past events. A server component: it splits the events at `now`, groups
 * them by Munich month and renders every card, so the client island
 * (`EventsFilterProvider`) only filters and never reads the clock.
 */
export function EventsPage({
  events,
  now,
}: {
  /** Every published event, in any order. */
  events: Event[];
  /** The instant that separates upcoming from past (the render time). */
  now: Date;
}) {
  const { upcoming, past } = splitEvents(events, now);

  return (
    <EventsFilterProvider
      upcoming={toEntries(groupEventsByMonth(upcoming), (event, index) => (
        <UpcomingEventCard event={event} seed={index} />
      ))}
      past={toEntries(groupEventsByMonth(past), (event, index) => (
        <PastEventCard event={event} seed={index} />
      ))}
    >
      <main>
        <PageHero
          title="Events"
          lead="Explore TUM.ai's upcoming events including workshops, hackathons, and meetups. Join us to learn, network, and innovate in the field of artificial intelligence."
          media={<EventTotals />}
        >
          <EventFiltersPanel />
        </PageHero>
        <EventListings />
      </main>
    </EventsFilterProvider>
  );
}
