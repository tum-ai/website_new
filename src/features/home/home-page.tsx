import { ButtonLink, CtaBand, Highlight } from "@/components/ds";
import { getPartnershipEmailUrl } from "@/features/partners";
import { AboutSection } from "./about-section";
import { ExploreSection } from "./explore-section";
import { HomeHero } from "./home-hero";
import { PartnersSection } from "./partners-section";

/**
 * Home page: ink hero, "What is TUM.ai?" (paper and mist), the destinations
 * bento, the partner teaser (ink) and a closing call to action. Must stay
 * statically prerendered; see HomeHero for the image-preload contract.
 */
export function HomePage() {
  return (
    <main>
      <HomeHero />
      <AboutSection />
      <ExploreSection />
      <PartnersSection />
      <CtaBand
        titleId="join-title"
        tone="lavender"
        eyebrow="TUM.ai"
        title={
          <>
            Join the <Highlight variant="fade">community</Highlight>
          </>
        }
        actions={
          <>
            <ButtonLink href="/apply" size="lg" arrow>
              Become a Member
            </ButtonLink>
            <ButtonLink
              href={getPartnershipEmailUrl()}
              size="lg"
              variant="inverse"
            >
              Become a Partner
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
