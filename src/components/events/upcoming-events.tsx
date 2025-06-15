import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import type { Event } from "@/lib/types"
import { groupEventsByMonth } from "@/lib/utils"

export default function UpcomingEvents({ events }: { events: Event[] }) {
  const groupedEvents = groupEventsByMonth(events)

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
      </div>
    )
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
  )
}

function UpcomingEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date)

  return (
    <div className="flex gap-6 p-6 rounded-lg border border-gray-500 transition-colors min-h-[200px]">
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
          <span className="text-sm font-medium text-muted-foreground">{format(eventDate, "EEE")}</span>
          <span className="text-2xl font-bold">{format(eventDate, "d")}</span>
          <span className="text-sm font-medium text-muted-foreground">{format(eventDate, "MMM")}</span>
          <span className="text-sm font-medium text-purple-500 mt-1">{format(eventDate, "h:mm a")}</span>
        </div>
      </div>

      {/* Content - Takes up remaining space */}
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-xl font-semibold mb-2">{event.title}</h4>
        <p className="text-muted-foreground line-clamp-3 mb-4">{event.description}</p>
        {event.location && <div className="text-sm text-muted-foreground">📍 {event.location}</div>}
      </div>

      {/* Buttons - Vertically Centered and Full Height */}
      <div className="flex flex-col justify-center gap-4 min-w-[140px]">
        <Button variant="outline" className="h-12">
          More Details
        </Button>
        <Button className="h-12">
          Sign Up
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
