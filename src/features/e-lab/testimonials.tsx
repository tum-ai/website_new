import {
  Aurora,
  Container,
  LogoTile,
  Marquee,
  QuoteCard,
  Section,
  SectionHeader,
  Tag,
} from "@/components/ds";
import { type TestimonialCard, testimonialCards } from "./data/venture-page";

/**
 * How each organization is shown, so the row never repeats what the logo
 * already says: wordmark logos stand alone, symbol-only logos get their name
 * set inside the chip as a lockup, and only information the logo lacks
 * (batch, program status, product line) stays outside as a short qualifier.
 * Testimonials not listed here fall back to logo plus full label.
 */
const organizationDisplay: Record<
  string,
  { logoSrc?: string; lockupName?: string; qualifier?: string }
> = {
  "leon-hergert": { lockupName: "Y Combinator", qualifier: "S24" },
  "benedikt-wieser": { lockupName: "CDTM", qualifier: "Alumni" },
  "leonardo-benini": { qualifier: "Fellow" },
  "oliver-schoppe": {},
  "viktor-shen": {},
  "axel-taeubert": {
    logoSrc: "/assets/partners/logos/google.webp",
    qualifier: "Cloud",
  },
  "alexandra-reinert": {},
};

function OrganizationRow({ testimonial }: { testimonial: TestimonialCard }) {
  const display = organizationDisplay[testimonial.id];
  const qualifier = display ? display.qualifier : testimonial.organizationLabel;
  const standsAlone = display && !display.lockupName && !qualifier;

  return (
    <div className="mt-6 flex items-center gap-3 border-hairline border-t pt-5">
      <LogoTile
        variant="chip"
        eager
        name={testimonial.organizationLabel}
        src={display?.logoSrc ?? testimonial.organizationLogoSrc}
        alt={
          standsAlone
            ? testimonial.organizationLabel
            : testimonial.organizationLogoAlt
        }
        wordmark={display?.lockupName}
        className="shrink-0"
      />
      {qualifier ? (
        <span className="font-medium text-fg-subtle text-meta">
          {qualifier}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Glass testimonial for dark bands: the DS QuoteCard with the cohort as its
 * context tag and the organization row as its footer. Images load eagerly:
 * lazy images in a moving, clipped rail only start loading once they slide
 * into view, which shows as pop-in.
 */
function CommunityQuote({ testimonial }: { testimonial: TestimonialCard }) {
  return (
    <QuoteCard
      variant="glass"
      eager
      quote={testimonial.quote}
      name={testimonial.name}
      byline={testimonial.role}
      portrait={{ src: testimonial.portraitSrc, alt: testimonial.portraitAlt }}
      context={testimonial.context ? <Tag>{testimonial.context}</Tag> : null}
      footer={<OrganizationRow testimonial={testimonial} />}
      className="w-82 max-w-[calc(100vw-3rem)] md:w-100"
    />
  );
}

/** "Our Community": glass quote cards on a slow marquee over the ink band. */
export function Testimonials() {
  return (
    <Section
      tone="ink"
      spacing="md"
      grain
      aria-labelledby="elab-community-title"
      className="overflow-clip"
    >
      <Aurora intensity="subtle" />
      <Container>
        <SectionHeader
          id="elab-community-title"
          eyebrow="Voices"
          index={2}
          title="Our Community"
          lead="Hear more from voices from our network"
        />
      </Container>
      <Marquee
        label="Quotes from E-Lab founders, mentors and investors"
        duration={90}
        gap={1.25}
        itemClassName="self-stretch"
      >
        {testimonialCards.map((testimonial) => (
          <CommunityQuote key={testimonial.id} testimonial={testimonial} />
        ))}
      </Marquee>
    </Section>
  );
}
