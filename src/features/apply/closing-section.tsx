import {
  Actions,
  ButtonLink,
  Container,
  DayRuler,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { ApplyAction } from "./apply-action";
import { closedLabel, type RecruitingCall } from "./round";

/** The closing statement: the one date that matters now. */
function closingTitle(call: RecruitingCall): string {
  switch (call.phase) {
    case "open":
      return `Applications close on ${call.words.deadline}.`;
    case "upcoming":
      return `Applications open on ${call.words.opens}.`;
    default:
      return "This call is closed.";
  }
}

/** The sentence under it: the time left and what follows the deadline. */
function closingLead(call: RecruitingCall): string {
  const next = `Interviews run from ${call.words.interviews}, and the onboarding weekend is ${call.words.onboarding}.`;
  if (call.phase === "open") {
    return `${call.daysLeftLabel}. The form closes at ${call.words.deadlineTime}, Munich time. ${next}`;
  }
  if (call.phase === "upcoming") {
    return `The form stays open until ${call.words.deadline}. ${next}`;
  }
  return `${next} The next call will be announced on this page.`;
}

/**
 * The call's submission box, on ink: the hero's register reduced to the one
 * date that matters, over the same day ruler at full width, with the apply
 * action. Beside it, the partners' way to meet the members.
 */
export function ClosingSection({ call }: { call: RecruitingCall }) {
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="apply-close-title">
      <Container>
        <Reveal>
          <h2
            id="apply-close-title"
            className="max-w-[12em] text-display-xl text-highlight"
          >
            {closingTitle(call)}
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={100}>
          <DayRuler
            className="mt-12 md:mt-16"
            size="lg"
            days={call.progress.totalDays}
            elapsed={call.progress.elapsedDays}
            startLabel={`${call.phase === "upcoming" ? "Opens" : "Opened"} ${call.short.opens}`}
            endLabel={`Deadline ${call.short.deadline}`}
            markLabel={call.daysLeftLabel || undefined}
          />
        </Reveal>
        <div className="mt-12 grid gap-16 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <Reveal delay={160} className="lg:col-span-8">
            <p className="max-w-xl text-fg-muted text-lead">
              {closingLead(call)}
            </p>
            <Actions className="mt-10">
              <ApplyAction
                phase={call.phase}
                statusId="apply-close-status"
                closedLabel={closedLabel(call)}
              />
              <ButtonLink href="/qanda" size="lg" variant="outline">
                Questions and answers
              </ButtonLink>
            </Actions>
          </Reveal>
          <Reveal
            delay={220}
            className="border-hairline-strong border-t pt-8 lg:col-span-4 lg:self-end"
          >
            <p className="font-medium text-fg text-small">For companies</p>
            <p className="mt-3 text-body text-fg-muted">
              Partners meet our members through talent packages, hackathon
              challenges and company visits.
            </p>
            <p className="mt-5">
              <TextLink href="/partners" arrow className="text-small">
                Become a Partner
              </TextLink>
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
