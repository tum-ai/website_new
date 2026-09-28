import { Container, Section, SectionHeader, Timeline } from "@/components/ds";
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
 * "Program": the six-step journey on the DS timeline with a dashed rail that
 * runs on into "Your journey continues...".
 */
export function ProgramTimeline() {
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
          rail="dashed"
          continuation="Your journey continues..."
          items={programSteps.map((step, index) => ({
            id: step.id,
            label: `Step ${String(index + 1).padStart(2, "0")}`,
            title: step.title,
            description: <StepDescription text={step.description} />,
          }))}
        />
      </Container>
    </Section>
  );
}
