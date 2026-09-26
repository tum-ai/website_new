import {
  Container,
  Highlight,
  Pill,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { WidePhoto } from "./wide-photo";

const statements = [
  { label: "Vision", text: "Foster the next generation of AI talent." },
  {
    label: "Mission",
    text: "TUM.ai connects students and all relevant stakeholders to facilitate the application of AI across domains and drive positive social impact through interdisciplinary projects.",
  },
];

/** The brand guide's mission/vision slide: outlined pills over two columns. */
export function MissionVision() {
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="apply-mission-title">
      <Container>
        <SectionHeader
          id="apply-mission-title"
          eyebrow="Direction"
          index={2}
          title={
            <>
              Mission and <Highlight>Vision</Highlight>
            </>
          }
          lead="Our long-term vision and mission are the key components that drive us forward without losing our direction."
        />
        <dl className="grid gap-12 border-hairline border-t pt-12 md:grid-cols-2 md:gap-16 md:pt-16">
          {statements.map((statement, index) => (
            <Reveal key={statement.label} delay={index * 120}>
              <dt>
                <Pill size="lg">{statement.label}</Pill>
              </dt>
              <dd className="mt-7 max-w-xl font-normal text-fg text-heading-lg">
                {statement.text}
              </dd>
            </Reveal>
          ))}
        </dl>
        <WidePhoto
          className="mt-16 md:mt-24"
          src="/assets/apply/new_section_photo_1.webp"
          alt="TUM.ai members"
          aspectClassName="aspect-[4/3] sm:aspect-[2/1] lg:aspect-[1920/563]"
          positionClassName="object-[50%_60%]"
        />
      </Container>
    </Section>
  );
}
