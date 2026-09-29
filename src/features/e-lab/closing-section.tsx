import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { socialLinks } from "@/config/contact";
import { eLabConfig, eLabPhaseCopy } from "@/config/e-lab";
import { ELabApplicationCta } from "./application-cta";
import { ELabPhase } from "./e-lab-phase";

/**
 * The close on ink, back at the widest gate: the application round, drawn
 * as the full-length bar it is on the scale above. The round's status and
 * action follow the application phase: apply while open, and a way to hear
 * about the next round while closed. Beside it, the partners' way in.
 */
export function ClosingSection() {
  const { open, closed } = eLabPhaseCopy;
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="elab-close-title">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h2
                id="elab-close-title"
                className="max-w-[12em] text-display-xl text-highlight"
              >
                Every Final Pitch starts as one of about{" "}
                {eLabConfig.selection.applications} applications.
              </h2>
            </Reveal>
            <div
              aria-hidden="true"
              className="relative mt-10 h-3 border-hairline-strong border-l md:mt-14"
            >
              <Reveal
                variant="line"
                delay={200}
                className="absolute inset-0 bg-highlight"
              />
            </div>
            <Reveal delay={120}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                <ELabPhase
                  open={open.roundStatus}
                  closed={closed.roundStatus}
                />
              </p>
              <Actions className="mt-10 md:mt-12">
                <ELabPhase
                  open={<ELabApplicationCta />}
                  closed={
                    <ButtonLink
                      href={socialLinks.linkedin}
                      size="lg"
                      arrow="external"
                    >
                      Follow TUM.ai on LinkedIn
                    </ButtonLink>
                  }
                />
              </Actions>
            </Reveal>
          </div>
          <Reveal
            delay={160}
            className="border-hairline-strong border-t pt-8 lg:col-span-4 lg:self-end"
          >
            <p className="font-medium text-fg text-small">
              For investors and companies
            </p>
            <p className="mt-3 text-body text-fg-muted">
              Mentor a team, give feedback and meet the founders at the Final
              Pitch.
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
