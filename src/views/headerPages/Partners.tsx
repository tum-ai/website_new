import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Globe2,
  Network,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  BookingLink,
  ContactActions,
  HeroContact,
} from "@/components/partners/ContactActions";
import PartnerLogo from "@/components/partners/PartnerLogo";
import { PartnershipProvider } from "@/components/partners/PartnershipContext";
import PartnershipFinder from "@/components/partners/PartnershipFinder";
import { Button } from "@/components/ui/button";
import { alumniDestinations, featuredPartners } from "@/data/partner-logos";
import {
  partnerCaseStudies,
  partnerPillars,
  partnerProfiles,
  partnerReasons,
  partnerStats,
} from "@/data/partners";
import { getPartnerDirectory, getPartnerKey } from "@/lib/partner-directory";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import "@/styles/partners.css";

const reasonIcons = [Users, BriefcaseBusiness, Network];

function PartnerTile({
  partner,
  compact = false,
}: {
  partner: Partner;
  compact?: boolean;
}) {
  const href = getSafeExternalUrl(partner.link);
  const logo = <PartnerLogo name={partner.name} image={partner.image} />;
  const content =
    partner.image === "/assets/partners/logos/mutagent.svg" ? (
      <span className="partner-logo-lockup">
        {logo}
        <span>{partner.name}</span>
      </span>
    ) : (
      logo
    );
  const className = `partner-logo-tile${compact ? " partner-logo-tile-compact" : ""}`;
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Visit ${partner.name}`}
    >
      {content}
      <ArrowUpRight
        size={14}
        className="partner-logo-link-icon"
        aria-hidden="true"
      />
    </a>
  ) : (
    <div className={className}>{content}</div>
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
      <main className="partners-page">
        <section className="partner-hero" aria-labelledby="partner-hero-title">
          <div className="partner-container partner-hero-layout">
            <div className="partner-hero-copy">
              <p className="partner-hero-intro">
                The next generation doesn’t wait.
              </p>
              <h1 id="partner-hero-title">
                Meet the
                <br />
                cracked &amp;
                <br />
                the curious
              </h1>
              <p className="partner-hero-description">
                Germany&apos;s largest AI student initiative. Partner with the
                people building Europe&apos;s next AI companies.
              </p>
              <div className="partner-hero-actions">
                <HeroContact />
                <Button
                  asChild
                  variant="outline"
                  data-tone="outline"
                  className="partner-button"
                >
                  <a href="#find-your-fit">
                    Find your fit
                    <ArrowDown size={18} />
                  </a>
                </Button>
              </div>
              <div className="partner-hero-links">
                <BookingLink />
                <a href="#our-partners" className="partner-text-link">
                  See our partners <ArrowDown size={15} />
                </a>
              </div>
            </div>
            <figure className="partner-hero-photo">
              <Image
                src="/assets/partners_pic.webp"
                alt="A TUM.ai member presenting to partners and the community"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, (min-width: 768px) 40vw, 100vw"
              />
              <figcaption>
                <span>
                  Ideas become companies.
                  <br />
                  People make it happen.
                </span>
                <span className="partner-photo-signature">TUM.ai</span>
              </figcaption>
            </figure>
          </div>
          <div className="partner-container partner-trust-strip">
            <p>In good company.</p>
            <div>
              {featuredPartners.slice(0, 3).map((partner) => (
                <span key={partner.id}>
                  <PartnerLogo
                    name={partner.name}
                    image={partner.image}
                    eager
                  />
                </span>
              ))}
            </div>
            <a href="#our-partners">
              Meet our partners
              <ArrowDown size={16} />
            </a>
          </div>
        </section>
        <PartnershipFinder />
        <section
          className="partner-reasons partner-section"
          aria-labelledby="partner-reasons-title"
        >
          <div className="partner-container">
            <div className="partner-section-heading">
              <h2 id="partner-reasons-title">
                Your next advantage
                <br />
                is already here.
              </h2>
              <p>
                Exceptional talent. Tomorrow’s decision makers. A community
                moving AI forward.
              </p>
            </div>
            <div className="partner-reason-grid">
              {partnerReasons.map((reason, index) => {
                const Icon = reasonIcons[index];
                return (
                  <article className="partner-reason-card" key={reason.name}>
                    <div className="partner-reason-name">
                      <Icon size={22} />
                      <span>{reason.name}</span>
                    </div>
                    <h3>{reason.title}</h3>
                    <p>{reason.description}</p>
                  </article>
                );
              })}
            </div>
            <div className="partner-section-contact">
              <h3>Let’s talk.</h3>
              <ContactActions />
            </div>
          </div>
        </section>
        <section
          className="partner-proof"
          aria-labelledby="partner-proof-title"
        >
          <div className="partner-container">
            <h2 id="partner-proof-title">
              Small acceptance rate. Outsized potential.
            </h2>
            <dl className="partner-stat-grid">
              {partnerStats.map((stat) => (
                <div key={stat.value}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                  {"detail" in stat ? <span>{stat.detail}</span> : null}
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section
          className="partner-pillars partner-section"
          aria-labelledby="partner-pillars-title"
        >
          <div className="partner-container">
            <div className="partner-section-heading">
              <h2 id="partner-pillars-title">
                Three pillars.
                <br />
                One ecosystem.
              </h2>
              <p>
                From the first research question to the next venture. Find your
                place at every stage.
              </p>
            </div>
            <div className="partner-pillar-grid">
              {partnerPillars.map((pillar) => (
                <article className="partner-pillar-card" key={pillar.title}>
                  <div className="partner-pillar-photo">
                    <Image
                      src={pillar.image}
                      alt={pillar.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                  <div className="partner-pillar-content">
                    <Link href={pillar.href} className="partner-pillar-title">
                      <h3>{pillar.title}</h3>
                      <ArrowUpRight size={22} />
                    </Link>
                    <p className="partner-pillar-metric">
                      <strong>{pillar.metric}</strong>
                      <span>{pillar.metricLabel}</span>
                    </p>
                    <p>{pillar.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="partner-people partner-section"
          aria-labelledby="partner-people-title"
        >
          <div className="partner-container">
            <div className="partner-section-heading">
              <h2 id="partner-people-title">The cracked 2%.</h2>
              <p>
                Meet the people who turn
                <br />
                “what if” into what’s next.
              </p>
            </div>
            <div className="partner-profile-grid">
              {partnerProfiles.map((profile) => (
                <article className="partner-profile" key={profile.name}>
                  <div className="partner-profile-photo">
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 100vw"
                      style={{ objectPosition: profile.position }}
                    />
                  </div>
                  <h3>{profile.name}</h3>
                  <p>{profile.role}</p>
                  {profile.detail ? <span>{profile.detail}</span> : null}
                </article>
              ))}
              <div className="partner-profile-community">
                <Globe2 size={34} strokeWidth={1.3} />
                <strong>+1000</strong>
                <h3>top tier individuals</h3>
                <p>
                  20+ majors
                  <br />
                  30+ universities
                </p>
                <span>
                  Different backgrounds.
                  <br />
                  Shared ambition.
                </span>
              </div>
            </div>
            <div className="partner-destinations">
              <h3>Where they go afterwards</h3>
              <div>
                {alumniDestinations.map((company) => (
                  <span key={company.name}>
                    <PartnerLogo {...company} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section
          id="our-partners"
          className="partner-directory partner-section"
          aria-labelledby="partner-directory-title"
        >
          <div className="partner-container">
            <div className="partner-section-heading">
              <h2 id="partner-directory-title">
                The company
                <br />
                we keep.
              </h2>
              <p>
                Meet the partners helping
                <br />
                the next generation build.
              </p>
            </div>
            <div className="partner-featured-wall">
              {(["gold", "silver", "bronze"] as const).map((tier, index) => {
                const group = partners.filter(
                  (partner) => partner.tier === tier,
                );
                return group.length ? (
                  <div
                    className={`partner-logo-row partner-logo-row-${index + 1}`}
                    key={tier}
                  >
                    {group.map((partner) => (
                      <PartnerTile
                        key={getPartnerKey(partner.name)}
                        partner={partner}
                      />
                    ))}
                  </div>
                ) : null;
              })}
            </div>
            {supporters.length ? (
              <div className="partner-supporters">
                <h3>Supporters of the vision</h3>
                <div className="partner-supporter-grid">
                  {supporters.map((partner) => (
                    <PartnerTile
                      key={getPartnerKey(partner.name)}
                      partner={partner}
                      compact
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
        <section
          className="partner-cases partner-section"
          aria-labelledby="partner-cases-title"
        >
          <div className="partner-container">
            <div className="partner-section-heading">
              <h2 id="partner-cases-title">
                Real partnerships.
                <br />
                Real outcomes.
              </h2>
              <p>
                Good conversations are a start.
                <br />
                Here’s what comes after.
              </p>
            </div>
            <div className="partner-case-grid">
              {partnerCaseStudies.map((study) => (
                <article
                  className={`partner-case-card${study.name === "Osapiens" ? " partner-case-brand" : ""}`}
                  key={study.name}
                >
                  <div className="partner-case-image">
                    <Image
                      src={study.image}
                      alt={study.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      style={{ objectPosition: study.imagePosition }}
                    />
                  </div>
                  <div className="partner-case-content">
                    <h3>{study.name}</h3>
                    <div className="partner-case-metric">{study.metric}</div>
                    <p className="partner-case-label">{study.label}</p>
                    <blockquote>
                      <p>{study.copy}</p>
                      {"attribution" in study ? (
                        <cite>— {study.attribution}</cite>
                      ) : null}
                    </blockquote>
                  </div>
                </article>
              ))}
            </div>
            <div className="partner-section-contact">
              <h3>Get the same results — book a call.</h3>
              <ContactActions bookingFirst />
            </div>
          </div>
        </section>
        <section
          id="partner-contact"
          className="partner-final"
          aria-labelledby="partner-final-title"
        >
          <div className="partner-container">
            <div className="partner-final-mark" aria-hidden="true">
              <ArrowUpRight size={72} strokeWidth={1} />
            </div>
            <h2 id="partner-final-title">
              Let&apos;s build
              <br />
              something big!
            </h2>
            <p>
              The next chapter of AI starts with the right people.
              <br />
              Let’s bring yours and ours together.
            </p>
            <ContactActions bookingFirst emailLabel="Email us" />
          </div>
        </section>
      </main>
    </PartnershipProvider>
  );
}
