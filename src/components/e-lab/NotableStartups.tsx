import { ArrowUpRight } from "lucide-react";

import { Container, Reveal, Section, SectionHeader } from "@/components/ds";
import {
  type NotableStartup,
  notableStartups,
} from "@/data/e-lab/venture-page";

/**
 * White logo tile linking to the startup. Unlike the DS LogoTile it can show
 * a symbol logo together with its wordmark (`wordmarkLabel`). Logos rest in
 * greyscale and take their color on hover and focus.
 */
function StartupTile({ startup }: { startup: NotableStartup }) {
  return (
    <a
      href={startup.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${startup.name} (opens in a new tab)`}
      className="group/logo relative flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 ring-1 ring-ink-200/70 transition-[background-color,box-shadow,translate] duration-500 ease-brand hover:-translate-y-1 hover:bg-violet-50 hover:shadow-soft hover:ring-2 hover:ring-violet-500 focus-visible:bg-violet-50 motion-reduce:hover:translate-y-0 sm:flex-row sm:gap-3 sm:px-6 md:h-32"
    >
      <img
        src={startup.logoSrc}
        alt={startup.logoAlt}
        loading="lazy"
        decoding="async"
        className="max-h-9 w-auto min-w-0 max-w-full object-contain mix-blend-multiply grayscale transition-[filter] duration-500 ease-brand group-hover/logo:grayscale-0 group-focus-visible/logo:grayscale-0 sm:max-h-10 sm:max-w-[9rem] md:max-h-11"
      />
      {startup.wordmarkLabel ? (
        <span className="text-small font-semibold whitespace-nowrap text-violet-950 sm:text-heading-sm">
          {startup.wordmarkLabel}
        </span>
      ) : null}
      <ArrowUpRight
        aria-hidden
        className="absolute top-3 right-3 size-4 text-violet-700 opacity-0 transition-[opacity,translate] duration-500 ease-brand group-hover/logo:translate-x-0.5 group-hover/logo:-translate-y-0.5 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100"
      />
    </a>
  );
}

/** Alumni ventures as a centered logo wall (4 + 3 on wide screens). */
export const NotableStartups = () => {
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="elab-startups-title">
      <Container>
        <SectionHeader
          id="elab-startups-title"
          eyebrow="Alumni ventures"
          index={4}
          title="Notable E-Lab Startups from previous iterations"
          layout="center"
        />
        <ul className="flex flex-wrap justify-center gap-3">
          {notableStartups.map((startup, index) => (
            <Reveal
              as="li"
              key={startup.id}
              delay={index * 60}
              className="min-w-0 basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-2.25rem)/4)]"
            >
              <StartupTile startup={startup} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
};
