import {
  Container,
  Display,
  Ledger,
  Reveal,
  Section,
  Text,
  TextLink,
} from "@/components/ds";
import { ledgerFacts } from "./data/homepage";

/**
 * What TUM.ai is, for a first-time visitor: the mission as a statement on
 * the left, the key figures as a ledger on the right.
 */
export function MissionSection() {
  return (
    <Section
      tone="paper"
      spacing="xl"
      id="about"
      aria-labelledby="about-title"
      className="scroll-mt-header"
    >
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Display id="about-title" size="lg" className="max-w-[13em]">
            We close the gap between AI research and the things people build.
          </Display>
          <Text size="lead" className="mt-8 max-w-xl md:mt-10">
            TUM.ai is a non-profit student initiative at the Technical
            University of Munich. Our members run research projects with
            universities and labs, build AI products with industry partners,
            incubate startups, and host hackathons, talks and workshops.
          </Text>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <TextLink href="/community#memberStories" arrow>
              Meet our members
            </TextLink>
            <TextLink href="/qanda" arrow emphasis="muted">
              Read about our mission
            </TextLink>
          </div>
        </div>
        <Reveal className="lg:col-span-5 lg:col-start-8">
          <Ledger items={ledgerFacts} />
        </Reveal>
      </Container>
    </Section>
  );
}
