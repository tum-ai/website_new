"use client";

import { format } from "date-fns";
import { MapPin } from "lucide-react";
import {
  Button,
  ButtonLink,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Tag,
} from "@/components/ds";
import { getSafeExternalUrl } from "@/lib/security";
import type { Event } from "@/lib/types";
import { EventArtwork, EventImage } from "./event-media";

/** Cards show this many characters; longer descriptions get "Read More". */
export const DESCRIPTION_LIMIT = 300;

export function hasLongDescription(event: Event) {
  return event.description.length > DESCRIPTION_LIMIT;
}

export function truncateDescription(description: string) {
  return description.length > DESCRIPTION_LIMIT
    ? `${description.slice(0, DESCRIPTION_LIMIT)}...`
    : description;
}

/** "Location, City", skipping whichever part is missing. */
export function formatEventLocation(event: Event) {
  return [event.location, event.city].filter(Boolean).join(", ");
}

type ButtonSize = "sm" | "md" | "lg";

/**
 * Sign-up call to action. Only http(s) URLs pass `getSafeExternalUrl`; they
 * open in a new tab (noopener, announced by ButtonLink). Anything else shows
 * the disabled "Applications Closed" state. Render it only when the event has
 * a `sign_up` value.
 */
export function SignUpAction({
  event,
  size = "md",
  className,
}: {
  event: Event;
  size?: ButtonSize;
  className?: string;
}) {
  const signUpUrl = getSafeExternalUrl(event.sign_up);

  if (!signUpUrl) {
    return (
      <Button variant="secondary" size={size} disabled className={className}>
        Applications Closed
      </Button>
    );
  }

  return (
    <ButtonLink
      href={signUpUrl}
      external
      arrow="external"
      size={size}
      className={className}
    >
      Apply Now!
      <span className="sr-only"> for {event.title}</span>
    </ButtonLink>
  );
}

/**
 * "Read More" trigger and the event detail dialog: image, date, title,
 * location, category, the full description and, for upcoming events, the
 * sign-up action.
 */
export function EventDetailsDialog({
  event,
  image,
  withSignUp = false,
  triggerVariant = "outline",
  triggerSize = "md",
  triggerClassName,
}: {
  event: Event;
  image?: { src: string; alt: string };
  withSignUp?: boolean;
  triggerVariant?: "primary" | "outline" | "secondary" | "link";
  triggerSize?: ButtonSize;
  triggerClassName?: string;
}) {
  const eventDate = new Date(event.event_date);
  const location = formatEventLocation(event);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            arrow
            className={triggerClassName}
          />
        }
      >
        Read More
        <span className="sr-only"> about {event.title}</span>
      </DialogTrigger>
      <DialogContent size="xl">
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-sunken md:aspect-auto md:min-h-[32rem]">
            {image ? (
              <>
                <EventImage
                  src={image.src}
                  alt=""
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="scale-110 opacity-60 blur-2xl"
                />
                <EventImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-contain"
                />
              </>
            ) : (
              <EventArtwork />
            )}
          </div>
          <div className="flex min-w-0 flex-col px-6 py-8 sm:px-10 sm:py-10 md:pt-14">
            <p className="text-eyebrow text-highlight uppercase">
              <time dateTime={event.event_date}>
                {format(eventDate, "PPP")}
              </time>
            </p>
            <DialogTitle className="mt-4 md:pr-8">{event.title}</DialogTitle>
            {location ? (
              <DialogDescription className="mt-3 flex items-start gap-2 text-small">
                <MapPin
                  aria-hidden
                  className="mt-[0.2rem] size-4 shrink-0 text-highlight"
                />
                {location}
              </DialogDescription>
            ) : null}
            {event.category ? (
              <Tag className="mt-5 self-start">{event.category}</Tag>
            ) : null}
            <p className="mt-7 border-t border-hairline pt-7 text-body whitespace-pre-line text-fg-muted">
              {event.description}
            </p>
            {withSignUp && event.sign_up ? (
              <div className="mt-9 flex">
                <SignUpAction event={event} size="lg" />
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
