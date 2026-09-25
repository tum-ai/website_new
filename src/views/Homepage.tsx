import "@/styles/pages/home.css";
import { ButtonLink, CtaBand, Highlight } from "@/components/ds";
import { AboutSection } from "@/components/home/AboutSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { HomeHero } from "@/components/home/HomeHero";
import { PartnersSection } from "@/components/home/PartnersSection";
import { getPartnershipEmailUrl } from "@/lib/partnerships";

/**
 * Home page: ink hero, "What is TUM.ai?" (paper and mist), the destinations
 * bento, the partner teaser (ink) and a closing call to action. Must stay
 * statically prerendered; see HomeHero for the image-preload contract.
 */
export default function Homepage() {
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
