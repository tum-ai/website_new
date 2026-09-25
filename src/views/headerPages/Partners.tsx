import {
  ArrowUpRight,
  BriefcaseBusiness,
  Globe2,
  Network,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Aurora,
  BrandMark,
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeader,
  SplitWords,
  SpotlightCard,
  Text,
} from "@/components/ds";
import {
  ContactActions,
  HeroContact,
} from "@/components/partners/ContactActions";
import PartnerLogo from "@/components/partners/PartnerLogo";
import PartnerMarquee from "@/components/partners/PartnerMarquee";
import PartnerSupporters from "@/components/partners/PartnerSupporters";
import { PartnershipProvider } from "@/components/partners/PartnershipContext";
import PartnershipFinder from "@/components/partners/PartnershipFinder";
import PartnerTier from "@/components/partners/PartnerTier";
import StatValue from "@/components/partners/StatValue";
import { alumniDestinations } from "@/data/partner-logos";
import {
  partnerCaseStudies,
  partnerPillars,
  partnerProfiles,
  partnerReasons,
  partnerStats,
} from "@/data/partners";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "@/lib/partner-directory";
import type { Partner } from "@/lib/types";
import "@/styles/partners.css";

const reasonIcons = [Users, BriefcaseBusiness, Network];

/* Anchored sections land below the fixed header (bar bottom ≤ 80px). */
const anchorOffset = "scroll-mt-[110px]";

/* SectionHeader's split layout stacks until lg so two-line titles keep their breaks on tablets. */
const splitHeader =
  "md:flex-col md:items-start md:gap-6 lg:flex-row lg:items-end lg:gap-16";

/* Large hero buttons step down to the md size on phones so both fit one row. */
const heroActionSize = "max-sm:h-11 max-sm:px-5 max-sm:text-[0.9375rem]";

/** "Let’s talk." style closing row under a section's cards. */
function ContactRow({
  title,
  bookingFirst,
}: {
  title: ReactNode;
  bookingFirst?: boolean;
}) {
  return (
    <Reveal className="mt-12 flex flex-col gap-6 border-t border-hairline pt-8 md:mt-16 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <h3 className="text-heading-lg text-fg">{title}</h3>
      <ContactActions bookingFirst={bookingFirst} />
    </Reveal>
  );
}

