import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Event } from "@/lib/types";
import { format } from "date-fns";

export default function PastEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No past events to display.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {events.map((event) => (
        <PastEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function PastEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);

  return (
    <Card className="relative overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow bg-transparent">
      {event.category && (
        <span className="absolute top-3 left-3 z-10 inline-block px-2 py-1 text-xs font-medium bg-purple-500/20 rounded-full">
          {event.category}
        </span>
      )}
      <div className=" w-full">
        {/* Category Badge on top-left of image */}
        <img
          src={event.image || "../../../public/assets/home_img1.jpg"}
          alt={event.title}
          className="object-cover"
        />
      </div>
      <CardContent className="">
        <h4 className="text-xl font-semibold mb-3 line-clamp-2 text-white">
          {event.title}
        </h4>
        <p className="text-muted-foreground text-sm line-clamp-4 leading-relaxed">
          {event.description}
        </p>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground pt-0">
        {format(eventDate, "MMMM d, yyyy")}
      </CardFooter>
    </Card>
  );
}
