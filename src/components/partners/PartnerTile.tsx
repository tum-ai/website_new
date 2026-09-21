import { ArrowUpRight } from "lucide-react";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import PartnerLogo from "./PartnerLogo";

const partnerTierLabels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

export default function PartnerTile({
  partner,
  compact = false,
}: {
  partner: Partner;
  compact?: boolean;
}) {
  const href = getSafeExternalUrl(partner.link);
  const logo = <PartnerLogo name={partner.name} image={partner.image} />;
  const tierLabel =
    !compact && partner.tier && partner.tier !== "supporter"
      ? partnerTierLabels[partner.tier]
      : null;
  const content =
    partner.image === "/assets/partners/logos/mutagent.svg" ? (
      <span className="partner-logo-lockup">
        {logo}
        <span>{partner.name}</span>
      </span>
    ) : (
      logo
    );
  const className = `partner-logo-tile${compact ? " partner-logo-tile-compact" : ""}`;
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Visit ${partner.name}${tierLabel ? `, ${tierLabel} partner` : ""}`}
    >
      {content}
      <ArrowUpRight
        size={14}
        className="partner-logo-link-icon"
        aria-hidden="true"
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
