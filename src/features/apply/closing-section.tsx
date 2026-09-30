import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import type { MembershipConfig } from "@/config/membership";
import { isCmsClockFixed } from "@/lib/mock-cms-env";
import { LiveApplyAction } from "./apply-action";
import type { ApplyCopy } from "./data/apply";
import {
  LiveClosingLead,
  LiveClosingRuler,
  LiveClosingTitle,
} from "./live-call-dates";
import type { RecruitingCall } from "./round";

/**
 * The call's submission box, on ink: the hero's register reduced to the one
 * date that matters, over the same day ruler at full width, with the apply
 * action. Beside it, the partners' way to meet the members
 * (`partnerPitch`, from the partners copy). The title, the ruler and the
 * paragraph with the days left read the same call kept current in the
 * browser (`live-call-dates.tsx`), so they turn together at the opening,
 * the deadline and every Munich midnight (`membership` is the window `call`
 * was computed from).
 */
export function ClosingSection({
  call,
  membership,
  copy,
  partnerPitch,
}: {
  call: RecruitingCall;
  membership: MembershipConfig;
  copy: ApplyCopy["closing"];
  partnerPitch: string;
}) {
  const liveCall = { call, config: membership, live: !isCmsClockFixed() };
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="apply-close-title">
      <Container>
        <Reveal>
          <h2
            id="apply-close-title"
            className="max-w-[12em] text-display-xl text-highlight"
          >
            <LiveClosingTitle {...liveCall} />
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={100}>
          <LiveClosingRuler {...liveCall} />
        </Reveal>
        <div className="mt-12 grid gap-16 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <Reveal delay={160} className="lg:col-span-8">
            <LiveClosingLead {...liveCall} />
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
