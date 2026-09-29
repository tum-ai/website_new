import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import type { Event } from "@/lib/types";
import { formatEventDate } from "./events";
import { Lockup } from "./lockup";
import { SignUpAction } from "./sign-up-action";

/**
 * The page's close on ink: the hero's lockup, completed with the reader's
 * own team, for partners; beside it, the student's way in, which is the next
 * event's sign-up when there is one and membership otherwise.
 */
export function ClosingSection({ next }: { next?: Event }) {
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="events-close-title">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h2
                id="events-close-title"
                className="max-w-[11em] text-display-xl text-fg"
              >
                <Lockup title="TUM.ai x your team." />
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                Bring a challenge to one of our hackathons, give a talk for our
                members, or host an evening at your office. We plan it with you.
              </p>
              <Actions className="mt-10 md:mt-12">
                <ButtonLink href="/partners#partner-contact" size="lg" arrow>
                  Become a Partner
                </ButtonLink>
              </Actions>
            </Reveal>
          </div>
          <Reveal
            delay={160}
            className="border-hairline-strong border-t pt-8 lg:col-span-4 lg:self-end"
          >
            <p className="font-medium text-fg text-small">For students</p>
            {next ? <NextEvent event={next} /> : <Membership />}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function NextEvent({ event }: { event: Event }) {
  const date = formatEventDate(event.event_date);
  const title = event.title.trim();
  return (
    <>
      <p className="mt-3 text-body text-fg-muted">
        Next up:{" "}
        <span className="text-fg">
          <Lockup title={title} />
        </span>
        , <time dateTime={date.dateTime}>{date.long}</time>.
      </p>
      {event.sign_up ? (
        <div className="mt-5 flex">
          <SignUpAction title={title} signUp={event.sign_up} />
        </div>
      ) : (
        <p className="mt-5">
          <TextLink href="#upcoming-events" arrow className="text-small">
            See upcoming events
          </TextLink>
        </p>
      )}
    </>
  );
}

function Membership() {
  return (
    <>
      <p className="mt-3 text-body text-fg-muted">
        Members plan and run these events themselves, from the first poster to
        the last pitch.
      </p>
      <p className="mt-5">
        <TextLink href="/apply" arrow className="text-small">
          Become a Member
        </TextLink>
      </p>
    </>
  );
}
