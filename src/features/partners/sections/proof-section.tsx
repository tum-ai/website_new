import { Container, Reveal, Section, StatGrid } from "@/components/ds";
import { partnerStats } from "../data/partners";

/** The selectivity figures on violet; copy figures count up to their exact text. */
export function ProofSection() {
  return (
    <Section tone="violet" spacing="sm" aria-labelledby="partner-proof-title">
      <Container>
        <Reveal>
          <h2 id="partner-proof-title" className="text-fg text-heading-md">
            Small acceptance rate. Outsized potential.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <StatGrid
            className="mt-8 md:mt-10"
            items={partnerStats.map((stat) => ({
              value: stat.value,
              count: true,
              label: stat.label,
              description: "detail" in stat ? stat.detail : undefined,
            }))}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
