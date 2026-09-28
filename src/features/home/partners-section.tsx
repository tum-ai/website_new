import Image from "next/image";
import {
  Aurora,
  BrandMark,
  ButtonLink,
  Container,
  Highlight,
  Marquee,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
  getPartnershipEmailUrl,
  marqueeLogos,
} from "@/features/partners";

/** Icon-only marks that need the partner name beside them to read. */
const LOCKUP_KEYS = new Set(["mutagent", "dryft"]);

/**
 * Gold, silver and bronze partners in the partner page's order, paired with
 * the artwork verified for dark bands. Built from the static defaults, so the
 * home page stays prerendered without a CMS request.
 */
const partnerLogos = getHighlightedPartners(getPartnerDirectory([])).map(
  (partner) => {
    const key = getPartnerKey(partner.name);
    return { key, name: partner.name, image: marqueeLogos[key] };
  },
);

/**
 * Partner teaser on ink: the sponsorship pitch beside a photo, then a
 * full-bleed rail of partner logos.
 */
export function PartnersSection() {
  return (
    <Section
      tone="ink"
      spacing="lg"
      grain
      id="partners"
      aria-labelledby="partners-title"
      className="overflow-clip"
    >
      <Aurora intensity="subtle" />
      <BrandMark className="absolute -top-[12%] -right-[22%] -z-10 w-[min(60rem,95%)] text-white/[0.03]" />

      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-20">
        <SectionHeader
          id="partners-title"
          eyebrow="Partners"
          index={3}
          layout="stack"
          className="lg:order-2 lg:col-span-6"
          title={
            <>
              Join <Highlight variant="fade">TUM.ai</Highlight> as a sponsor or
              cooperation partner.
            </>
          }
          lead="Get access to our exclusive pre-selected talent pool of qualified Software/Data Engineers and AI Strategists."
          actions={
            <>
              <ButtonLink href={getPartnershipEmailUrl()}>
                Become a Partner
              </ButtonLink>
              <ButtonLink href="/partners" variant="inverse" arrow>
                View Our Partners
              </ButtonLink>
            </>
          }
        />
        <Reveal variant="scale" className="lg:order-1 lg:col-span-6">
          <div className="group/zoom relative aspect-[3/2] overflow-hidden rounded-4xl bg-sunken">
            <Image
              src="/assets/partners_pic.webp"
              alt="Presentation at a TUM.ai event"
              fill
              sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 48vw, 100vw"
              className="zoom-media object-cover"
            />
          </div>
        </Reveal>
      </Container>

      <Container className="mt-20 border-hairline border-t md:mt-28" />
      <Marquee
        label="Partners"
        duration={partnerLogos.length * 3.5}
        gap={1}
        className="mt-10 md:mt-12"
      >
        {partnerLogos.map((logo) => (
          <div
            key={logo.key}
            className="flex h-12 w-36 items-center justify-center opacity-80 transition-opacity duration-300 hover:opacity-100 md:w-44"
          >
            {logo.image && LOCKUP_KEYS.has(logo.key) ? (
              <span className="flex items-center gap-2.5 text-fg text-heading-sm">
                <Image
                  src={logo.image}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                />
                {logo.name}
              </span>
            ) : logo.image ? (
              <Image
                src={logo.image}
                alt={logo.name}
                width={160}
                height={40}
                className="h-8 w-auto max-w-34 object-contain md:h-9 md:max-w-38"
              />
            ) : (
              <span className="text-fg text-heading-sm">{logo.name}</span>
            )}
          </div>
        ))}
      </Marquee>
    </Section>
  );
}
