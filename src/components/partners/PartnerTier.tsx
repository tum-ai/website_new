import type { Partner } from "@/lib/types";
import PartnerRotationGrid from "./PartnerRotationGrid";

const labels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

export default function PartnerTier({
  partners,
  tier,
  index,
}: {
  partners: Partner[];
  tier: keyof typeof labels;
  index: number;
}) {
  if (!partners.length) return null;
  return (
    <section
      className="partner-tier-group"
      aria-labelledby={`partner-tier-${tier}`}
    >
      <div className="partner-tier-heading">
        <h3 id={`partner-tier-${tier}`}>{labels[tier]} partners</h3>
      </div>
      <PartnerRotationGrid
        partners={partners}
        offset={index * 850}
        className={`partner-logo-row partner-logo-row-${index + 1} partner-rotating-row`}
      />
    </section>
  );
}
