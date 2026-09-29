import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import type { Event } from "@/lib/types";
import { getEventsCopy } from "./content";
import type { EventsCopy } from "./data/copy";
import { formatEventDate } from "./events";
import { Lockup } from "./lockup";
import { SignUpAction } from "./sign-up-action";

/**
 * The page's close on ink: the hero's lockup, completed with the reader's
 * own team, for partners; beside it, the student's way in, which is the next
 * event's sign-up when there is one and membership otherwise. Reads its
 * copy from the content slice itself.
 */
export async function ClosingSection({ next }: { next?: Event }) {
  const { closing } = await getEventsCopy();
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
                <Lockup title={closing.title} />
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                {closing.lead}
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
            <p className="font-medium text-fg text-small">
              {closing.studentsReader}
            </p>
            {next ? (
              <NextEvent event={next} label={closing.nextUp} />
            ) : (
              <Membership text={closing.membership} />
            )}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function NextEvent({ event, label }: { event: Event; label: string }) {
  const date = formatEventDate(event.event_date);
  const title = event.title.trim();
  return (
    <>
      <p className="mt-3 text-body text-fg-muted">
        {label}{" "}
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

function Membership({ text }: { text: EventsCopy["closing"]["membership"] }) {
  return (
    <>
      <p className="mt-3 text-body text-fg-muted">{text}</p>
      <p className="mt-5">
        <TextLink href="/apply" arrow className="text-small">
          Become a Member
        </TextLink>
      </p>
    </>
  );
}
