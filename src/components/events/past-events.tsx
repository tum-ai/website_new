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
            {event.images && event.images.length > 0 ? (
              event.images.map((image, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="h-full p-1">
                    <div className="aspect-square w-full relative overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${event.title} Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="h-full">
                <div className="h-full p-1">
                  <div className="aspect-square w-full relative overflow-hidden rounded-lg bg-accent-foreground flex items-center justify-center">
                    <img
                      src="/assets/logo_new_white_standard.png"
                      alt="Placeholder"
                      className="h-3/4 w-3/4 object-contain opacity-50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              </CarouselItem>
            )}
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
