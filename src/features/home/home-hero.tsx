import {
  Actions,
  ButtonLink,
  Container,
  LogoTile,
  Section,
  SplitWords,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "@/features/partners";
import type { HomeCopy } from "./data/homepage";
import { HeroAperture } from "./hero-aperture";

/**
 * Gold partners with artwork verified for dark bands: the partners from the
 * static defaults, so the home page stays prerendered without a partner
 * request, and their artwork from the partner marquee's logo list.
 */
const heroPartnersOf = (
  marqueeLogos: Readonly<Record<string, string | undefined>>,
) =>
  getHighlightedPartners(getPartnerDirectory([]))
    .filter((partner) => partner.tier === "gold")
    .map((partner) => {
      const key = getPartnerKey(partner.name);
      return { key, name: partner.name, image: marqueeLogos[key] };
    })
    .filter((partner) => partner.image);

/**
 * Home hero on night: the page's `h1` and both calls to action on the left,
 * the logomark aperture (see HeroAperture) cropped off the right edge, and
 * the gold partners along the bottom.
 *
 * Everything above the fold animates with CSS, never with hydration-bound
 * reveals. The page preloads two images: the header logo and the aperture's
 * first photo (test/perf/homepage.perf.ts).
 */
export function HomeHero({
  hero,
  marqueeLogos,
}: {
  hero: HomeCopy["hero"];
  /** Dark-band artwork by partner key (`getPartnerLogos()`). */
  marqueeLogos: Readonly<Record<string, string | undefined>>;
}) {
  const heroPartners = heroPartnersOf(marqueeLogos);
  return (
    <Section
      tone="night"
      spacing="none"
      aria-labelledby="home-hero-title"
      className="flex min-h-[100svh] flex-col overflow-clip pt-[calc(var(--header-height)+clamp(4rem,12vh,9rem))]"
    >
      <HeroAperture
        photos={hero.photos}
        className="home-aperture-frame absolute -z-10 aspect-[477/406]"
      />

      <Container className="flex flex-1 flex-col">
        <div>
          <h1
            id="home-hero-title"
            className="max-w-[9.5em] text-display-xl text-highlight"
          >
            <SplitWords delay={160} step={70}>
              {hero.title}
            </SplitWords>
          </h1>
          <p className="mt-8 max-w-[34rem] text-fg-muted text-lead [animation-delay:620ms] motion-safe:animate-rise-sm md:mt-10">
            {hero.lead}
          </p>
          <Actions className="mt-10 [animation-delay:760ms] motion-safe:animate-rise-sm md:mt-12">
            <ButtonLink href="/partners" size="lg">
              {callToActionLabels.partner}
            </ButtonLink>
            <ButtonLink href="/apply" size="lg" variant="outline" arrow>
              {callToActionLabels.member}
            </ButtonLink>
          </Actions>
        </div>

        <div className="mt-auto pt-16 pb-8 [animation-delay:1000ms] motion-safe:animate-fade md:pt-24 md:pb-10">
          <div className="flex flex-col gap-6 border-hairline md:border-t md:pt-8 lg:flex-row lg:items-center lg:gap-12">
            <p className="shrink-0 text-fg-subtle text-meta">
              {hero.partnersLabel}
            </p>
            <ul className="grid grid-cols-4 items-center gap-x-6 gap-y-5 sm:gap-x-10 lg:flex lg:flex-1 lg:justify-between lg:gap-8">
              {heroPartners.map((partner) => (
                <li
                  key={partner.key}
                  className="flex h-7 items-center opacity-70 md:h-8"
                >
                  <LogoTile
                    variant="bare"
                    name={partner.name}
                    src={partner.image}
                    className="h-full w-full max-w-28 justify-start"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
