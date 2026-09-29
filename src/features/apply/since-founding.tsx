import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import { organizationFacts } from "@/config/organization";
import { milestones } from "./data/milestones";

/**
 * The previous editions, as a call for papers lists them: one hairline row
 * per year, newest first, the year in light figures beside what members
 * started that year.
 */
export function SinceFounding() {
  return (
    <Section tone="lavender" spacing="lg" aria-labelledby="apply-history-title">
      <Container>
        <SectionHeader
          id="apply-history-title"
          title={`Since ${organizationFacts.foundingYear}`}
          size="lg"
          layout="stack"
          lead="What TUM.ai's members have started, year by year, newest first."
        />
        <ol className="border-hairline-strong border-t">
          {milestones.map((milestone) => (
            <Reveal
              as="li"
              key={milestone.year}
              className="grid gap-x-10 gap-y-4 border-hairline border-b py-8 md:grid-cols-12 md:py-10"
            >
              <h3 className="tabular text-fg text-heading-lg md:col-span-3">
                {milestone.year}
              </h3>
              <ul className="grid gap-3 md:col-span-9 md:pt-1.5">
                {milestone.items.map((item) => (
                  <li key={item} className="flex gap-4 text-body text-fg-muted">
                    <span
                      aria-hidden="true"
                      className="mt-[0.72em] h-px w-3 shrink-0 bg-highlight"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
