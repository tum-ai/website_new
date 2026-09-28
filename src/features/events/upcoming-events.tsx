import { CalendarDays, MapPin } from "lucide-react";
import {
  Actions,
  BrandPanel,
  FallbackImage,
  SpotlightCard,
  Tag,
} from "@/components/ds";
import type { Event } from "@/lib/types";
import { EventDetailsDialog } from "./event-details";
import {
  formatEventDate,
  formatEventLocation,
  hasLongDescription,
  toEventDetails,
  truncateDescription,
} from "./events";
import { SignUpAction } from "./sign-up-action";

/**
 * An upcoming event: the poster bleeding to the card edge with a date chip,
 * then category, title, date, location, excerpt and the actions. A server
 * component; the dialog and the spotlight are its only client parts.
 */
export function UpcomingEventCard({
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
  const longDescription = hasLongDescription(event);
  const signUp = event.sign_up ? (
    <SignUpAction title={event.title} signUp={event.sign_up} />
  ) : null;

  return (
    <article>
      <SpotlightCard
        variant="raised"
        padding="none"
        className="group/zoom grid overflow-hidden rounded-4xl md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]"
      >
        {/*
         * The poster bleeds to the card edge; the card's own radius clips it,
         * so there are no rounded corners meeting straight dividers.
         */}
        <div className="relative aspect-[16/10] overflow-hidden bg-sunken md:aspect-auto md:min-h-72">
          <FallbackImage
            src={event.poster}
            alt={event.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 19rem, (min-width: 768px) 15rem, 100vw"
            className="zoom-media object-cover"
            fallback={<BrandPanel seed={seed} />}
          />
          {/* Date chip; the full date is in the meta list below. */}
          <div
            aria-hidden
            className="absolute top-4 left-4 flex min-w-16 flex-col items-center rounded-2xl bg-white/95 px-3 pt-2.5 pb-2 text-violet-950 shadow-soft backdrop-blur"
          >
            <span className="text-eyebrow text-violet-700">
              {date.monthShort}
            </span>
            <span className="tabular mt-0.5 font-semibold text-stat-sm">
              {date.day}
            </span>
            <span className="mt-1 font-medium text-ink-600 text-meta">
              {date.weekday}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col px-5 pt-5 pb-6 sm:px-6 md:px-8 md:py-8 lg:px-10 lg:py-9">
          {event.category ? (
            <Tag className="mb-4 self-start">{event.category}</Tag>
          ) : null}
          <h4 className="text-fg text-heading-lg">{event.title}</h4>
          <ul className="mt-4 space-y-1.5 text-fg-muted text-small">
            <li className="flex items-start gap-2.5">
              <CalendarDays
                aria-hidden
                className="mt-1 size-4 shrink-0 text-highlight"
              />
              <time dateTime={date.dateTime}>{date.long}</time>
            </li>
            {location ? (
              <li className="flex items-start gap-2.5">
                <MapPin
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-highlight"
                />
                {location}
              </li>
            ) : null}
          </ul>
          <p className="mt-5 text-fg-muted text-small md:text-body">
            {truncateDescription(event.description)}
          </p>
          {signUp || longDescription ? (
            <Actions className="mt-auto pt-7">
              {signUp}
              {longDescription ? (
                <EventDetailsDialog
                  details={toEventDetails(
                    event,
                    event.poster
                      ? { src: event.poster, alt: event.title }
                      : undefined,
                  )}
                  action={
                    event.sign_up ? (
                      <SignUpAction
                        title={event.title}
                        signUp={event.sign_up}
                        size="lg"
                      />
                    ) : null
                  }
                />
              ) : null}
            </Actions>
          ) : null}
        </div>
      </SpotlightCard>
    </article>
  );
}
