import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Event } from "@/lib/types";
import { groupEventsByMonth } from "@/lib/utils";
import { format } from "date-fns";

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
    <div className="space-y-16 max-w-full">
      {Object.entries(groupedEvents).map(([month, monthEvents]) => (
        <div key={month} className="space-y-8">
          <h3 className="text-2xl font-semibold text-purple-500">{month}</h3>
          <div className="flex flex-wrap justify-center md:justify-start mx-[-0.75rem]">
            {monthEvents.map((event) => (
              <div key={event.id} className="flex-shrink-0 px-3 pb-6">
                <UpcomingEventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);
  // Local flag: some events may include a runtime-only `disabled` property not present in the global Event type
  const applicationsClosed = !(() => {
    try {
      new URL(event.sign_up!);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <Card className="hover:shadow-lg transition-shadow justify-between w-[320px] md:w-[360px]">
      <div className="p-4">
        <AspectRatio ratio={1 / 1}>
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              className="h-full w-full rounded-lg object-cover shadow-xl"
            />
          ) : (
            <div className="h-full w-full rounded-lg bg-accent-foreground flex items-center justify-center">
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
          )}
        </AspectRatio>
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
              : event.description}
          </p>
        </CardContent>
        <CardFooter className="px-0 pt-4">
          {event.sign_up && (
            <Button
              size={"xl"}
              variant="primary"
              className="text-white w-full"
              disabled={applicationsClosed}
              onClick={() => {
                if (!applicationsClosed) {
                  window.open(event.sign_up, "_blank");
                }
              }}
            >
              {applicationsClosed ? "Applications Closed" : "Apply Now!"}
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
