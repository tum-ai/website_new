import type { LucideIcon } from "lucide-react";
import Benefits from "@/components/Benefit";
import {
  Aurora,
  BrandMark,
  Container,
  Highlight,
  Section,
  SectionHeader,
} from "@/components/ds";

interface Value {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface ValuesProps {
  valuesWithIcons: Value[];
}

/** Ink feature band: the four values as glass spotlight cards. */
export default function Values({ valuesWithIcons }: ValuesProps) {
  return (
    <Section
      tone="ink"
      spacing="lg"
      grain
      aria-labelledby="apply-values-title"
      className="overflow-clip"
    >
      <Aurora intensity="subtle" />
      <BrandMark className="absolute -bottom-[18%] -left-[14%] -z-10 w-[min(52rem,90%)] text-white/[0.03]" />
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
        <Benefits benefits={valuesWithIcons} columns={2} variant="glass" />
      </Container>
    </Section>
  );
}
