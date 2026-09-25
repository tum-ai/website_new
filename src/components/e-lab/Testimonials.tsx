import Image from "next/image";

import {
  Aurora,
  Container,
  Marquee,
  Section,
  SectionHeader,
  Tag,
} from "@/components/ds";
import {
  type TestimonialCard,
  testimonialCards,
} from "@/data/e-lab/venture-page";

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
  const logoSrc = display?.logoSrc ?? testimonial.organizationLogoSrc;
  const qualifier = display ? display.qualifier : testimonial.organizationLabel;

  return (
    <div className="mt-6 flex items-center gap-3 border-t border-hairline pt-5">
      <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-white px-3">
        <img
          src={logoSrc}
          alt={
            display && !display.lockupName && !qualifier
              ? testimonial.organizationLabel
              : testimonial.organizationLogoAlt
          }
          decoding="async"
          className="max-h-5 w-auto max-w-28 object-contain"
        />
        {display?.lockupName ? (
          <span className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-violet-950">
            {display.lockupName}
          </span>
        ) : null}
      </span>
      {qualifier ? (
        <span className="text-meta font-medium text-fg-subtle">
          {qualifier}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Glass testimonial for dark bands. Follows the DS QuoteCard, plus the cohort
 * context tag and an organization row (logo on a white chip, since the logo
 * artwork is made for light backgrounds). Images load eagerly:
 * lazy images in a moving, clipped rail only start loading once they slide
 * into view, which shows as pop-in.
 */
function CommunityQuote({ testimonial }: { testimonial: TestimonialCard }) {
  return (
    <figure className="flex h-full w-[min(20.5rem,calc(100vw-3rem))] flex-col rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-inset-hairline md:w-[25rem] md:p-8">
      <div className="flex min-h-7 items-center justify-between gap-4">
        <svg
          aria-hidden
          viewBox="0 0 34 24"
          className="h-6 w-8 shrink-0 text-highlight"
          fill="currentColor"
        >
          <path d="M0 24V14.4C0 6.24 4.32 1.44 12.96 0l1.44 3.36C9.6 4.8 7.2 7.68 7.2 12H13.2V24H0Zm18.8 0V14.4C18.8 6.24 23.12 1.44 31.76 0l1.44 3.36C28.4 4.8 26 7.68 26 12H32V24H18.8Z" />
        </svg>
        {testimonial.context ? <Tag>{testimonial.context}</Tag> : null}
      </div>
      <blockquote className="mt-6 flex-1 text-lead text-fg">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-8">
        <div className="flex items-center gap-4">
          <Image
            src={testimonial.portraitSrc}
            alt={testimonial.portraitAlt}
            width={52}
            height={52}
            loading="eager"
            className="size-13 shrink-0 rounded-full object-cover ring-2 ring-white/15"
          />
          <div className="min-w-0">
            <p className="text-heading-sm text-fg">{testimonial.name}</p>
            <p className="text-meta text-fg-muted">{testimonial.role}</p>
          </div>
        </div>
        <OrganizationRow testimonial={testimonial} />
      </figcaption>
    </figure>
  );
}

/** "Our Community": glass quote cards on a slow marquee over the ink band. */
export const Testimonials = () => {
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
};
