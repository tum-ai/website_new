import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import type { Partner } from "@/lib/types";
import type { PartnersSections } from "../data/partners";
import { getPartnerKey } from "../partner-directory";
import { PartnerSupporters } from "../partner-supporters";
import { PartnerTier } from "../partner-tier";
import { Lines } from "./lines";

const tiers = ["gold", "silver", "bronze"] as const;

/** Company keys of a group, so a changed roster remounts its rotation. */
const rosterKey = (partners: Partner[]) =>
  partners.map((partner) => getPartnerKey(partner.name)).join(",");

/**
 * "The company we keep": the gold, silver and bronze rows and the supporter
 * board. `partners` is the partner directory (`getPartners()`).
 */
export function DirectorySection({
  partners,
  copy,
}: {
  partners: Partner[];
  copy: PartnersSections["directory"];
}) {
  const supporters = partners.filter((partner) => partner.tier === "supporter");
  return (
    <Section
      id="our-partners"
      tone="night"
      spacing="lg"
      aria-labelledby="partner-directory-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="partner-directory-title"
          title={<Lines lines={copy.title} />}
          lead={<Lines lines={copy.lead} />}
        />
        <Reveal className="flex flex-col items-center gap-7 md:gap-8">
          {tiers.map((tier, index) => {
            const group = partners.filter((partner) => partner.tier === tier);
            return (
              <PartnerTier
                key={`${tier}:${rosterKey(group)}`}
                tier={tier}
                partners={group}
                index={index}
              />
            );
          })}
        </Reveal>
        <PartnerSupporters
          key={rosterKey(supporters)}
          partners={supporters}
          title={copy.supportersTitle}
        />
      </Container>
    </Section>
  );
}
