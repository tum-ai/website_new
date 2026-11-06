import { Container, Reveal, Section, SectionHeader } from "@tum.ai/ui-kit";
import type { PartnerReason, PartnersSections } from "../data/partners";
import { ContactRow } from "./contact-row";
import { Lines } from "./lines";

/**
 * Why partner: talent, decision makers and reach as three ruled columns on
 * ink, each a label, its claim and the detail, then a contact
 * row. The reasons' icons stay in the data for other surfaces; the band
 * lets the words carry them.
 */
export function ReasonsSection({
  reasons,
  copy,
}: {
  reasons: readonly PartnerReason[];
  copy: PartnersSections["reasons"];
}) {
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="partner-reasons-title">
      <Container>
        <SectionHeader
          id="partner-reasons-title"
          title={<Lines lines={copy.title} />}
          lead={copy.lead}
        />
        <ol className="grid gap-x-10 gap-y-12 md:max-lg:gap-y-14 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal
              as="li"
              key={reason.name}
              delay={index * 100}
              className="grid content-start border-t border-hairline-strong pt-6 md:max-lg:grid-cols-[12rem_minmax(0,1fr)] md:max-lg:gap-x-10"
            >
              <p className="text-small font-semibold text-highlight">
                {reason.name}
              </p>
              <div className="mt-8 md:max-lg:mt-0 lg:mt-12">
                <h3 className="max-w-[16em] text-heading-lg text-fg">
                  {reason.title}
                </h3>
                <p className="mt-5 max-w-md text-small text-fg-muted">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
        <ContactRow title={copy.contact} />
      </Container>
    </Section>
  );
}
