import {
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
} from "@/components/ds";
import { openSeatSlug } from "./data/projects";
import { OverlapsFigure } from "./overlaps-figure";
import type { projectsView } from "./projects-view";

type View = ReturnType<typeof projectsView>;

/**
 * The close on ink resolves the hero: the same figure, with the open circle
 * drawn solid, and the two ways in. Students found the next task force;
 * partners bring a problem from their field.
 */
export function ClosingSection({
  closing,
  figureSeats,
}: Pick<View, "closing" | "figureSeats">) {
  return (
    <Section
      tone="ink"
      spacing="xl"
      id={openSeatSlug}
      aria-labelledby="projects-close-title"
      className="scroll-mt-header overflow-clip"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2
                id="projects-close-title"
                className="max-w-[10em] text-display-xl text-highlight"
              >
                {closing.title}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                {closing.lead}
              </p>
            </Reveal>
          </div>
          <Reveal
            variant="scale"
            delay={120}
            className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-md"
          >
            <OverlapsFigure seats={figureSeats} variant="close" />
          </Reveal>
        </div>

        <div className="mt-16 grid border-hairline-strong border-t md:mt-24 md:grid-cols-2">
          {[
            {
              ...closing.student,
              action: (
                <ButtonLink href="/apply" arrow>
                  Become a Member
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
                  Become a Partner
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
              {/* Pinned to the row's foot, so both actions line up. */}
              <div className="mt-auto pt-8">{fork.action}</div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
