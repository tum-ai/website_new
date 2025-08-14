import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { groupEventsByMonth } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function UpcomingEvents({ events }: { events: Event[] }) {
  events.sort(
    (a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
  );
  const groupedEvents = groupEventsByMonth(events);

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No upcoming events at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {Object.entries(groupedEvents).map(([month, monthEvents]) => (
        <div key={month} className="space-y-8">
          <h3 className="text-2xl font-semibold text-purple-500">{month}</h3>
          <div className="space-y-8">
            {monthEvents.map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);

  return (
    <div className="flex gap-6 p-6 rounded-lg border border-gray-500 transition-colors">
      {/* Left Column - Date/Time and Category */}
      <div className="flex flex-col items-center min-w-[100px]">
        {/* Category Badge */}
        {event.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-500/20 rounded-full mb-3">
            {event.category}
          </span>
        )}

        {/* Date Module - Vertically Centered */}
        <div className="flex flex-col items-center justify-center min-w-[80px] bg-purple-500/20 rounded-md p-3">
          <span className="text-sm font-medium text-muted-foreground">
            {format(eventDate, "EEE")}
          </span>
          <span className="text-2xl font-bold">{format(eventDate, "d")}</span>
          <span className="text-sm font-medium text-muted-foreground">
            {format(eventDate, "MMM")}
          </span>
          <span className="text-sm font-medium text-purple-500 mt-1">
            {format(eventDate, "h:mm a")}
          </span>
        </div>
      </div>

      {/* Content - Takes up remaining space */}
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
        <p className="text-muted-foreground mb-4">{event.description}</p>
        {event.location && (
          <div className="text-sm text-muted-foreground">
            📍 {event.location}
          </div>
        )}
      </div>

      {/* Buttons - Vertically Centered and Full Height */}
      {(event.sign_up || event.detail) && (
        <div className="flex flex-col justify-center gap-4 min-w-[140px]">
          {event.detail && (
            <Button variant="outline" className="h-12">
              <Link to={event.detail || "#"}>More Details</Link>
            </Button>
          )}
          {event.sign_up && (
            <Button asChild className="h-12">
              <Link to={event.sign_up || "#"}>
                Sign Up
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
