import {
  Container,
  Highlight,
  Reveal,
  Section,
  SectionHeader,
  StatGrid,
} from "@/components/ds";
import { organizationFacts } from "@/config/organization";

/** Figures quoted in this page's own copy (About and Values). */
const figures = [
  {
    value: organizationFacts.activeMembers,
    suffix: "+",
    label: "Active members",
  },
  { value: organizationFacts.majors, suffix: "+", label: "Majors" },
  {
    value: organizationFacts.nationalities,
    suffix: "+",
    label: "Nationalities",
  },
];

/** "We are TUM.ai": who we are, then the headline figures. */
export function About() {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="apply-about-title">
      <Container>
        <SectionHeader
          id="apply-about-title"
          eyebrow="About us"
          index={1}
          layout="stack"
          size="lg"
          title={
            <>
              We are <Highlight>TUM.ai</Highlight>
            </>
          }
          lead={`As a leading student initiative focused on AI, we bring together a diverse group of over ${organizationFacts.activeMembers} active members, each with technical skills and cultural backgrounds. Our community consists of passionate AI enthusiasts who are determined to make an impact on the AI landscape worldwide. The journey towards shaping the future of AI is open to everyone, including you!`}
        />
        <Reveal delay={100}>
          <StatGrid items={figures} columns={3} />
        </Reveal>
      </Container>
    </Section>
  );
}
