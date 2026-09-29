import {
  Actions,
  ButtonLink,
  Container,
  DayRuler,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { LiveApplyAction, LiveCallPhase } from "./apply-action";
import type { ApplyCopy } from "./data/apply";
import { closingLead, closingTitle, type RecruitingCall } from "./round";

/**
 * The call's submission box, on ink: the hero's register reduced to the one
 * date that matters, over the same day ruler at full width, with the apply
 * action. Beside it, the partners' way to meet the members
 * (`partnerPitch`, from the partners copy).
 */
export function ClosingSection({
  call,
  copy,
  partnerPitch,
}: {
  call: RecruitingCall;
  copy: ApplyCopy["closing"];
  partnerPitch: string;
}) {
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="apply-close-title">
      <Container>
        <Reveal>
          <h2
            id="apply-close-title"
            className="max-w-[12em] text-display-xl text-highlight"
          >
            <LiveCallPhase
              call={call}
              render={(variant) => closingTitle(variant)}
            />
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
            <LiveCallPhase
              call={call}
              render={(variant) => (
                <p className="max-w-xl text-fg-muted text-lead">
                  {closingLead(variant)}
                </p>
              )}
            />
            <Actions className="mt-10">
              <LiveApplyAction call={call} statusId="apply-close-status" />
              <ButtonLink href="/qanda" size="lg" variant="outline">
                {callToActionLabels.questions}
              </ButtonLink>
            </Actions>
          </Reveal>
          <Reveal
            delay={220}
            className="border-hairline-strong border-t pt-8 lg:col-span-4 lg:self-end"
          >
            <p className="font-medium text-fg text-small">
              {copy.companiesReader}
            </p>
            <p className="mt-3 text-body text-fg-muted">{partnerPitch}</p>
            <p className="mt-5">
              <TextLink href="/partners" arrow className="text-small">
                {callToActionLabels.partner}
              </TextLink>
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