export default function Partners({
  initialPartners = [],
}: {
  initialPartners?: Partner[];
}) {
  const partners = getPartnerDirectory(initialPartners);
  const supporters = partners.filter((partner) => partner.tier === "supporter");
  return (
    <PartnershipProvider>
      <main>
        <Section
          tone="ink"
          spacing="none"
          grain
          aria-labelledby="partner-hero-title"
          className="overflow-clip pt-[calc(var(--header-height)+clamp(3rem,5vw,4.5rem))] pb-[clamp(2.5rem,5vw,4rem)]"
        >
          <Aurora />
          <BrandMark className="absolute top-[4%] -right-[14%] -z-10 w-[min(64rem,80%)] text-white/[0.035]" />
          <Container>
            <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-stretch md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
              <div className="flex flex-col justify-center">
                <Eyebrow className="motion-safe:animate-rise-sm">
                  The next generation doesn’t wait.
                </Eyebrow>
                <h1
                  id="partner-hero-title"
                  className="mt-6 text-display-xl text-fg"
                >
                  <SplitWords delay={80}>Meet the</SplitWords>
                  <br />
                  <SplitWords delay={220}>cracked &amp;</SplitWords>
                  <br />
                  <SplitWords delay={360}>the curious</SplitWords>
                </h1>
                <Text
                  size="lead"
                  className="mt-7 max-w-md motion-safe:animate-rise-sm [animation-delay:420ms]"
                >
                  Germany&apos;s largest AI student initiative. Partner with the
                  people building Europe&apos;s next AI companies.
                </Text>
                <div className="mt-9 flex flex-wrap items-center gap-3 motion-safe:animate-rise-sm [animation-delay:540ms]">
                  <HeroContact className={heroActionSize} />
                  <ButtonLink
                    href="#find-your-fit"
                    variant="outline"
                    size="lg"
                    arrow="down"
                    className={heroActionSize}
                  >
                    Find your fit
                  </ButtonLink>
                </div>
              </div>
              <figure className="group/hero relative isolate min-h-[18rem] overflow-hidden rounded-signature bg-sunken motion-safe:animate-rise-sm [animation-delay:260ms] md:min-h-[27rem] lg:min-h-[30rem]">
                <Image
                  src="/assets/partners/hero.webp"
                  alt="A speaker presenting to a packed auditorium at a TUM.ai event"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, (min-width: 768px) 40vw, 100vw"
                  className="object-cover object-[center_40%] transition-transform duration-[1.4s] ease-brand group-hover/hero:scale-[1.04] motion-reduce:transition-none md:object-[57%_center]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-ink-950/85"
                />
                <figcaption className="absolute inset-x-6 bottom-6 z-[1] flex items-end justify-between gap-3 text-body font-medium text-white md:inset-x-7 md:bottom-7 lg:text-lead">
                  <span>
                    Ideas become companies.
                    <br />
                    People make it happen.
                  </span>
                  <span className="hidden text-meta text-white/75 lg:inline">
                    TUM.ai
                  </span>
                </figcaption>
              </figure>
            </div>
            <PartnerMarquee partners={getHighlightedPartners(partners)} />
          </Container>
        </Section>

        <PartnershipFinder />

        <Section tone="night" grain aria-labelledby="partner-reasons-title">
          <Container>
            <SectionHeader
              id="partner-reasons-title"
              className={splitHeader}
              title={
                <>
                  Your next advantage
                  <br />
                  is already here.
                </>
              }
              lead="Exceptional talent. Tomorrow’s decision makers. A community moving AI forward."
            />
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              {partnerReasons.map((reason, index) => {
                const Icon = reasonIcons[index];
                return (
                  <Reveal
                    as="article"
                    key={reason.name}
                    delay={index * 90}
                    className="h-full"
                  >
                    <SpotlightCard
                      padding="lg"
                      className="flex h-full flex-col md:max-lg:grid md:max-lg:grid-cols-[12rem_minmax(0,1fr)] md:max-lg:gap-x-10"
                    >
                      <div className="flex items-center gap-3 self-start text-small font-semibold text-highlight">
                        <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/25 ring-inset transition-[background-color,color,rotate] duration-500 ease-brand group-hover/card:-rotate-6 group-hover/card:bg-violet-600 group-hover/card:text-white">
                          <Icon
                            aria-hidden
                            className="size-5"
                            strokeWidth={1.75}
                          />
                        </span>
                        <span>{reason.name}</span>
                      </div>
                      <div className="mt-10 md:max-lg:mt-0 lg:mt-14">
                        <h3 className="text-heading-md text-fg lg:text-heading-lg">
                          {reason.title}
                        </h3>
                        <p className="mt-4 text-small text-fg-muted">
                          {reason.description}
                        </p>
                      </div>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
            <ContactRow title="Let’s talk." />
          </Container>
        </Section>

        <Section
          tone="violet"
          spacing="sm"
          aria-labelledby="partner-proof-title"
        >
          <Container>
            <Reveal>
              <h2 id="partner-proof-title" className="text-heading-md text-fg">
                Small acceptance rate. Outsized potential.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              {/* StatGrid recipe; StatValue keeps the figures verbatim while counting up. */}
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline md:mt-10 lg:grid-cols-4">
                {partnerStats.map((stat) => (
                  <div
                    key={stat.value}
                    className="flex flex-col gap-2 bg-canvas p-4 sm:p-6 md:gap-3 md:p-8"
                  >
                    <dt className="order-2 text-small font-semibold text-fg">
                      {stat.label}
                    </dt>
                    <dd className="order-1 text-[clamp(2.25rem,1.5rem+3vw,4.5rem)] leading-none font-medium tracking-[-0.05em] text-fg">
                      <StatValue value={stat.value} />
                    </dd>
                    {"detail" in stat ? (
                      <dd className="order-3 text-meta text-fg">
                        {stat.detail}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        </Section>

        <Section tone="paper" aria-labelledby="partner-pillars-title">
          <Container>
            <SectionHeader
              id="partner-pillars-title"
              className={splitHeader}
              title={
                <>
                  Three pillars.
                  <br />
                  One ecosystem.
                </>
              }
              lead="From the first research question to the next venture. Find your place at every stage."
            />
            <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
              {partnerPillars.map((pillar, index) => (
                <Reveal
                  key={pillar.title}
                  delay={index * 90}
                  className="h-full"
                >
                  <article className="group/pillar relative flex h-full flex-col overflow-hidden md:max-lg:grid md:max-lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] rounded-3xl border border-hairline bg-raised shadow-soft transition-[translate,box-shadow,border-color] duration-500 ease-brand hover:-translate-y-1 hover:border-hairline-strong hover:shadow-lift motion-reduce:hover:translate-y-0">
                    <div className="relative aspect-[16/10] overflow-hidden bg-sunken md:max-lg:aspect-auto md:max-lg:min-h-64">
                      <Image
                        src={pillar.image}
                        alt={pillar.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                        className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/pillar:scale-[1.045] motion-reduce:transition-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      {/* The title link stretches over the whole card. */}
                      <Link
                        href={pillar.href}
                        className="flex items-center justify-between gap-3 text-fg outline-none after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-violet-500"
                      >
                        <h3 className="text-heading-md">{pillar.title}</h3>
                        <ArrowUpRight
                          aria-hidden
                          className="size-5 shrink-0 text-highlight transition-transform duration-500 ease-brand group-hover/pillar:translate-x-0.5 group-hover/pillar:-translate-y-0.5"
                        />
                      </Link>
                      <p className="mt-6 flex items-baseline gap-2.5">
                        <strong className="text-[2.5rem] leading-none font-medium tracking-[-0.05em] text-fg">
                          <StatValue value={pillar.metric} />
                        </strong>
                        <span className="text-meta font-medium text-highlight">
                          {pillar.metricLabel}
                        </span>
                      </p>
                      <p className="mt-5 text-small text-fg-muted">
                        {pillar.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section tone="lavender" aria-labelledby="partner-people-title">
          <Container>
            <SectionHeader
              id="partner-people-title"
              className={splitHeader}
              title="The cracked 2%."
              lead={
                <>
                  Meet the people who turn
                  <br />
                  “what if” into what’s next.
                </>
              }
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
              {partnerProfiles.map((profile, index) => (
                <Reveal key={profile.name} delay={index * 90}>
                  {/* PersonCard recipe; the lossless portraits bypass image optimization. */}
                  <article className="group/person">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sunken">
                      <Image
                        src={profile.image}
                        alt={profile.name}
                        unoptimized
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 100vw"
                        style={{ objectPosition: profile.position }}
                        className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/person:scale-[1.04] motion-reduce:transition-none"
                      />
                    </div>
                    <h3 className="mt-4 text-heading-sm text-fg">
                      {profile.name}
                    </h3>
                    <p className="mt-0.5 text-small text-fg-muted">
                      {profile.role}
                    </p>
                    {profile.detail ? (
                      <span className="mt-1 block text-meta text-fg-subtle">
                        {profile.detail}
                      </span>
                    ) : null}
                  </article>
                </Reveal>
              ))}
              <Reveal delay={partnerProfiles.length * 90} className="h-full">
                <div
                  data-tone="ink"
                  className="relative isolate flex h-full min-h-[18rem] flex-col items-start overflow-clip rounded-3xl p-5 sm:p-7"
                >
                  <Aurora intensity="subtle" />
                  <BrandMark className="absolute -right-[30%] -bottom-[18%] -z-10 w-[120%] text-white/[0.04]" />
                  <Globe2
                    aria-hidden
                    className="mb-auto size-8 text-highlight"
                    strokeWidth={1.3}
                  />
                  <strong className="mt-8 text-[clamp(2.5rem,1.6rem+2.6vw,4rem)] leading-none font-medium tracking-[-0.06em] text-fg">
                    <StatValue value="+1000" />
                  </strong>
                  <h3 className="mt-2.5 text-heading-sm text-fg">
                    top tier individuals
                  </h3>
                  <p className="mt-6 text-small text-fg-muted">
                    20+ majors
                    <br />
                    30+ universities
                  </p>
                  <span className="mt-6 text-meta text-fg-subtle">
                    Different backgrounds.
                    <br />
                    Shared ambition.
                  </span>
                </div>
              </Reveal>
            </div>
            <Reveal className="mt-16 border-t border-hairline pt-8 md:mt-20 md:pt-10">
              <h3 className="text-center text-eyebrow text-fg-muted uppercase">
                Where they go afterwards
              </h3>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
                {alumniDestinations.map((company) => (
                  <span
                    key={company.name}
                    className="flex h-11 w-[6.2rem] items-center justify-center rounded-xl bg-white px-2.5 py-2.5 ring-1 ring-ink-200/70 sm:h-12 sm:w-[7.8rem] sm:px-3.5"
                  >
                    <PartnerLogo {...company} />
                  </span>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>

        <Section
          id="our-partners"
          tone="night"
          grain
          aria-labelledby="partner-directory-title"
          className={anchorOffset}
        >
          <Container>
            <SectionHeader
              id="partner-directory-title"
              className={splitHeader}
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
              {(["gold", "silver", "bronze"] as const).map((tier, index) => {
                const group = partners.filter(
                  (partner) => partner.tier === tier,
                );
                return (
                  <PartnerTier
                    key={`${tier}:${group.map((partner) => getPartnerKey(partner.name)).join(",")}`}
                    tier={tier}
                    partners={group}
                    index={index}
                  />
                );
              })}
            </Reveal>
            <PartnerSupporters
              key={supporters
                .map((partner) => getPartnerKey(partner.name))
                .join(",")}
              partners={supporters}
            />
          </Container>
        </Section>

        <Section tone="paper" aria-labelledby="partner-cases-title">
          <Container>
            <SectionHeader
              id="partner-cases-title"
              className={splitHeader}
              title={
                <>
                  Real partnerships.
                  <br />
                  Real outcomes.
                </>
              }
              lead={
                <>
                  Good conversations are a start.
                  <br />
                  Here’s what comes after.
                </>
              }
            />
            <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
              {partnerCaseStudies.map((study, index) => (
                <Reveal key={study.name} delay={index * 90} className="h-full">
                  <article className="group/case flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-raised shadow-soft md:max-lg:grid md:max-lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div className="relative aspect-[2/1] overflow-hidden bg-sunken md:max-lg:aspect-auto md:max-lg:min-h-64">
                      <Image
                        src={study.image}
                        alt={study.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                        style={{ objectPosition: study.imagePosition }}
                        className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/case:scale-[1.045] motion-reduce:transition-none"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <h3 className="text-eyebrow text-highlight uppercase">
                        {study.name}
                      </h3>
                      <div className="mt-5 text-[clamp(3rem,2.4rem+1.8vw,4rem)] leading-none font-medium tracking-[-0.06em] text-fg">
                        <StatValue value={study.metric} />
                      </div>
                      <p className="mt-4 text-body font-semibold text-fg lg:max-xl:min-h-[3.4em]">
                        {study.label}
                      </p>
                      <blockquote className="mt-5 border-l-2 border-violet-500/40 pl-4 text-small text-fg-muted">
                        <p>{study.copy}</p>
                        {"attribution" in study ? (
                          <cite className="mt-3 flex items-center gap-2.5 text-meta font-medium text-highlight not-italic">
                            <span
                              aria-hidden
                              className="h-px w-4 shrink-0 bg-current"
                            />
                            {study.attribution}
                          </cite>
                        ) : null}
                      </blockquote>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <ContactRow
              title="Get the same results: book a call."
              bookingFirst
            />
          </Container>
        </Section>

        <Section
          id="partner-contact"
          tone="ink"
          spacing="xl"
          grain
          aria-labelledby="partner-final-title"
          className={`${anchorOffset} overflow-clip`}
        >
          <Aurora />
          <BrandMark className="absolute -bottom-[30%] left-1/2 -z-10 w-[min(70rem,110%)] -translate-x-1/2 text-white/[0.035]" />
          <Container>
            <div className="relative mx-auto max-w-3xl text-center">
              <Reveal variant="scale">
                <div aria-hidden="true" className="inline-block text-highlight">
                  <ArrowUpRight
                    className="size-14 md:size-[4.5rem]"
                    strokeWidth={1}
                  />
                </div>
              </Reveal>
              <Reveal delay={60}>
                <h2
                  id="partner-final-title"
                  className="mt-6 text-display-lg text-fg md:mt-8"
                >
                  Let&apos;s build
                  <br />
                  something big!
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="mx-auto mt-6 max-w-xl text-lead text-fg-muted">
                  The next chapter of AI starts with the right people.
                  <br />
                  Let’s bring yours and ours together.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <ContactActions
                  bookingFirst
                  emailLabel="Email us"
                  size="lg"
                  className="mt-10 justify-center"
                />
              </Reveal>
            </div>
          </Container>
        </Section>
      </main>
    </PartnershipProvider>
  );
}
