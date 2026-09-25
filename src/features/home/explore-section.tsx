import { Container, Highlight, Section, SectionHeader } from "@/components/ds";
import { DeferredExploreBento } from "./deferred-home-sections";

/**
 * Server-rendered band and heading for the destinations bento; the photo
 * cards themselves load after hydration (see DeferredHomeSections).
 */
export function ExploreSection() {
  return (
    <Section
      tone="paper"
      spacing="lg"
      id="explore"
      aria-labelledby="explore-title"
    >
      <Container>
        <SectionHeader
          id="explore-title"
          eyebrow="Get involved"
          index={2}
          size="lg"
          title={
            <>
              Explore <Highlight>TUM.ai</Highlight>
            </>
          }
        />
        <DeferredExploreBento />
      </Container>
    </Section>
  );
}
