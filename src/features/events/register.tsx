import { Plus } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ds";
import type { Event } from "@/lib/types";
import { EventDetailsDialog } from "./event-details";
import {
  formatEventDate,
  formatEventLocation,
  formatHosts,
  groupEventsBySemester,
  hostsBeyondTitle,
  toEventDetails,
} from "./events";
import { categoryLabel } from "./filters";
import { Lockup } from "./lockup";
import { RegisterFilter, type RegisterSemester } from "./register-filter";

/**
 * The archive as a register: every past event as one hairline row (date,
 * lockup title, venue and co-hosts, format), grouped by TUM semester, newest
 * first. The rows are rendered here on the server; the client island only
 * filters them by category.
 */
export function Register({
  events,
  since,
}: {
  /** Past events, newest first. */
  events: Event[];
  /** "March 2025", the month of the first event. */
  since?: string;
}) {
  const semesters: RegisterSemester[] = groupEventsBySemester(events).map(
    ({ key, label, events: semesterEvents }) => ({
      key,
      label,
      entries: semesterEvents.map((event) => ({
        id: event.id,
        category: event.category,
        row: <RegisterRow event={event} />,
      })),
    }),
  );

  return (
    <Section
      tone="mist"
      id="past-events"
      aria-labelledby="past-events-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="past-events-title"
          layout="stack"
          title="Past events"
          lead={
            since
              ? `Everything we have run since ${since}, by semester.`
              : undefined
          }
        />
        <RegisterFilter semesters={semesters} />
      </Container>
    </Section>
  );
}

/**
 * One past event. The title is the dialog trigger, and its hit area covers
 * the whole row; the turning plus and the title's colour show it opens.
 */
function RegisterRow({ event }: { event: Event }) {
  const date = formatEventDate(event.event_date);
  const location = formatEventLocation(event);
  const title = event.title.trim();
  const hosts = hostsBeyondTitle(event);

  return (
    <article className="group/row relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-x-8 md:py-6 lg:grid-cols-[8rem_minmax(0,1fr)_9rem_1.5rem]">
      <time
        dateTime={date.dateTime}
        className="tabular pt-1 text-fg-muted text-small sm:text-body"
      >
        {date.short}
      </time>
      <div className="min-w-0">
        <h4 className="text-fg text-heading-md transition-colors duration-300 ease-brand group-hover/row:text-highlight">
          <EventDetailsDialog
            details={toEventDetails(event)}
            trigger={{
              kind: "bare",
              className: "text-left after:absolute after:inset-0",
            }}
          >
            <span className="sr-only">Read More about </span>
            <Lockup title={title} />
          </EventDetailsDialog>
        </h4>
        <p className="mt-1.5 text-fg-muted text-small">
          {location}
          {hosts.length > 0 ? (
            <>
              {location ? ", " : null}
              with {formatHosts(hosts)}
            </>
          ) : null}
        </p>
      </div>
      <p className="col-start-2 mt-2 text-fg-subtle text-small sm:col-start-auto sm:mt-0 sm:pt-1 sm:text-right lg:text-left">
        {event.category ? categoryLabel(event.category) : null}
      </p>
      <Plus
        aria-hidden="true"
        className="mt-1.5 hidden size-5 text-fg-subtle transition-[rotate,color] duration-500 ease-brand group-hover/row:text-highlight motion-safe:group-hover/row:rotate-90 lg:block"
      />
    </article>
  );
}
