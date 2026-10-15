import { PartnerRotationGrid } from "@/features/partners";
import type { Partner } from "@/lib/types";

/**
 * Tiles on the wall at once: six columns of three rows on wide screens.
 * It also fills the two- and three-column rows of smaller screens, so the
 * wall keeps one capacity at every width.
 */
export const partnerWallCapacity = 18;

/**
 * The homepage's partner wall: every partner in directory order, the
 * highlighted ones (gold, silver, bronze) on the starting wall and the
 * supporters rotating in three at a time, like the /partners supporter
 * board. Under reduced motion it holds the starting wall. The tiles show
 * logos only: they don't link, as the wall never did.
 */
export function PartnerWall({ partners }: { partners: Partner[] }) {
  return (
    <PartnerRotationGrid
      partners={partners.map(({ link: _link, ...partner }) => partner)}
      capacity={partnerWallCapacity}
      batchSize={3}
      stillShows="capacity"
      size="md"
      label="TUM.ai partners"
      // LogoWall's six-column grid; the slot is a flex box like its items.
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 [&_.partner-rotation-current]:flex"
    />
  );
}
