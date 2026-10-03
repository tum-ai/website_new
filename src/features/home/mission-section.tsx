import {
  Container,
  Display,
  Ledger,
  type LedgerItem,
  Reveal,
  Section,
  Text,
  TextLink,
} from "@tum.ai/ui-kit";
import type { HomeCopy } from "./data/homepage";

/**
 * What TUM.ai is, for a first-time visitor: the mission as a statement on
 * the left, the key figures as a ledger on the right.
 */
export function MissionSection({
  mission,
  ledger,
}: {
  mission: HomeCopy["mission"];
  /** The ledger rows with their figures (`homeView`). */
  ledger: LedgerItem[];
}) {
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
            {mission.statement}
          </Display>
          <Text size="lead" className="mt-8 max-w-xl md:mt-10">
            {mission.body}
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
          <Ledger items={ledger} />
        </Reveal>
      </Container>
    </Section>
  );
}
