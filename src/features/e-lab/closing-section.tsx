import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { eLabPhaseCopyOf, eLabWindowClock } from "@/config/e-lab";
import { getELabWindow } from "@/config/schedule-content";
import { getSiteFacts } from "@/config/site-settings-content";
import { fillPageTokens } from "@/lib/content-copy";
import { ELabApplicationCta } from "./application-cta";
import type { ELabCopy } from "./data/copy";
import { ELabPhase } from "./e-lab-phase";

/**
 * The close on ink, back at the widest gate: the application round, drawn
 * as the full-length bar it is on the scale above. The round's status and
 * action follow the application phase: apply while open, and a way to hear
 * about the next round while closed. Beside it, the partners' way in. Facts,
 * phase and phase copy come from the render's `getSiteFacts()` and
 * `getELabWindow()`, the rest of the words from the page copy.
 */
export async function ClosingSection({ copy }: { copy: ELabCopy["closing"] }) {
  const [facts, eLabWindow] = await Promise.all([
    getSiteFacts(),
    getELabWindow(),
  ]);
  const { open, closed } = eLabPhaseCopyOf(
    facts.eLab.currentIteration,
    eLabWindow,
  );
  const clock = eLabWindowClock(eLabWindow);
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="elab-close-title">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h2
                id="elab-close-title"
                className="max-w-[12em] text-display-lg text-highlight"
              >
                {fillPageTokens(copy.title, {
                  applications: String(facts.eLab.selection.applications),
                })}
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
                  clock={clock}
                  open={open.roundStatus}
                  closed={closed.roundStatus}
                />
              </p>
              <Actions className="mt-10 md:mt-12">
                <ELabPhase
                  clock={clock}
                  open={<ELabApplicationCta />}
                  closed={
                    <ButtonLink
                      href={facts.socialLinks.linkedin}
                      size="lg"
                      arrow="external"
                    >
                      {copy.followLabel}
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
              {copy.partnersReader}
            </p>
            <p className="mt-3 text-body text-fg-muted">{copy.partnersText}</p>
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
