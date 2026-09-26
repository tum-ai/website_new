"use client";

import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { Carousel, EmptyState, Reveal, Tag } from "@/components/ds";
import type { Event } from "@/lib/types";
import {
  EventDetailsDialog,
  formatEventLocation,
  hasLongDescription,
  truncateDescription,
} from "./event-details";
import { EventImage } from "./event-media";
import { groupEventsByMonth } from "./events";

type EventPhoto = { src: string; alt: string };

const cardImageSizes =
  "(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw";

/** Photos first, then the poster; empty when there is neither. */
function getEventPhotos(event: Event): EventPhoto[] {
  if (event.images && event.images.length > 0) {
    return event.images.map((src, index) => ({
      src,
      alt: `${event.title} Image ${index + 1}`,
    }));
  }
  if (event.poster) {
    return [{ src: event.poster, alt: `${event.title} Poster` }];
  }
  return [];
}

/*
 * The DS Carousel has no overlay/compact controls or exposed API, so the
 * image variant is styled from here: the viewport fills the frame and the
 * progress line + arrows sit on a scrim at the bottom of the photo.
 */
const photoCarouselClasses = [
  "h-full [&>div:first-child]:h-full [&>div:first-child>div]:h-full",
  "[&>div:nth-child(2)]:absolute [&>div:nth-child(2)]:inset-x-4 [&>div:nth-child(2)]:bottom-4",
  "[&>div:nth-child(2)]:z-10 [&>div:nth-child(2)]:mt-0 [&>div:nth-child(2)]:gap-4",
  "[&_button]:size-10 [&_button]:border-white/45 [&_button]:bg-ink-950/35 [&_button]:backdrop-blur-sm",
].join(" ");

/**
 * The DS Carousel disables an arrow at either end, so a focused arrow that
 * reaches the end drops keyboard focus to <body>. This moves focus to the
 * arrow that is still enabled.
 */
function useArrowFocusRescue() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handleClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest("button");
      if (!button || document.activeElement !== button) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!button.disabled || node.contains(document.activeElement)) {
            return;
          }
          node
            .querySelector<HTMLButtonElement>("button:not(:disabled)")
            ?.focus();
        }),
      );
    };
    node.addEventListener("click", handleClick);
    return () => node.removeEventListener("click", handleClick);
  }, []);

  return ref;
}

/** Swipeable photo set with its controls laid over the bottom of the frame. */
function PhotoCarousel({
  title,
  photos,
  imageClassName,
}: {
  title: string;
  photos: EventPhoto[];
  imageClassName: string;
}) {
  const ref = useArrowFocusRescue();

  return (
    <div ref={ref} data-tone="night" className="absolute inset-0">
      <Carousel
        label={`${title} photos`}
        slideClassName="relative h-full basis-full"
        gap={0}
        className={photoCarouselClasses}
      >
        {photos.map((photo, index) => (
          <div key={`${index}-${photo.src}`} className="absolute inset-0">
            <EventImage
              src={photo.src}
              alt={photo.alt}
              sizes={cardImageSizes}
              className={imageClassName}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/65 to-transparent"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

/**
 * Past events, newest first as passed in, in a compact photo grid. Month
 * groups read as a rail: the first event of each month carries the label and
 * the hairline continues over the rest of that month.
 */
export function PastEvents({ events }: { events: Event[] }) {
  const groupedEvents = groupEventsByMonth(events);

  if (events.length === 0) {
    return <EmptyState title="No past events to display." />;
  }

  return (
    <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3 lg:gap-x-8">
      {Object.entries(groupedEvents).flatMap(([month, monthEvents]) =>
        monthEvents.map((event, index) => (
          <Reveal key={event.id} className="flex flex-col">
            <div className="mb-5 flex h-5 items-center gap-3">
              {index === 0 ? (
                <h3 className="flex shrink-0 items-center gap-2.5 text-eyebrow text-highlight uppercase">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-current"
                  />
                  {month}
                </h3>
              ) : null}
              <span aria-hidden className="h-px flex-1 bg-hairline-strong" />
            </div>
            <PastEventCard event={event} />
          </Reveal>
        )),
      )}
    </div>
  );
}

function PastEventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.event_date);
  const location = formatEventLocation(event);
  const photos = getEventPhotos(event);
  const zoom =
    "transition-transform duration-[1.4s] ease-brand group-hover/media:scale-[1.045] motion-reduce:transition-none";

  return (
    <article className="group/media flex flex-1 flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sunken">
        {photos.length > 1 ? (
          <PhotoCarousel
            title={event.title}
            photos={photos}
            imageClassName={zoom}
          />
        ) : (
          <EventImage
            src={photos[0]?.src}
            alt={photos[0]?.alt ?? ""}
            sizes={cardImageSizes}
            className={zoom}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-medium text-fg-subtle text-meta">
          <time dateTime={event.event_date}>{format(eventDate, "PPP")}</time>
          {event.category ? <Tag>{event.category}</Tag> : null}
        </div>
        <h4 className="mt-3 text-fg text-heading-md">{event.title}</h4>
        {location ? (
          <p className="mt-1.5 flex items-start gap-2 text-fg-subtle text-meta">
            <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {location}
          </p>
        ) : null}
        <p className="mt-3 text-fg-muted text-small">
          {truncateDescription(event.description)}
        </p>
        {hasLongDescription(event) ? (
          <div className="mt-auto pt-5">
            <EventDetailsDialog
              event={event}
              image={photos[0]}
              triggerVariant="link"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
