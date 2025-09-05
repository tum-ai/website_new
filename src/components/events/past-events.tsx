import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "../ui/button";

export default function PastEvents({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No past events to display.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap mx-[-0.75rem]">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex-shrink-0 px-3 pb-6"
        >

          <PastEventCard key={event.id} event={event} />
        </div>
      ))}
    </div>
  );
}

function PastEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);

  return (
    <Card className="flex flex-col w-full overflow-hidden w-[320px] md:w-[360px]">
      <div className="relative w-full aspect-square group p-4 flex-shrink-0">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {event.images && event.images.length > 0 ? (
              event.images.map((image, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="h-full">
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
                <div className="h-full">
                  <div className="aspect-square w-full relative overflow-hidden rounded-lg bg-accent-foreground flex items-center justify-center">
                    <img
                      src="/assets/logo_new_white_standard.png"
                      alt="Placeholder"
                      className="h-3/4 w-3/4 object-contain opacity-50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
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

      <div className="flex flex-col justify-normal flex-1 min-w-0 p-4 pt-0">
        <CardHeader className="pb-0 px-0">
          <CardTitle className="text-purple-800 text-lg">
            {format(eventDate, "PPP")}
          </CardTitle>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground pb-2">
            {event.location ? `${event.location}` : ""}
            {event.city ? `, ${event.city}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <p className="text-sm">
            {event.description.length > 300
              ? event.description.slice(0, 300) + "..."
              : event.description
            }
          </p>
        </CardContent>
        {event.description.length > 300 && (
          <CardFooter className="px-0 pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button size={"xl"}
                  variant="primary"
                  className="text-white w-full"
                >Read More</Button>
              </DialogTrigger>

              <DialogContent
                className="max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto"
                showCloseButton={false}
              >
                <DialogHeader>
                  <DialogTitle className="text-purple-800 text-lg">
                    {format(eventDate, "PPP")}
                  </DialogTitle>
                  <DialogTitle className="text-xl">{event.title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {event.location ? `${event.location}` : ""}
                    {event.city ? `, ${event.city}` : ""}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Detailed Description */}
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </CardFooter>
        )}
      </div>
    </Card>
  );
}
