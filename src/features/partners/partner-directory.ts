import type { Organization } from "@/lib/people-and-logos";
import { isPartnerTier, partnerTiers } from "@/lib/people-and-logos";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import { getPartnerKey } from "./partner-key";

/** Gold, silver and bronze partners: the homepage and the /partners hero. */
export function getHighlightedPartners(partners: Partner[]) {
  return partners.filter(
    (partner) =>
      partner.tier === "gold" ||
      partner.tier === "silver" ||
      partner.tier === "bronze",
  );
}

const tierOrder = partnerTiers.map(({ value }) => value);

/**
 * A partner organisation as the pages list it: its key as the id, its
 * website, its logo for light backgrounds and its partnership (no tier
 * reads as supporter).
 */
export function partnerOf({
  key,
  name,
  href,
  logo,
  partnership,
}: Organization): Partner {
  return {
    id: key,
    name,
    ...(href ? { link: href } : {}),
    ...(logo ? { image: logo.src } : {}),
    ...(partnership?.category ? { category: partnership.category } : {}),
    tier: partnership?.tier ?? "supporter",
    ...(partnership?.featured ? { featured: true } : {}),
    ...(partnership?.order != null ? { order: partnership.order } : {}),
    ...(logo?.symbolOnly ? { symbolOnly: true } : {}),
  };
}

/**
 * The partner directory: `partners` in tier order (gold, silver, bronze,
 * supporter; an unknown or missing tier is a supporter), within a tier the
 * ones that lead it first, then the CMS editorial order, then by name. Entries without a name are dropped,
 * two entries for one company (the same {@link getPartnerKey}) keep the
 * higher-ranked one, and unsafe links are removed.
 */
export function getPartnerDirectory(partners: Partner[]): Partner[] {
  const sorted = partners
    .filter((partner) => partner.name?.trim())
    .map(
      (partner): Partner => ({
        ...partner,
        link: getSafeExternalUrl(partner.link) ?? undefined,
        tier: isPartnerTier(partner.tier) ? partner.tier : "supporter",
        featured: partner.featured === true,
      }),
    )
    .sort(
      (a, b) =>
        tierOrder.indexOf(a.tier ?? "supporter") -
          tierOrder.indexOf(b.tier ?? "supporter") ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        (a.order ?? Number.POSITIVE_INFINITY) -
          (b.order ?? Number.POSITIVE_INFINITY) ||
        a.name.localeCompare(b.name),
    );
  const seen = new Set<string>();
  return sorted.filter((partner) => {
    const key = getPartnerKey(partner.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
