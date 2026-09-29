import Image from "next/image";
import {
  Container,
  CountUp,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { PartnerCaseStudy } from "../data/partners";
import { ContactRow } from "./contact-row";

/** Partner testimonials: one outcome figure and quote per case, then a booking row. */
export function CasesSection({
  caseStudies,
}: {
  caseStudies: readonly PartnerCaseStudy[];
}) {
  return (
    <Section tone="paper" aria-labelledby="partner-cases-title">
      <Container>
        <SectionHeader
          id="partner-cases-title"
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
          {caseStudies.map((study, index) => (
            <Reveal key={study.name} delay={index * 90} className="h-full">
              <article className="group/zoom flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-raised shadow-soft md:max-lg:grid md:max-lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="relative aspect-[2/1] overflow-hidden bg-sunken md:max-lg:aspect-auto md:max-lg:min-h-64">
                  <Image
                    src={study.image}
                    alt={study.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                    style={{ objectPosition: study.imagePosition }}
                    className="zoom-media object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <h3 className="text-eyebrow text-highlight">{study.name}</h3>
                  <div className="mt-5 text-fg text-stat-lg">
                    <CountUp value={study.metric} />
                  </div>
                  <p className="mt-4 font-semibold text-body text-fg lg:max-xl:min-h-[2lh]">
                    {study.label}
                  </p>
                  <blockquote className="mt-5 border-violet-500/40 border-l-2 pl-4 text-fg-muted text-small">
                    <p>{study.copy}</p>
                    {study.attribution ? (
                      <cite className="mt-3 flex items-center gap-2.5 font-medium text-highlight text-meta not-italic">
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
        <ContactRow title="Get the same results: book a call." bookingFirst />
      </Container>
    </Section>
  );
}
