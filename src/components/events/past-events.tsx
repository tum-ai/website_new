import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <PastEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function PastEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);

  return (
    <Card className="flex flex-col md:flex-row w-full overflow-hidden">
      <div className="relative w-full aspect-square md:w-[calc(33%-1rem)] md:max-w-[320px] group mb-3 md:mb-0 flex-shrink-0">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {event.images?.map((_, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="h-full p-1">
                  <div className="aspect-square w-full relative overflow-hidden rounded-lg">
                    <img
                      src={event.images ? event.images[index] : ""}
                      alt={`${event.title} Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out" />
        </Carousel>
      </div>

      <div className="flex flex-col justify-normal flex-1 min-w-0 p-4 md:pl-6">
        <CardHeader className="pb-0 px-0">
          <CardTitle className="text-purple-800 text-lg">
            {format(eventDate, "PPP")}
          </CardTitle>
          <CardTitle className="text-xl">
            {event.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground pb-2">
            {event.location ? `${event.location}` : ""}
            {event.city ? `, ${event.city}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <p className="text-sm">
            {event.description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
