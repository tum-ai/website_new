import {
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
} from "@tum.ai/ui-kit";
import { callToActionLabels } from "@/config/calls-to-action";
import type { hackathonsView } from "./hackathons-view";

type View = ReturnType<typeof hackathonsView>;

/**
 * The close on paper: the call to build at the next hackathon, and the two
 * ways in. Students join one (or follow the Grand Finale while it is
 * ahead); partners bring its challenge.
 */
export function ClosingSection({ closing }: { closing: View["closing"] }) {
  return (
    <Section
      tone="paper"
      spacing="xl"
      aria-labelledby="hackathons-close-title"
      className="overflow-clip"
    >
      <Container>
        <Reveal>
          <h2
            id="hackathons-close-title"
            className="max-w-[12em] text-display-lg text-highlight"
          >
            {closing.title}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
            {closing.lead}
          </p>
        </Reveal>

        <div className="mt-16 grid border-hairline-strong border-t md:mt-24 md:grid-cols-2">
          {[
            {
              ...closing.student,
              action: (
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonLink href="/events" arrow>
                    {closing.student.actionLabel}
                  </ButtonLink>
                  {closing.finale ? (
                    <ButtonLink
                      href={closing.finale.url}
                      variant="outline"
                      arrow="external"
                    >
                      {closing.finale.label}
                    </ButtonLink>
                  ) : null}
                </div>
              ),
            },
            {
              ...closing.partner,
              action: (
                <ButtonLink
                  href="/partners#partner-contact"
                  variant="outline"
                  arrow
                >
                  {callToActionLabels.partner}
                </ButtonLink>
              ),
            },
          ].map((fork, position) => (
            <Reveal
              key={fork.audience}
              delay={position * 100}
              className="flex flex-col border-hairline py-8 max-md:not-last:border-b md:py-10 md:even:border-l md:even:pl-12 md:odd:pr-12"
            >
              <Eyebrow>{fork.audience}</Eyebrow>
              <h3 className="mt-3 max-w-md text-fg text-heading-md">
                {fork.text}
              </h3>
              <div className="mt-auto pt-8">{fork.action}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
