import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { partnerPitch } from "@/features/partners";
import type { CommunityCopy } from "./data/copy";
import { MembershipApplyButton } from "./membership-apply-button";

/**
 * The page's close on ink: back to column 0 of the timetable, the recruiting
 * round, with its dates from the membership config (placeholders in the
 * copy) and the apply action that
 * follows the dated application window; beside it, the partners' way to meet
 * the members.
 */
export function ClosingSection({ copy }: { copy: CommunityCopy["closing"] }) {
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
                {copy.title}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                {copy.lead}
              </p>
              <Actions className="mt-10 md:mt-12">
                <MembershipApplyButton />
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
            <p className="font-medium text-fg text-small">
              {copy.companiesReader}
            </p>
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
