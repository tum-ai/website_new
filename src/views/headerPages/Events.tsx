"use client";

import Layout from "@/components/Layout";
import EventFiltersComponent from "@/components/events/events-filters";
import PastEvents from "@/components/events/past-events";
import UpcomingEvents from "@/components/events/upcoming-events";
import type { Event, EventFilters } from "@/lib/types";
import { filterEvents } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function Events({
  initialEvents = [],
}: {
  initialEvents?: Event[];
}) {
  const [filters, setFilters] = useState<EventFilters>({
    category: "All Categories",
    city: "All Cities",
  });

  const filteredEvents = useMemo(
    () => filterEvents(initialEvents, filters),
    [filters, initialEvents],
  );

  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) >= currentDate,
  );
  const pastEvents = filteredEvents
    .filter((event) => new Date(event.event_date) < currentDate)
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-black to-[#291a39] p-8 text-white sm:py-16 lg:py-24">
      <Layout>
        <div
          className={`min-h-screen flex flex-col ${filteredEvents.length === 0 ? "w-full" : "md:flex-row justify-center"}`}
        >
          <div
            className={`px-6 py-12 md:px-12 ${filteredEvents.length === 0 ? "w-full" : ""}`}
          >
            <EventFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              eventCount={filteredEvents.length}
            />

            {filteredEvents.length === 0 && (
              <section className="mb-24">
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No events found matching your filters.
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try adjusting your search criteria.
                  </p>
                </div>
              </section>
            )}

            {upcomingEvents.length > 0 && (
              <section className="mb-24">
                <h1 className="text-title sm:text-2xl md:text-[2rem] mb-8 font-bold animate-item">
                  Upcoming Events ({upcomingEvents.length})
                </h1>
                <UpcomingEvents events={upcomingEvents} />
              </section>
            )}

            {pastEvents.length > 0 && (
              <section>
                <h1 className="text-title sm:text-2xl md:text-[2rem] mb-8 font-bold animate-item">
                  Past Events ({pastEvents.length})
                </h1>
                <PastEvents events={pastEvents} />
              </section>
            )}
          </div>
        </div>
      </Layout>
    </section>
  );
}
