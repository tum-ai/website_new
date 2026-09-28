import { HomeHero } from "./home-hero";
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
 * HeroAperture for the image-preload contract.
 */
export function HomePage() {
  return (
    <main>
      <HomeHero />
      <MissionSection />
      <ProgramsSection />
      <RoomSection />
      <PartnersSection />
      <JoinSection />
    </main>
  );
}
