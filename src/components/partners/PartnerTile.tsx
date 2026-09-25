import { ArrowUpRight } from "lucide-react";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import { cn } from "@/lib/utils";
import PartnerLogo from "./PartnerLogo";

const partnerTierLabels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

/**
 * Tile sizes keep the approved logo hierarchy: Gold > Silver > Bronze, and a
 * compact board for supporters. The white surface lives on the rotation slot,
 * so the outgoing copy of a tile stays transparent during the dissolve.
 */
export const partnerTileSizes = {
  lg: "min-h-[6.875rem] p-6 sm:min-h-[9.125rem] sm:px-8 sm:py-9 lg:px-12 [&_.partner-logo-image]:max-h-[2.875rem] sm:[&_.partner-logo-image]:max-h-[4.2rem] [&_.partner-logo-image]:max-w-[13.75rem]",
  md: "min-h-[5.3rem] p-4 sm:min-h-[7rem] sm:px-6 sm:py-7 lg:px-10 [&_.partner-logo-image]:max-h-8 sm:[&_.partner-logo-image]:max-h-[2.8rem] [&_.partner-logo-image]:max-w-[10.6rem]",
  sm: "min-h-[5.4rem] p-6 [&_.partner-logo-image]:max-h-9 [&_.partner-logo-image]:max-w-[13.75rem]",
  compact:
    "min-h-16 p-3.5 sm:min-h-[5.125rem] sm:px-6 sm:py-[1.125rem] [&_.partner-logo-image]:max-h-[1.875rem] sm:[&_.partner-logo-image]:max-h-10 [&_.partner-logo-fallback]:text-[0.75rem]",
} as const;

export type PartnerTileSize = keyof typeof partnerTileSizes;

export default function PartnerTile({
  partner,
  size = "lg",
}: {
  partner: Partner;
  size?: PartnerTileSize;
}) {
  const compact = size === "compact";
  const href = getSafeExternalUrl(partner.link);
  const logo = <PartnerLogo name={partner.name} image={partner.image} />;
  const tierLabel =
    !compact && partner.tier && partner.tier !== "supporter"
      ? partnerTierLabels[partner.tier]
      : null;
  const content =
    partner.image === "/assets/partners/logos/mutagent.svg" ? (
      <span className="partner-logo-lockup flex items-center gap-2.5 text-[0.9375rem] font-semibold text-violet-950 [&_.partner-logo-image]:size-9">
        {logo}
        <span>{partner.name}</span>
      </span>
    ) : (
      logo
    );
  const className = cn(
    "group/logo relative isolate flex h-full w-full items-center justify-center rounded-[inherit] text-violet-950",
    // Flatten white-backed CMS artwork into the tile's light hover surface.
    "[&_.partner-logo-image]:mix-blend-multiply",
    partnerTileSizes[size],
  );
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        className,
        "transition-[background-color,box-shadow] duration-300 ease-brand hover:bg-violet-50 hover:ring-2 hover:ring-violet-500",
      )}
      aria-label={`Visit ${partner.name}${tierLabel ? `, ${tierLabel} partner` : ""}`}
    >
      {content}
      <ArrowUpRight
        aria-hidden="true"
        className={cn(
          "absolute top-3 right-3 size-3.5 opacity-0 transition-[opacity,translate] duration-300 ease-brand",
          "group-hover/logo:translate-x-0.5 group-hover/logo:-translate-y-0.5 group-hover/logo:opacity-60 group-focus-visible/logo:opacity-60",
          compact && "max-sm:hidden",
        )}
      />
    </a>
  ) : (
    <div
      className={className}
      aria-label={
        tierLabel ? `${partner.name}, ${tierLabel} partner` : partner.name
      }
    >
      {content}
    </div>
  );
}
