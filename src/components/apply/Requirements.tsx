import type { LucideIcon } from "lucide-react";
import Benefits from "@/components/Benefit";
import { Container, Highlight, Section, SectionHeader } from "@/components/ds";

interface Requirement {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface RequirementsProps {
  requirementsWithIcons: Requirement[];
}

export default function Requirements({
  requirementsWithIcons,
}: RequirementsProps) {
  return (
    <Section
      tone="paper"
      spacing="lg"
      aria-labelledby="apply-requirements-title"
    >
      <Container>
        <SectionHeader
          id="apply-requirements-title"
          eyebrow="Who we look for"
          index={6}
          title={
            <>
              Is TUM.ai the <Highlight>right choice</Highlight> for me?
            </>
          }
          lead="There is no secret to TUM.ai's fast-paced growth. Every semester, we have recruited amazing members who drive the initiative forward. If you can identify with the following qualities, you are the one that we are looking for!"
        />
        <Benefits benefits={requirementsWithIcons} columns={4} />
      </Container>
    </Section>
  );
}
