import { Container, Reveal, Section, StatGrid } from "@/components/ds";
import type { PartnerStat, PartnersSections } from "../data/partners";

/** The selectivity figures on violet; copy figures count up to their exact text. */
export function ProofSection({
  stats,
  copy,
}: {
  stats: readonly PartnerStat[];
  copy: PartnersSections["proof"];
}) {
  return (
    <Section tone="violet" spacing="sm" aria-labelledby="partner-proof-title">
      <Container>
        <Reveal>
          <h2 id="partner-proof-title" className="text-fg text-heading-md">
            {copy.title}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <StatGrid
            className="mt-8 md:mt-10"
            items={stats.map((stat) => ({
              value: stat.value,
              count: true,
              label: stat.label,
              description: stat.detail,
            }))}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
