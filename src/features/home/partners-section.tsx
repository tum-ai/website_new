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
import { testimonialCards } from "@/features/e-lab";
import {
  getHighlightedPartners,
  getPartnerCaseStudies,
  getPartnerDirectory,
  symbolOnlyLogos,
} from "@/features/partners";
import { partnerQuoteId } from "./data/homepage";

/**
 * Gold, silver and bronze partners in the partner page's order, from the
 * static defaults so the home page stays prerendered without a CMS request.
 */
const partnerLogos = getHighlightedPartners(getPartnerDirectory([])).map(
  (partner) => ({
    name: partner.name,
    src: partner.image,
    // Symbol-only artwork: set the name beside it.
    wordmark:
      partner.image && symbolOnlyLogos.has(partner.image)
        ? partner.name
        : undefined,
  }),
);

/**
 * The partner case on mist: a venture investor's quote, three measured
 * outcomes, then every current partner. Ends with the partner calls to
 * action. The outcomes come from the partners content slice (the CMS or
 * the code).
 */
export async function PartnersSection() {
  const caseStudies = await getPartnerCaseStudies();
  const quote = testimonialCards.find((card) => card.id === partnerQuoteId);
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
          title="Partners who build with us"
          size="lg"
          layout="stack"
          lead="Research labs, scale-ups and global technology companies work with TUM.ai to meet talent, set real challenges and back new ventures."
          actions={
            <>
              <ButtonLink href="/partners#partner-contact">
                Become a Partner
              </ButtonLink>
              <ButtonLink href="/partners" variant="outline" arrow>
                How partnerships work
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
                portrait={{ src: quote.portraitSrc, alt: "" }}
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
