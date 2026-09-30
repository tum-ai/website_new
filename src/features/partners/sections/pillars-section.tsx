import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  Container,
  CountUp,
  Photo,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { PartnerPillar, PartnersSections } from "../data/partners";
import { Lines } from "./lines";

/**
 * Research, venture and hackathons: three editorial columns, each a photo,
 * the pillar's name linking to its page, its headline figure and the
 * detail. The name's link covers the whole column, so the photo and the
 * figure are part of the target and show its hover.
 */
export function PillarsSection({
  pillars,
  copy,
}: {
  pillars: readonly PartnerPillar[];
  copy: PartnersSections["pillars"];
}) {
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="partner-pillars-title">
      <Container>
        <SectionHeader
          id="partner-pillars-title"
          title={<Lines lines={copy.title} />}
          lead={copy.lead}
        />
        <ul className="grid gap-x-8 gap-y-14 lg:grid-cols-3 xl:gap-x-10">
          {pillars.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.title}
              delay={index * 100}
              className="group/zoom relative flex flex-col md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:items-start md:max-lg:gap-x-8"
            >
              <Photo
                src={pillar.image.src}
                alt={pillar.image.alt}
                aspect="4/3"
                position={pillar.image.objectPosition}
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
              />
              <div className="mt-7 flex flex-1 flex-col border-hairline-strong border-t pt-5 md:max-lg:mt-0">
                <h3 className="flex items-baseline justify-between gap-3 text-fg text-heading-md">
                  <Link
                    href={pillar.href}
                    className="outline-none after:absolute after:-inset-2 after:z-10 after:rounded-5xl focus-visible:after:outline-3 focus-visible:after:outline-violet-500 focus-visible:after:outline-offset-2"
                  >
                    {pillar.title}
                  </Link>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 shrink-0 text-highlight transition-transform duration-500 ease-brand group-hover/zoom:translate-x-0.5 group-hover/zoom:-translate-y-0.5 motion-reduce:transition-none"
                  />
                </h3>
                <p className="mt-8 flex items-baseline gap-3">
                  <strong className="tabular text-fg text-stat-md">
                    <CountUp value={pillar.metric} />
                  </strong>
                  <span className="font-semibold text-highlight text-small">
                    {pillar.metricLabel}
                  </span>
                </p>
                <p className="mt-5 max-w-md text-fg-muted text-small">
                  {pillar.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
