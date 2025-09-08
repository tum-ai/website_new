import EventFiltersComponent from "@/components/events/events-filters";
import PastEvents from "@/components/events/past-events";
import UpcomingEvents from "@/components/events/upcoming-events";
import type { Event, EventFilters } from "@/lib/types";
import { filterEvents } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/getNotes`
        ); // change this once deployed to /api/getNotes
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Could not load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const [filters, setFilters] = useState<EventFilters>({
    category: "All Categories",
    city: "All Cities",
  });
  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return filterEvents(events, filters);
  }, [events, filters]);

  // Split filtered events into upcoming and past
  const currentDate = new Date();
  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.event_date) >= currentDate
  );
  const pastEvents = filteredEvents
    .filter((event) => new Date(event.event_date) < currentDate)
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white sm:py-16 lg:py-24">
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="px-6 py-12 md:px-12">
          {/* Filters */}
          <EventFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            eventCount={filteredEvents.length}
          />

          {/* No Results Message */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No events found matching your filters.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your search criteria.
              </p>
            </div>
          )}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <section className="mb-24">
              <h2 className="mb-8 text-3xl font-bold tracking-tight">
                Upcoming Events ({upcomingEvents.length})
              </h2>
              <UpcomingEvents events={upcomingEvents} />
            </section>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="mb-8 text-3xl font-bold tracking-tight">
                Past Events ({pastEvents.length})
              </h2>
              <PastEvents events={pastEvents} />
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
