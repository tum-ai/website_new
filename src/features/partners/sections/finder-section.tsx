import { Sparkles } from "lucide-react";
import { Container, Reveal, Section, Text } from "@/components/ds";
import type { PartnersSections } from "../data/partners";
import { PartnershipFinder } from "../partnership-finder";
import { Lines } from "./lines";

/** "Find your fit": the pitch beside the two-question partnership finder. */
export function FinderSection({ copy }: { copy: PartnersSections["finder"] }) {
  return (
    <Section
      id="find-your-fit"
      tone="lavender"
      aria-labelledby="finder-title"
      className="scroll-mt-header"
    >
      <Container className="grid gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 xl:gap-20">
        <Reveal>
          <p className="flex items-center gap-2 text-eyebrow text-highlight">
            <Sparkles aria-hidden className="size-4" />
            {copy.eyebrow}
          </p>
          <h2 id="finder-title" className="mt-5 text-display-md text-fg">
            <Lines lines={copy.title} />
          </h2>
          <Text size="lead" className="mt-6 max-w-sm">
            {copy.lead}
          </Text>
          <Text
            as="span"
            size="meta"
            emphasis="subtle"
            className="mt-6 block max-w-xs lg:mt-8"
          >
            {copy.note}
          </Text>
        </Reveal>
        <Reveal delay={120}>
          <PartnershipFinder />
        </Reveal>
      </Container>
    </Section>
  );
}
