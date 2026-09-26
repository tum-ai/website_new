import {
  Container,
  Reveal,
  Section,
  SectionHeader,
  Timeline,
} from "@/components/ds";
import { programSteps } from "./data/venture-page";

/** Renders "a • b" copy verbatim, with the bullet in the accent color. */
function StepDescription({ text }: { text: string }) {
  const parts = text.split(" • ");
  return (
    <>
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 ? (
            <span aria-hidden className="px-1.5 text-highlight">
              •
            </span>
          ) : null}
          {part}
        </span>
      ))}
    </>
  );
}

/**
 * "Program": the six-step journey on the DS timeline, whose rail fills as it
 * scrolls, then a dashed rail that runs on into "Your journey continues...".
 */
export const ProgramTimeline = () => {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="elab-program-title">
      <Container size="narrow">
        <SectionHeader
          id="elab-program-title"
          eyebrow="The journey"
          index={3}
          title="Program"
          layout="center"
        />
        <Timeline
          alternate
          items={programSteps.map((step, index) => ({
            label: `Step ${String(index + 1).padStart(2, "0")}`,
            title: step.title,
            description: <StepDescription text={step.description} />,
          }))}
        />
        <Reveal
          variant="fade"
          className="relative pl-14 md:pl-0 md:text-center"
        >
          <span
            aria-hidden
            className="absolute top-2 left-4 h-24 w-0.5 -translate-x-1/2 bg-[linear-gradient(to_bottom,var(--color-violet-500)_0_50%,transparent_50%_100%)] bg-size-[2px_10px] [mask-image:linear-gradient(to_bottom,#000_30%,transparent)] md:left-1/2"
          />
          <p className="pt-30 text-fg-muted text-heading-md">
            Your journey continues...
          </p>
        </Reveal>
      </Container>
    </Section>
  );
};
