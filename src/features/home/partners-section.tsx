import {
  ButtonLink,
  Container,
  Ledger,
  type LedgerItem,
  LogoWall,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import { getTestimonialCards } from "@/features/e-lab/server";
import { getHighlightedPartners } from "@/features/partners";
import { getPartnerCaseStudies } from "@/features/partners/server";
import type { Partner } from "@/lib/types";
import type { HomeCopy } from "./data/homepage";

/** Gold, silver and bronze partners in the partner page's order. */
const partnerLogosOf = (partners: Partner[]) =>
  getHighlightedPartners(partners).map((partner) => ({
    name: partner.name,
    src: partner.image,
    // Symbol-only artwork: set the name beside it.
    wordmark: partner.image && partner.symbolOnly ? partner.name : undefined,
  }));

/**
 * The partner case on mist: a venture investor's quote, three measured
 * outcomes, then every current partner. Ends with the partner calls to
 * action. The copy picks the quote; the quote and the outcomes come from the
 * E-Lab and partners content slices (the CMS or the code).
 */
export async function PartnersSection({
  copy,
  partners,
}: {
  copy: HomeCopy["partners"];
  /** Every partner in directory order (`getPartners()`). */
  partners: Partner[];
}) {
  const [cards, caseStudies] = await Promise.all([
    getTestimonialCards(),
    getPartnerCaseStudies(),
  ]);
  const partnerLogos = partnerLogosOf(partners);
  const quote = cards.find((card) => card.id === copy.quote);
  /** What partners got out of working with TUM.ai, as ledger rows. */
  const outcomes: LedgerItem[] = caseStudies.map((study) => ({
    label: study.name,
    value: study.metric,
    note: study.summary,
  }));
  return (
    <Section
      tone="mist"
      spacing="xl"
      id="partners"
      aria-labelledby="partners-title"
    >
      <Container>
        <SectionHeader
          id="partners-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={copy.lead}
          actions={
            <>
              <ButtonLink href="/partners#partner-contact">
                {callToActionLabels.partner}
              </ButtonLink>
              <ButtonLink href="/partners" variant="outline" arrow>
                {copy.moreLabel}
              </ButtonLink>
            </>
          }
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          {quote ? (
            <Reveal className="lg:col-span-7">
              <QuoteCard
                variant="editorial"
                quote={quote.quote}
                name={quote.name}
                byline={quote.role}
                portrait={{
                  src: quote.portraitSrc,
                  alt: "",
                  position: quote.portraitPosition,
                }}
                logo={{
                  src: quote.organizationLogoSrc,
                  alt: quote.organizationLogoAlt,
                }}
                className="max-w-3xl"
              />
            </Reveal>
          ) : null}
          <Reveal delay={120} className="lg:col-span-4 lg:col-start-9">
            <Ledger items={outcomes} />
          </Reveal>
        </div>

        <Reveal className="mt-20 md:mt-28">
          <LogoWall
            logos={partnerLogos}
            columns={6}
            size="md"
            label="TUM.ai partners"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
