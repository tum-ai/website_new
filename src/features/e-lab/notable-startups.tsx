import {
  Container,
  LogoTile,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { notableStartups } from "./data/venture-page";

/**
 * Alumni ventures as a centered wall of linked logo tiles (4 + 3 on wide
 * screens). Symbol-only logos carry their name as a wordmark lockup.
 */
export function NotableStartups() {
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="elab-startups-title">
      <Container>
        <SectionHeader
          id="elab-startups-title"
          eyebrow="Alumni ventures"
          index={4}
          title="Notable E-Lab Startups from previous iterations"
          layout="center"
        />
        <ul className="flex flex-wrap justify-center gap-3">
          {notableStartups.map((startup, index) => (
            <Reveal
              as="li"
              key={startup.id}
              delay={index * 60}
              className="flex min-w-0 basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-2.25rem)/4)]"
            >
              <LogoTile
                size="xl"
                responsive
                name={startup.name}
                src={startup.logoSrc}
                href={startup.href}
                wordmark={startup.wordmarkLabel}
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
