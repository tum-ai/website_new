import { LogoTile, type LogoTileProps } from "@/components/ds";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import { symbolOnlyLogos } from "./data/partner-logos";

/** Tile height step: the tiers keep Gold > Silver > Bronze > supporters. */
export type PartnerTileSize = NonNullable<LogoTileProps["size"]>;

/**
 * A partner's logo tile. It links to the partner's site in a new tab (and
 * says so) when the link is a safe http(s) URL; symbol-only artwork gets the
 * name beside it. `transparent` drops the white surface for the outgoing
 * copy that dissolves over the incoming tile during a rotation.
 */
export function PartnerTile({
  partner,
  size = "lg",
  transparent = false,
}: {
  partner: Partner;
  size?: PartnerTileSize;
  transparent?: boolean;
}) {
  return (
    <LogoTile
      name={partner.name}
      src={partner.image}
      href={getSafeExternalUrl(partner.link) ?? undefined}
      wordmark={
        partner.image && symbolOnlyLogos.has(partner.image)
          ? partner.name
          : undefined
      }
      size={size}
      // The outgoing copy fills the slot over the incoming tile.
      className={transparent ? "h-full bg-transparent" : undefined}
    />
  );
}
