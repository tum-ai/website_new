import {
  Container,
  CountUp,
  LogoWall,
  PersonCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { AlumniDestination } from "../data/partner-logos";
import type { PartnerProfile, PartnersSections } from "../data/partners";
import { Lines } from "./lines";

/**
 * The members: three profiles and the member count on a flat ink panel,
 * then where alumni go as one row of logos at equal visual weight.
 * `members` are the figures from the render's site facts.
 */
export function PeopleSection({
  profiles,
  alumniDestinations,
  members,
  copy,
}: {
  profiles: readonly PartnerProfile[];
  copy: PartnersSections["people"];
  alumniDestinations: readonly AlumniDestination[];
  members: { official: number; majors: number; universities: number };
}) {
  return (
    <Section
      tone="lavender"
      spacing="lg"
      aria-labelledby="partner-people-title"
    >
      <Container>
        <SectionHeader
          id="partner-people-title"
          title={copy.title}
          lead={<Lines lines={copy.lead} />}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {profiles.map((profile, index) => (
            <Reveal key={profile.name} delay={index * 90}>
              <PersonCard
                name={profile.name}
                byline={profile.role}
                image={{ src: profile.image, position: profile.position }}
                sizes="(min-width: 1024px) 25vw, 50vw"
                // The portraits are lossless artwork; serve them as they are.
                unoptimized
              >
                {profile.detail || null}
              </PersonCard>
            </Reveal>
          ))}
          <Reveal delay={profiles.length * 90} className="h-full">
            <div
              data-tone="ink"
              className="flex h-full min-h-72 flex-col rounded-3xl bg-canvas p-5 sm:p-7"
            >
              <strong className="tabular mt-auto text-fg text-stat-lg">
                <CountUp value={`+${members.official}`} />
              </strong>
              <h3 className="mt-3 text-fg text-heading-sm">{copy.statLabel}</h3>
              <p className="mt-6 border-hairline border-t pt-4 text-fg-muted text-small">
                {members.majors}+ majors
                <br />
                {members.universities}+ universities
              </p>
              <span className="mt-4 text-fg-subtle text-meta">
                <Lines lines={copy.tagline} />
              </span>
            </div>
          </Reveal>
        </div>
        {/* Not inside a Reveal: its opacity would isolate the strip, and
            the mono logos' multiply blend needs the band behind them. */}
        <div className="mt-16 border-hairline-strong border-t pt-8 md:mt-20 md:pt-10">
          <h3 className="font-semibold text-fg text-small">
            {copy.alumniTitle}
          </h3>
          <LogoWall
            layout="strip"
            label={copy.alumniTitle}
            className="mt-8 md:mt-10"
            logos={alumniDestinations.map((company) => ({
              name: company.name,
              src: company.image,
              aspectRatio: company.aspectRatio,
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
