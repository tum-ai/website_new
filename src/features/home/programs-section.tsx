import { Container, IndexList, Section, SectionHeader } from "@/components/ds";
import { programs } from "./data/homepage";

/** The five ways into TUM.ai as a typographic index with photo previews. */
export function ProgramsSection() {
  return (
    <Section
      tone="paper"
      spacing="none"
      id="programs"
      aria-labelledby="programs-title"
      className="pb-28 md:pb-44"
    >
      <Container>
        <SectionHeader
          id="programs-title"
          title="What we do"
          size="lg"
          lead="Every program is organized by members, together with partners from research and industry."
        />
        <IndexList items={programs} />
      </Container>
    </Section>
  );
}
