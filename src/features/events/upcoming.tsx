import {
  Actions,
  BrandPanel,
  Container,
  FallbackImage,
  Reveal,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/ds";
import { socialLinks } from "@/config/contact";
import type { Event } from "@/lib/types";
import { EventDetailsDialog } from "./event-details";
import {
  excerpt,
  formatEventDate,
  formatEventLocation,
  hostsBeyondTitle,
  toEventDetails,
} from "./events";
import { categoryLabel } from "./filters";
import { HostLine } from "./host-line";
import { Lockup } from "./lockup";
import { SignUpAction } from "./sign-up-action";

/**
 * What's next: each upcoming event as a large row, its date set in light
 * figures, the lockup title, venue and co-hosts, an excerpt, the sign-up and
 * the poster. When nothing is scheduled, the section says so and points to
 * where new dates are announced; most of the year that is the normal state.
 */
export function Upcoming({ events }: { events: Event[] }) {
  return (
    <Section
      tone="paper"
      id="upcoming-events"
      aria-labelledby="upcoming-events-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="upcoming-events-title"
          layout="stack"
          title="Upcoming"
          count={events.length > 0 ? events.length : undefined}
        />
        {events.length > 0 ? (
          <ol className="border-hairline-strong border-b">
            {events.map((event, index) => (
              <li key={event.id} className="border-hairline-strong border-t">
                <Reveal delay={index * 80}>
                  <UpcomingEvent event={event} />
                </Reveal>
              </li>
            ))}
          </ol>
        ) : (
          <Reveal>
            {/* TODO(content): confirm Instagram and LinkedIn are where new event dates go out first. */}
            <p className="max-w-2xl border-hairline-strong border-t pt-8 text-fg text-lead">
              Nothing is scheduled right now. We announce new dates on{" "}
              <TextLink href={socialLinks.instagram}>Instagram</TextLink> and{" "}
              <TextLink href={socialLinks.linkedin}>LinkedIn</TextLink>.
            </p>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}

function UpcomingEvent({ event }: { event: Event }) {
  const date = formatEventDate(event.event_date);
  const location = formatEventLocation(event);
  const title = event.title.trim();
  const signUp = event.sign_up ? (
    <SignUpAction title={title} signUp={event.sign_up} />
  ) : null;

  return (
    <article className="grid gap-x-10 gap-y-6 py-10 md:grid-cols-[9rem_minmax(0,1fr)] md:py-14 lg:grid-cols-[11rem_minmax(0,1fr)_minmax(0,16rem)] xl:gap-x-16">
      <p className="flex items-baseline gap-4 md:block">
        <time
          dateTime={date.dateTime}
          className="tabular block text-display-lg text-highlight leading-none"
        >
          {date.day}
        </time>
        <span className="block text-fg text-lead md:mt-4">{date.month}</span>
        <span className="block text-fg-muted text-small md:mt-1">
          {date.weekday}
          {date.time ? `, ${date.time}` : null}
        </span>
      </p>

      <div className="min-w-0">
        <h3 className="text-fg text-heading-lg">
          <Lockup title={title} />
        </h3>
        <p className="mt-3 text-fg-muted text-small">
          {[location, event.category ? categoryLabel(event.category) : null]
            .filter(Boolean)
            .join(", ")}
        </p>
        <HostLine hosts={hostsBeyondTitle(event)} className="mt-1 text-small" />
        <p className="mt-5 max-w-2xl text-body text-fg-muted">
          {excerpt(event.description)}
        </p>
        <Actions className="mt-8">
          {signUp}
          <EventDetailsDialog
            details={toEventDetails(event)}
            action={
              event.sign_up ? (
                <SignUpAction title={title} signUp={event.sign_up} size="lg" />
              ) : null
            }
            trigger={{
              kind: "button",
              variant: signUp ? "outline" : "primary",
            }}
          >
            Read More<span className="sr-only"> about {title}</span>
          </EventDetailsDialog>
        </Actions>
      </div>

      {event.poster ? (
        <div className="relative hidden aspect-square overflow-hidden rounded-3xl bg-sunken lg:block">
          <FallbackImage
            src={event.poster}
            alt={`${title}, poster`}
            fill
            unoptimized
            sizes="16rem"
            className="object-cover"
            fallback={<BrandPanel />}
          />
        </div>
      ) : null}
    </article>
  );
}
