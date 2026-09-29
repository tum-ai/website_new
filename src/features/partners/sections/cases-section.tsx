import {
  Container,
  CountUp,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { PartnerCaseStudy, PartnersSections } from "../data/partners";
import { ContactRow } from "./contact-row";
import { Lines } from "./lines";

/**
 * Partner outcomes as ruled rows, one per case: the photo, the partner and
 * its measured outcome set large, then what happened in their words. A
 * booking row closes the band.
 */
export function CasesSection({
  caseStudies,
  copy,
}: {
  caseStudies: readonly PartnerCaseStudy[];
  copy: PartnersSections["cases"];
}) {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="partner-cases-title">
      <Container>
        <SectionHeader
          id="partner-cases-title"
          title={<Lines lines={copy.title} />}
          lead={<Lines lines={copy.lead} />}
        />
        <ul className="border-hairline-strong border-t">
          {caseStudies.map((study) => (
            <Reveal
              as="li"
              key={study.name}
              className="grid gap-x-10 gap-y-7 border-hairline border-b py-10 last:border-b-0 md:grid-cols-12 md:items-start lg:py-12"
            >
              <Photo
                src={study.image}
                alt={study.alt}
                aspect="3/2"
                position={study.imagePosition}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="md:col-span-5 md:max-lg:row-span-2 lg:col-span-4"
              />
              <div className="md:col-span-7 lg:col-span-3">
                <h3 className="font-semibold text-highlight text-small">
                  {study.name}
                </h3>
                <p className="tabular mt-3 text-fg text-stat-xl">
                  <CountUp value={study.metric} />
                </p>
              </div>
              <div className="md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-8">
                <p className="text-fg text-heading-md">{study.label}</p>
                <blockquote className="mt-5 text-body text-fg-muted">
                  <p>{study.copy}</p>
                  {study.attribution ? (
                    <cite className="mt-4 block font-medium text-fg text-meta not-italic">
                      {study.attribution}
                    </cite>
                  ) : null}
                </blockquote>
              </div>
            </Reveal>
          ))}
        </ul>
        <ContactRow title={copy.contact} bookingFirst />
      </Container>
    </Section>
  );
}
