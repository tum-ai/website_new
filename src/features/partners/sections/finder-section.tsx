import { Sparkles } from "lucide-react";
import { Container, Reveal, Section, Text } from "@/components/ds";
import { PartnershipFinder } from "../partnership-finder";

/** "Find your fit": the pitch beside the two-question partnership finder. */
export function FinderSection() {
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
            Your way in
          </p>
          <h2 id="finder-title" className="mt-5 text-display-md text-fg">
            Big ambitions.
            <br />
            The right partnership.
          </h2>
          <Text size="lead" className="mt-6 max-w-sm">
            Tell us what you have in mind. We’ll find your place in the
            ecosystem.
          </Text>
          <Text
            as="span"
            size="meta"
            emphasis="subtle"
            className="mt-6 block max-w-xs lg:mt-8"
          >
            Two quick questions. No forms. Just a starting point.
          </Text>
        </Reveal>
        <Reveal delay={120}>
          <PartnershipFinder />
        </Reveal>
      </Container>
    </Section>
  );
}
