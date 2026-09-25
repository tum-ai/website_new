import { cn } from "@/lib/cn";
import type { Partner } from "@/lib/types";
import { PartnerRotationGrid } from "./partner-rotation-grid";
import type { PartnerTileSize } from "./partner-tile";

const labels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

/* Narrower rows and smaller tiles carry the tier hierarchy from 768px up. */
const rows: { width: string; size: PartnerTileSize }[] = [
  { width: "md:w-full", size: "lg" },
  { width: "md:w-[84%]", size: "md" },
  { width: "md:w-[72%]", size: "sm" },
];

export function PartnerTier({
  partners,
  tier,
  index,
}: {
  partners: Partner[];
  tier: keyof typeof labels;
  index: number;
}) {
  if (!partners.length) return null;
  const row = rows[index] ?? rows[rows.length - 1];
  return (
    <section className="w-full" aria-labelledby={`partner-tier-${tier}`}>
      <div className="mb-4 flex min-h-7 items-center justify-center">
        <h3
          id={`partner-tier-${tier}`}
          className="text-eyebrow text-highlight uppercase"
        >
          {labels[tier]} partners
        </h3>
      </div>
      <PartnerRotationGrid
        partners={partners}
        offset={index * 850}
        size={row.size}
        className={cn(
          "mx-auto grid w-full grid-cols-1 gap-3 md:grid-cols-3 md:gap-4",
          row.width,
        )}
      />
    </section>
  );
}
