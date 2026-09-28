import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { membershipConfig } from "@/config/membership";

/**
 * The page's close on ink: back to column 0 of the timetable, the recruiting
 * round, with its dates from the membership config and the apply action that
 * follows `membershipConfig.applicationsOpen`; beside it, the partners' way
 * to meet the members.
 */
export function ClosingSection() {
  const { applicationsOpen, applicationUrl, timeline } = membershipConfig;
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="community-close-title">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h2
                id="community-close-title"
                className="max-w-[11em] text-display-xl text-highlight"
              >
                Semester zero starts with your application.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                The latest recruiting round: applications {timeline.application}
                , interviews {timeline.interview}, and the onboarding weekend{" "}
                {timeline.onboarding}.
              </p>
              <Actions className="mt-10 md:mt-12">
                {applicationsOpen ? (
                  <ButtonLink href={applicationUrl} size="lg" arrow="external">
                    Apply now
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/apply" size="lg" arrow>
                    Become a Member
                  </ButtonLink>
                )}
                <ButtonLink href="/qanda" size="lg" variant="outline">
                  Questions and answers
                </ButtonLink>
              </Actions>
            </Reveal>
          </div>
          <Reveal
            delay={160}
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
