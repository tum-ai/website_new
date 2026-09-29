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
 * content slice (`content.ts`: the CMS or the code copy).
 */
export async function HomePage() {
  const { copy, departmentCount } = await getHomeContent();
  const { ledger, programs } = homeView(copy, departmentCount);
  return (
    <main>
      <HomeHero hero={copy.hero} />
      <MissionSection mission={copy.mission} ledger={ledger} />
      <ProgramsSection
        title={copy.programs.title}
        lead={copy.programs.lead}
        items={programs}
      />
      <RoomSection room={copy.room} />
      <PartnersSection />
      <JoinSection join={copy.join} />
    </main>
  );
}
