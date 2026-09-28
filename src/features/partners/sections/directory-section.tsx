import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import type { Partner } from "@/lib/types";
import { getPartnerKey } from "../partner-directory";
import { PartnerSupporters } from "../partner-supporters";
import { PartnerTier } from "../partner-tier";

const tiers = ["gold", "silver", "bronze"] as const;

/** Company keys of a group, so a changed roster remounts its rotation. */
const rosterKey = (partners: Partner[]) =>
  partners.map((partner) => getPartnerKey(partner.name)).join(",");

/**
 * "The company we keep": the gold, silver and bronze rows and the supporter
 * board. `partners` is the merged directory (CMS over the launch defaults).
 */
export function DirectorySection({ partners }: { partners: Partner[] }) {
  const supporters = partners.filter((partner) => partner.tier === "supporter");
  return (
    <Section
      id="our-partners"
      tone="night"
      grain
      aria-labelledby="partner-directory-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="partner-directory-title"
          title={
            <>
              The company
              <br />
              we keep.
            </>
          }
          lead={
            <>
              Meet the partners helping
              <br />
              the next generation build.
            </>
          }
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
        <PartnerSupporters key={rosterKey(supporters)} partners={supporters} />
      </Container>
    </Section>
  );
}
