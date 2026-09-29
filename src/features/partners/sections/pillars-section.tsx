import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Container,
  CountUp,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { PartnerPillar } from "../data/partners";

/** Research, venture and hackathons: one linked card per pillar with its headline figure. */
export function PillarsSection({
  pillars,
}: {
  pillars: readonly PartnerPillar[];
}) {
  return (
    <Section tone="paper" aria-labelledby="partner-pillars-title">
      <Container>
        <SectionHeader
          id="partner-pillars-title"
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
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 90} className="h-full">
              <article className="group/zoom relative flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-raised shadow-soft transition-[translate,box-shadow,border-color] duration-500 ease-brand hover:border-hairline-strong hover:shadow-lift motion-safe:hover:-translate-y-1 md:max-lg:grid md:max-lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-sunken md:max-lg:aspect-auto md:max-lg:min-h-64">
                  <Image
                    src={pillar.image.src}
                    alt={pillar.image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                    style={
                      pillar.image.objectPosition
                        ? { objectPosition: pillar.image.objectPosition }
                        : undefined
                    }
                    className="zoom-media object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  {/* The title link stretches over the whole card. */}
                  <Link
                    href={pillar.href}
                    className="flex items-center justify-between gap-3 text-fg outline-none after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:after:outline-3 focus-visible:after:outline-violet-500 focus-visible:after:outline-offset-4"
                  >
                    <h3 className="text-heading-md">{pillar.title}</h3>
                    <ArrowUpRight
                      aria-hidden
                      className="size-5 shrink-0 text-highlight transition-transform duration-500 ease-brand group-hover/zoom:translate-x-0.5 group-hover/zoom:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </Link>
                  <p className="mt-6 flex items-baseline gap-2.5">
                    <strong className="text-fg text-stat-sm">
                      <CountUp value={pillar.metric} />
                    </strong>
                    <span className="font-medium text-highlight text-meta">
                      {pillar.metricLabel}
                    </span>
                  </p>
                  <p className="mt-5 text-fg-muted text-small">
                    {pillar.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
