import { useEffect, useState, useMemo } from "react";
import { mockEvents } from "@/lib/mock-data"
import EventsVerticalText from "@/components/events/events-vertical-text"
import EventFiltersComponent from "@/components/events/events-filters"
import UpcomingEvents from "@/components/events/upcoming-events"
import PastEvents from "@/components/events/past-events"
import { filterEvents } from "@/lib/utils"
import type { EventFilters } from "@/lib/types"


export default function Events() {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/getNotes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error(err));
  }, []);

  const [filters, setFilters] = useState<EventFilters>({
    category: "All Categories",
    city: "All Cities",
  })
  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return filterEvents(mockEvents, filters)
  }, [filters])

  // Split filtered events into upcoming and past
  const currentDate = new Date()
  const upcomingEvents = filteredEvents.filter((event) => new Date(event.date) >= currentDate)
  const pastEvents = filteredEvents
    .filter((event) => new Date(event.date) < currentDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())


  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white sm:py-16 lg:py-24">

      {/* <div>
        Upcoming Events
        {notes.map((note) => (
          <div key={note.id}>
            <h1>{note.properties.title.title[0]?.plain_text}</h1>
            <p>{note.properties.desc.rich_text[0]?.plain_text}</p>
            {note.properties["Files & media"].files.length > 0 &&
              note.properties["Files & media"].files[0].file?.url && (
                <img
                  src={note.properties["Files & media"].files[0].file.url}
                  alt="Event"
                  style={{ width: "300px", height: "auto", marginTop: "1rem" }}
                />
              )}
          </div>
        ))}
        <h2>End of the Events</h2>
      </div> */}

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Fixed Left Column - 1/4 width for "Events" text */}
        <div className="relative flex-1/4 h-screen z-10 top-0 flex">

            <EventsVerticalText />

        </div>

        {/* Right Column - 3/4 width for content with left margin */}
        <div className="flex-3/4 px-6 py-12 md:px-12">
          <h1 className="sr-only">TUM.ai Events</h1>

          {/* Filters */}
          <EventFiltersComponent filters={filters} onFiltersChange={setFilters} eventCount={filteredEvents.length} />

          {/* No Results Message */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No events found matching your filters.</p>
              <p className="text-muted-foreground text-sm mt-2">Try adjusting your search criteria.</p>
            </div>
          )}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <section className="mb-24">
              <h2 className="mb-8 text-3xl font-bold tracking-tight">Upcoming Events ({upcomingEvents.length})</h2>
              <UpcomingEvents events={upcomingEvents} />
            </section>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <section>
              <h2 className="mb-8 text-3xl font-bold tracking-tight">Past Events ({pastEvents.length})</h2>
              <PastEvents events={pastEvents} />
            </section>
          )}
        </div>
      </div>

    </section>
  );
}
