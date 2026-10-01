import {
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import type { hackathonsView } from "./hackathons-view";
import { RibbonTrack, RibbonYears } from "./ribbon-track";

type View = ReturnType<typeof hackathonsView>;

/**
 * The close on paper resolves the hero: the last year of the ribbon, with
 * the next hackathon drawn solid and named, and the two ways in. Students
 * build at the next one; partners bring its challenge.
 */
export function ClosingSection({ closing }: { closing: View["closing"] }) {
  const { strip, next } = closing;
  const nextMark = next
    ? strip.marks.find(({ id }) => id === next.id)
    : undefined;
  const center = nextMark ? nextMark.x + nextMark.w / 2 : 0;
  // The name sits beside the line, and turns to its left near the right edge.
  const flip = center > 0.6;
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
            className="max-w-[12em] text-display-xl text-highlight"
          >
            {closing.title}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
            {closing.lead}
          </p>
        </Reveal>

        {strip.marks.length > 0 ? (
          <Reveal delay={120} className="mt-16 md:mt-24">
            <div className="relative">
              {next && nextMark ? (
                <>
                  {/* The hero's playhead, come to rest on the next one. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 border-highlight border-l"
                    style={{ left: `${center * 100}%` }}
                  />
                  <p
                    className="relative mb-6 w-max max-w-[min(22rem,70%)] text-small"
                    style={
                      flip
                        ? {
                            marginLeft: "auto",
                            marginRight: `calc(${(1 - center) * 100}% + 0.75rem)`,
                          }
                        : { marginLeft: `calc(${center * 100}% + 0.75rem)` }
                    }
                  >
                    <span className="block font-semibold text-highlight text-label-sm">
                      {closing.nextLabel}
                    </span>
                    <span className="block text-fg">{next.title}</span>
                    <span className="block text-fg-muted">{next.dates}</span>
                  </p>
                </>
              ) : null}
              <RibbonTrack
                size="strip"
                solidUpcoming
                marks={strip.marks}
                lanes={strip.lanes}
                years={strip.years}
              />
            </div>
            <RibbonYears years={strip.years} className="mt-3" />
          </Reveal>
        ) : null}

        <div className="mt-16 grid border-hairline-strong border-t md:mt-24 md:grid-cols-2">
          {[
            {
              ...closing.student,
              action: (
                <ButtonLink href="/events" arrow>
                  {closing.student.actionLabel}
                </ButtonLink>
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
