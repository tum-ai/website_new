import {
  Aurora,
  BrandMark,
  Container,
  Highlight,
  Section,
  SectionHeader,
} from "@/components/ds";
import { Benefits } from "./benefits";
import { values } from "./data/apply";

/** Ink feature band: the four values as glass spotlight cards. */
export function Values() {
  return (
    <Section
      tone="ink"
      spacing="lg"
      grain
      aria-labelledby="apply-values-title"
      className="overflow-clip"
    >
      <Aurora intensity="subtle" />
      <BrandMark
        className="absolute -bottom-[18%] -left-[14%] -z-10 w-[min(52rem,90%)]"
        intensity="faint"
      />
      <Container>
        <SectionHeader
          id="apply-values-title"
          eyebrow="What drives us"
          index={4}
          layout="stack"
          title={
            <>
              Our <Highlight>Values</Highlight>
            </>
          }
        />
        <Benefits benefits={values} columns={2} variant="glass" />
      </Container>
    </Section>
  );
}
