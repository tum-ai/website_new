import { getSiteFacts } from "@/config/site-settings-content";
import { getMemberStories } from "@/features/community/server";
import { getPartnerLogos, getPartners } from "@/features/partners/server";
import { getHomeContent } from "./content";
import { HomeHero } from "./home-hero";
import { homeView } from "./home-view";
import { JoinSection } from "./join-section";
import { MissionSection } from "./mission-section";
import { PartnersSection } from "./partners-section";
import { ProgramsSection } from "./programs-section";
import { RoomSection } from "./room-section";

/**
 * Home page, for two audiences at once: prospective partners and members.
 * Night hero with the logomark aperture, the mission and its figures, the
 * program index (paper), event photography (night), the partner case (mist)
 * and the member call to action (ink). Must stay statically prerendered; see
 * HeroAperture for the image-preload contract. The copy comes from the
 * content slice (`content.ts`), the figures from the site facts, and the
 * member stories, partners and partner artwork from their
 * slices (each the CMS or the code).
 */
export async function HomePage() {
  const [
    { copy, departmentCount },
    facts,
    stories,
    { marqueeLogos },
    partners,
  ] = await Promise.all([
    getHomeContent(),
    getSiteFacts(),
    getMemberStories(),
    getPartnerLogos(),
    getPartners(),
  ]);
  const { ledger, programs } = homeView(copy, {
    facts,
    departmentCount,
  });
  return (
    <main>
      <HomeHero
        hero={copy.hero}
        partners={partners}
        marqueeLogos={marqueeLogos}
      />
      <MissionSection mission={copy.mission} ledger={ledger} />
      <ProgramsSection
        title={copy.programs.title}
        lead={copy.programs.lead}
        items={programs}
      />
      <RoomSection room={copy.room} />
      <PartnersSection copy={copy.partners} partners={partners} />
      <JoinSection join={copy.join} stories={stories} />
    </main>
  );
}
