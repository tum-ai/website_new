import { ArrowDown } from "lucide-react";
import Image from "next/image";
import {
  Aurora,
  BrandMark,
  ButtonLink,
  Container,
  Highlight,
  Section,
  SplitWords,
  TopBlend,
} from "@/components/ds";
import { getPartnershipEmailUrl } from "@/lib/partnerships";
import { HeroMosaic } from "./HeroMosaic";

/**
 * Home hero: full-height ink band with the logo, the tagline as the page's
 * `h1`, both calls to action and a scroll cue.
 *
 * Performance contract (test/homepage-performance.test.ts): the logo is the
 * page's only `priority` image, and the photo mosaic is client-only, so the
 * prerendered HTML preloads just `/assets/tum_ai_logo_new.svg`. Everything
 * above the fold animates with CSS, never with hydration-bound reveals.
 */
export function HomeHero() {
  return (
    <Section
      tone="ink"
      spacing="none"
      grain
      aria-labelledby="home-hero-title"
      className="flex min-h-[100svh] flex-col overflow-clip pt-[calc(var(--header-height)+clamp(2.5rem,7vw,5rem))] pb-[clamp(3.5rem,8vw,6.5rem)]"
    >
      <Aurora intensity="vivid" />
      <HeroMosaic />
      <BrandMark className="absolute -bottom-[22%] -left-[18%] -z-10 w-[min(62rem,120%)] text-white/[0.035]" />
      <TopBlend />

      <Container className="flex flex-1 flex-col justify-end">
        <Image
          src="/assets/tum_ai_logo_new.svg"
          alt="TUM.ai"
          width={1640}
          height={406}
          sizes="15rem"
          priority
          className="h-auto w-[clamp(9.5rem,15vw,14rem)] motion-safe:animate-rise-sm"
        />

        <h1
          id="home-hero-title"
          className="mt-8 max-w-[11.5em] text-display-2xl font-light text-fg max-sm:text-[clamp(2.3rem,11.4vw,3.25rem)] md:mt-10"
        >
          <SplitWords delay={140} step={60}>
            Germany’s leading student initiative focused on{" "}
            <Highlight variant="fade" className="font-medium">
              Artificial
            </Highlight>{" "}
            <Highlight variant="fade" className="font-medium">
              Intelligence.
            </Highlight>
          </SplitWords>
        </h1>

        {/* Calls to action and the scroll cue share one row and centre line. */}
        <div className="mt-10 flex items-center justify-between gap-8 md:mt-12">
          <div className="grid w-full gap-3 motion-safe:animate-rise-sm [animation-delay:760ms] sm:flex sm:w-auto sm:flex-wrap">
            <ButtonLink href={getPartnershipEmailUrl()} size="lg">
              Become a Partner
            </ButtonLink>
            <ButtonLink href="/apply" size="lg" variant="inverse" arrow>
              Become a Member
            </ButtonLink>
          </div>
          <a
            href="#about"
            className="group/cue hidden shrink-0 items-center gap-3 rounded-full py-1 pl-4 text-meta font-medium text-fg-muted transition-colors duration-300 hover:text-fg motion-safe:animate-fade [animation-delay:1000ms] md:inline-flex"
          >
            Scroll<span className="sr-only"> to What is TUM.ai?</span>
            <span
              aria-hidden
              className="grid size-13 place-items-center overflow-hidden rounded-full border border-hairline-strong transition-colors duration-300 group-hover/cue:border-fg/60"
            >
              <ArrowDown className="home-scroll-cue-arrow size-4" />
            </span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
