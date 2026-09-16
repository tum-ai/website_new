import { featuredPartners } from "../data/partner-logos";
import { getSafeExternalUrl } from "./security";
import type { Partner, PartnerTier } from "./types";

const tierOrder: PartnerTier[] = ["gold", "silver", "bronze", "supporter"];

export function getPartnerKey(name: string) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return key === "hrt" ? "hudsonrivertrading" : key;
}

/** Merge CMS records with launch defaults without duplicating cross-category partners. */
export function getPartnerDirectory(partners: Partner[]) {
  const defaults = new Map(
    featuredPartners.map((partner) => [getPartnerKey(partner.name), partner]),
  );
  const merged = new Map<string, Partner>(defaults);
  for (const partner of partners) {
    if (!partner.name?.trim()) continue;
    const key = getPartnerKey(partner.name);
    const previous = merged.get(key);
    const validTier = tierOrder.includes(partner.tier as PartnerTier)
      ? partner.tier
      : undefined;
    merged.set(key, {
      ...previous,
      ...partner,
      name: defaults.get(key)?.name ?? partner.name,
      image: partner.image || previous?.image,
      link:
        getSafeExternalUrl(partner.link) ??
        getSafeExternalUrl(previous?.link) ??
        undefined,
      tier: validTier ?? previous?.tier ?? "supporter",
      featured: partner.featured ?? previous?.featured ?? false,
    });
  }
  // The fixed brief order is stable; featured CMS entries lead within their tier.
  const defaultOrder = new Map(
    featuredPartners.map((partner, index) => [
      getPartnerKey(partner.name),
      index,
    ]),
  );
  return [...merged.values()].sort((a, b) => {
    const tierDifference =
      tierOrder.indexOf(a.tier ?? "supporter") -
      tierOrder.indexOf(b.tier ?? "supporter");
    return (
      tierDifference ||
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      (defaultOrder.get(getPartnerKey(a.name)) ?? 100) -
        (defaultOrder.get(getPartnerKey(b.name)) ?? 100) ||
      a.name.localeCompare(b.name)
    );
  });
}
