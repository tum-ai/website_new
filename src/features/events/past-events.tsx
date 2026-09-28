import { MapPin } from "lucide-react";
import { BrandPanel, Carousel, FallbackImage, Tag } from "@/components/ds";
import type { Event } from "@/lib/types";
import { EventDetailsDialog } from "./event-details";
import {
  type EventPhoto,
  formatEventDate,
  formatEventLocation,
  getEventPhotos,
  hasLongDescription,
  toEventDetails,
  truncateDescription,
} from "./events";

const cardImageSizes =
  "(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw";

/** Swipeable photo set with its controls laid over the bottom of the frame. */
function PhotoCarousel({
  title,
  photos,
}: {
  title: string;
  photos: EventPhoto[];
}) {
  return (
    <div data-tone="night" className="absolute inset-0">
      <Carousel
        label={`${title} photos`}
        variant="overlay"
        gap={0}
        classNames={{ slide: "relative h-full basis-full" }}
      >
        {photos.map((photo) => (
          <div key={photo.src} className="absolute inset-0">
            <FallbackImage
              src={photo.src}
              alt={photo.alt}
              fill
              unoptimized
              sizes={cardImageSizes}
              className="zoom-media object-cover"
              fallback={<BrandPanel />}
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
 * A past event in the archive grid: its photos (a carousel when there are
 * several), date, category, title, location, excerpt and "Read More". A
 * server component; the carousel and the dialog are its client parts.
 */
export function PastEventCard({
  event,
  seed = 0,
}: {
  /** The event. */
  event: Event;
  /** Picks the fallback panel's composition, e.g. the card's index. */
  seed?: number;
}) {
  const date = formatEventDate(event.event_date);
  const location = formatEventLocation(event);
  const photos = getEventPhotos(event);

  return (
    <article className="group/zoom flex flex-1 flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sunken">
        {photos.length > 1 ? (
          <PhotoCarousel title={event.title} photos={photos} />
        ) : (
          <FallbackImage
            src={photos[0]?.src}
            alt={photos[0]?.alt ?? ""}
            fill
            unoptimized
            sizes={cardImageSizes}
            className="zoom-media object-cover"
            fallback={<BrandPanel seed={seed} />}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-medium text-fg-subtle text-meta">
          <time dateTime={date.dateTime}>{date.long}</time>
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
              details={toEventDetails(event, photos[0])}
              triggerVariant="link"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
