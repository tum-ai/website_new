"use client";

import { format } from "date-fns";
import { CalendarDays, MapPin } from "lucide-react";
import {
  Actions,
  EmptyState,
  Reveal,
  SpotlightCard,
  Tag,
} from "@/components/ds";
import type { Event } from "@/lib/types";
import { groupEventsByMonth } from "@/lib/utils";
import {
  EventDetailsDialog,
  formatEventLocation,
  hasLongDescription,
  SignUpAction,
  truncateDescription,
} from "./event-details";
import { EventImage } from "./event-media";

/**
 * Upcoming events, soonest first, grouped by month. On wide screens the
 * month label sticks beside its events while they scroll past.
 */
export function UpcomingEvents({ events }: { events: Event[] }) {
  // Sort a copy: `events` belongs to the parent.
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
  );
  const groupedEvents = groupEventsByMonth(sortedEvents);

  if (sortedEvents.length === 0) {
    return (
      <EmptyState title="No upcoming events at the moment. Check back soon!" />
    );
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {Object.entries(groupedEvents).map(([month, monthEvents]) => {
        const splitAt = month.lastIndexOf(" ");
        const monthName = month.slice(0, splitAt);
        const year = month.slice(splitAt + 1);
        return (
          <div
            key={month}
            className="grid gap-6 md:gap-8 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] xl:gap-12 2xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
          >
            <Reveal className="flex items-center gap-4 xl:sticky xl:top-[calc(var(--header-height)+2.5rem)] xl:block xl:self-start">
              <h3 className="flex shrink-0 items-baseline gap-2 text-heading-lg text-fg xl:block">
                <span className="xl:block xl:text-display-md">{monthName}</span>{" "}
                <span className="tabular text-fg-subtle xl:mt-2 xl:block xl:text-heading-md">
                  {year}
                </span>
              </h3>
              <span
                aria-hidden
                className="h-px flex-1 bg-hairline-strong xl:mt-6 xl:block xl:w-12 xl:flex-none"
              />
              <p className="shrink-0 text-meta text-fg-subtle xl:mt-4">
                {monthEvents.length}{" "}
                {monthEvents.length === 1 ? "event" : "events"}
              </p>
            </Reveal>
            <div className="space-y-6 md:space-y-8">
              {monthEvents.map((event, index) => (
                <Reveal key={event.id} delay={index * 80}>
                  <UpcomingEventCard event={event} />
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UpcomingEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);
  const location = formatEventLocation(event);
  const longDescription = hasLongDescription(event);
  const day = format(eventDate, "dd");
  const monthShort = format(eventDate, "MMM");

  return (
    <article>
      <SpotlightCard
        variant="raised"
        padding="none"
        className="group/event grid overflow-hidden rounded-4xl md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]"
      >
        {/*
         * The poster bleeds to the card edge; the card's own radius clips it,
         * so there are no rounded corners meeting straight dividers.
         */}
        <div className="relative aspect-[16/10] overflow-hidden bg-sunken md:aspect-auto md:min-h-72">
          <EventImage
            src={event.poster}
            alt={event.title}
            sizes="(min-width: 1024px) 19rem, (min-width: 768px) 15rem, 100vw"
            className="transition-transform duration-[1.4s] ease-brand group-hover/event:scale-[1.045] motion-reduce:transition-none"
          />
          {/* Date chip; the full date is in the meta list below. */}
          <div
            aria-hidden
            className="absolute top-4 left-4 flex min-w-16 flex-col items-center rounded-2xl bg-white/95 px-3 pt-2.5 pb-2 text-violet-950 shadow-soft backdrop-blur"
          >
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-violet-700 uppercase">
              {monthShort}
            </span>
            <span className="tabular mt-0.5 text-[2rem] leading-none font-semibold tracking-[-0.04em]">
              {day}
            </span>
            <span className="mt-1 text-[0.6875rem] font-medium text-ink-600">
              {format(eventDate, "EEE")}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col px-5 pt-5 pb-6 sm:px-6 md:px-8 md:py-8 lg:px-10 lg:py-9">
          {event.category ? (
            <Tag className="mb-4 self-start">{event.category}</Tag>
          ) : null}
          <h4 className="text-heading-lg text-fg">{event.title}</h4>
          <ul className="mt-4 space-y-1.5 text-small text-fg-muted">
            <li className="flex items-start gap-2.5">
              <CalendarDays
                aria-hidden
                className="mt-[0.2rem] size-4 shrink-0 text-highlight"
              />
              <time dateTime={event.event_date}>
                {format(eventDate, "PPP")}
              </time>
            </li>
            {location ? (
              <li className="flex items-start gap-2.5">
                <MapPin
                  aria-hidden
                  className="mt-[0.2rem] size-4 shrink-0 text-highlight"
                />
                {location}
              </li>
            ) : null}
          </ul>
          <p className="mt-5 text-small text-fg-muted md:text-body">
            {truncateDescription(event.description)}
          </p>
          {event.sign_up || longDescription ? (
            <Actions className="mt-auto pt-7">
              {event.sign_up ? <SignUpAction event={event} /> : null}
              {longDescription ? (
                <EventDetailsDialog
                  event={event}
                  image={
                    event.poster
                      ? { src: event.poster, alt: event.title }
                      : undefined
                  }
                  withSignUp
                />
              ) : null}
            </Actions>
          ) : null}
        </div>
      </SpotlightCard>
    </article>
  );
}
