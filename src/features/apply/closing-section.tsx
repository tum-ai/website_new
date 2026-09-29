import {
  Actions,
  ButtonLink,
  Container,
  DayRuler,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { partnerPitch } from "@/features/partners";
import { ApplyAction } from "./apply-action";
import {
  closedLabel,
  closingLead,
  closingTitle,
  type RecruitingCall,
} from "./round";

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
            <p className="mt-3 text-body text-fg-muted">{partnerPitch}</p>
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
