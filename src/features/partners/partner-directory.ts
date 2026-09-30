import type { Organization } from "@/lib/people-and-logos";
import { isPartnerTier, partnerTiers } from "@/lib/people-and-logos";
import { getSafeExternalUrl } from "@/lib/security";
import type { Partner } from "@/lib/types";
import { partnerLaunchOrder } from "./data/organizations";
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
    ...(logo?.symbolOnly ? { symbolOnly: true } : {}),
  };
}

const launchIndex = new Map(
  partnerLaunchOrder.map((key, index) => [key, index]),
);

const launchRank = (partner: Partner) =>
  launchIndex.get(partner.id) ?? partnerLaunchOrder.length;

/**
 * The partner directory: `partners` in tier order (gold, silver, bronze,
 * supporter; an unknown or missing tier is a supporter), within a tier the
 * ones that lead it first, then the launch brief's order
 * (`partnerLaunchOrder`), then by name. Entries without a name are dropped,
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
        launchRank(a) - launchRank(b) ||
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
