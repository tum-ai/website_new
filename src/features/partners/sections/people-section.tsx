import { Globe2 } from "lucide-react";
import {
  Aurora,
  BrandMark,
  Container,
  CountUp,
  LogoTile,
  PersonCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { officialMembers, organizationFacts } from "@/config/organization";
import type { AlumniDestination } from "../data/partner-logos";
import type { PartnerProfile } from "../data/partners";

/** The members: three profiles, the member count and where alumni go. */
export function PeopleSection({
  profiles,
  alumniDestinations,
}: {
  profiles: readonly PartnerProfile[];
  alumniDestinations: readonly AlumniDestination[];
}) {
  return (
    <Section tone="lavender" aria-labelledby="partner-people-title">
      <Container>
        <SectionHeader
          id="partner-people-title"
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
          {profiles.map((profile, index) => (
            <Reveal key={profile.name} delay={index * 90}>
              <PersonCard
                name={profile.name}
                byline={profile.role}
                image={{ src: profile.image }}
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
              className="relative isolate flex h-full min-h-72 flex-col items-start overflow-clip rounded-3xl p-5 sm:p-7"
            >
              <Aurora intensity="subtle" />
              <BrandMark
                className="absolute -right-[30%] -bottom-[18%] -z-10 w-[120%]"
                intensity="soft"
              />
              <Globe2
                aria-hidden
                className="mb-auto size-8 text-highlight"
                strokeWidth={1.3}
              />
              <strong className="mt-8 text-fg text-stat-lg">
                <CountUp value={`+${officialMembers}`} />
              </strong>
              <h3 className="mt-2.5 text-fg text-heading-sm">
                top tier individuals
              </h3>
              <p className="mt-6 text-fg-muted text-small">
                {organizationFacts.majors}+ majors
                <br />
                {organizationFacts.universities}+ universities
              </p>
              <span className="mt-6 text-fg-subtle text-meta">
                Different backgrounds.
                <br />
                Shared ambition.
              </span>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-16 border-hairline border-t pt-8 md:mt-20 md:pt-10">
          <h3 className="text-center text-eyebrow text-fg-muted">
            Where they go afterwards
          </h3>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
            {alumniDestinations.map((company) => (
              <li key={company.name} className="flex">
                <LogoTile
                  variant="chip"
                  fixed
                  name={company.name}
                  src={company.image}
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
