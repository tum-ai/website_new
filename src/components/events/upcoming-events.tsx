import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
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
          <div className="flex flex-wrap mx-[-0.75rem]">
            {monthEvents.map((event) => (
              <div 
                key={event.id} 
                className="w-full px-3 pb-6 
                          lg:w-[calc(50%-1.5rem)] 
                          xl:w-[calc(33.333%-1.5rem)]"
              >
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <AspectRatio ratio={1 / 1}>
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-6">
              <h3 className="text-lg font-semibold text-purple-800 text-center leading-tight">
                {event.title}
              </h3>
            </div>
          )}
        </AspectRatio>
      </div>
      <CardHeader className="pb-0">
        <CardTitle className="text-purple-800 text-lg">
          {format(eventDate, "PPP")}
        </CardTitle>
        <CardTitle className="text-xl">
          {event.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {event.location ? `${event.location}` : ""}
          {event.city ? `, ${event.city}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <p className="text-sm">
          {event.description.length > 200
            ? event.description.slice(0, 200) + "..."
            : event.description}
        </p>
      </CardContent>
      <CardFooter className="pb-6">
        {event.sign_up && (
          <Button
            variant="primary"
            className="text-white w-full"
            disabled={!(() => {
              try {
                new URL(event.sign_up);
                return true;
              } catch {
                return false;
              }
            })()}
            onClick={() => {
              window.open(event.sign_up, '_blank');
            }}
          >
            Apply Now!
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
