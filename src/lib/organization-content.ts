import "server-only";

import { defineQuery } from "next-sanity";
import { loadContent } from "./cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  ContentError,
  contentImage,
  optionalString,
  type ProjectedImage,
  requireArray,
  requireObject,
  requireString,
  toContentImage,
} from "./cms-content-model";
import {
  isPartnerCategory,
  isPartnerTier,
  type LogoArtwork,
  type LogoListSurface,
  type LogoLists,
  logoListDocumentId,
  type Organization,
  type Partnership,
} from "./people-and-logos";
import { isHttpsUrl } from "./security";

/** Shared organization projection, including editorial partnership order. */
const ORGANIZATION_PROJECTION = `{
 key, name, shortName, href,
 "logo": logo${CONTENT_IMAGE_PROJECTION},
 "logoSymbolOnly": logo.symbolOnly, "logoAspectRatio": logo.aspectRatio,
 "logoOnDark": logoOnDark${CONTENT_IMAGE_PROJECTION},
 "logoOnDarkSymbolOnly": logoOnDark.symbolOnly, "logoOnDarkAspectRatio": logoOnDark.aspectRatio,
 partnerTier, partnerCategory, partnerFeatured, partnerOrder
}`;
const LOGO_LISTS_QUERY = defineQuery(
  `*[_type == "logoList" && surface in $surfaces]{surface,"organizations":organizations[]->${ORGANIZATION_PROJECTION}}`,
);
const PARTNER_ORGANIZATIONS_QUERY = defineQuery(
  `*[_type == "organization" && defined(partnerTier)]${ORGANIZATION_PROJECTION}`,
);
const ORGANIZATIONS_BY_KEY_QUERY = defineQuery(
  `*[_type == "organization" && key in $keys]${ORGANIZATION_PROJECTION}`,
);

/** Projected CMS organization. Required identity is validated before rendering. */
export type ProjectedOrganization = {
  key: string | null;
  name: string | null;
  shortName?: string | null;
  href?: string | null;
  logo?: ProjectedImage;
  logoSymbolOnly?: boolean | null;
  logoAspectRatio?: number | null;
  logoOnDark?: ProjectedImage;
  logoOnDarkSymbolOnly?: boolean | null;
  logoOnDarkAspectRatio?: number | null;
  partnerTier?: string | null;
  partnerCategory?: string | null;
  partnerFeatured?: boolean | null;
  partnerOrder?: number | null;
};
/** Fixed section document id. */
export function logoListId(surface: LogoListSurface): string {
  return logoListDocumentId(surface);
}
/** Stable organization id used by historical migration tooling. */
export function organizationId(key: string): string {
  return `organization-${key}`;
}

function artwork(
  image: ProjectedImage,
  symbolOnly: boolean | null | undefined,
  aspectRatio: number | null | undefined,
  label: string,
): LogoArtwork | undefined {
  if (image == null) return undefined;
  // GROQ projects absent images as null; an object with an empty asset is an invalid upload.
  const content = toContentImage(image);
  if (!content)
    throw new ContentError(
      "organization",
      "",
      `${label}: uploaded artwork needs an asset URL and dimensions`,
    );
  contentImage(content, label, "image");
  requireString(content.alt, label, "alt");
  if (symbolOnly != null && typeof symbolOnly !== "boolean")
    throw new ContentError(
      "organization",
      "",
      `${label}: symbolOnly must be boolean`,
    );
  if (
    aspectRatio != null &&
    (!Number.isFinite(aspectRatio) || aspectRatio <= 0)
  )
    throw new ContentError(
      "organization",
      "",
      `${label}: aspect ratio must be positive`,
    );
  return {
    ...content,
    ...(symbolOnly ? { symbolOnly: true as const } : {}),
    ...(aspectRatio != null ? { aspectRatio } : {}),
  };
}

/** Parse a resolved organization. Dangling references and malformed fields fail visibly. */
export function toOrganization(
  value: ProjectedOrganization | null | undefined,
): Organization {
  const projected = requireObject(
    value,
    "organization",
  ) as unknown as ProjectedOrganization;
  const key = requireString(projected.key, "organization.key");
  const name = requireString(projected.name, `organization ${key}.name`);
  const organization: Organization = { key, name };
  if (projected.shortName != null)
    organization.shortName = optionalString(
      projected.shortName,
      `${key}.shortName`,
    );
  if (projected.href != null && projected.href !== "") {
    if (!isHttpsUrl(projected.href))
      throw new ContentError(
        "organization",
        "",
        `${key}.href: expected HTTPS URL`,
      );
    organization.href = projected.href;
  }
  const logo = artwork(
    projected.logo,
    projected.logoSymbolOnly,
    projected.logoAspectRatio,
    `${key}.logo`,
  );
  const logoOnDark = artwork(
    projected.logoOnDark,
    projected.logoOnDarkSymbolOnly,
    projected.logoOnDarkAspectRatio,
    `${key}.logoOnDark`,
  );
  if (logo) organization.logo = logo;
  if (logoOnDark) organization.logoOnDark = logoOnDark;
  if (projected.partnerTier != null && projected.partnerTier !== "") {
    if (!isPartnerTier(projected.partnerTier))
      throw new ContentError(
        "organization",
        "",
        `${key}.partnerTier: unknown tier`,
      );
    const partnership: Partnership = { tier: projected.partnerTier };
    if (projected.partnerCategory != null && projected.partnerCategory !== "") {
      if (!isPartnerCategory(projected.partnerCategory))
        throw new ContentError(
          "organization",
          "",
          `${key}.partnerCategory: unknown category`,
        );
      partnership.category = projected.partnerCategory;
    }
    if (
      projected.partnerFeatured != null &&
      typeof projected.partnerFeatured !== "boolean"
    )
      throw new ContentError(
        "organization",
        "",
        `${key}.partnerFeatured: expected boolean`,
      );
    if (projected.partnerFeatured) partnership.featured = true;
    if (projected.partnerOrder != null) {
      if (!Number.isFinite(projected.partnerOrder))
        throw new ContentError(
          "organization",
          "",
          `${key}.partnerOrder: expected finite number`,
        );
      partnership.order = projected.partnerOrder;
    }
    organization.partnership = partnership;
  }
  return organization;
}

/** Select sections by surface so editor-owned document ids are respected. Empty optional lists stay empty. */
export function getLogoLists<S extends LogoListSurface>({
  surfaces,
  label,
}: {
  surfaces: readonly S[];
  label: string;
}): Promise<LogoLists<S>> {
  return loadContent<
    LogoLists<S>,
    {
      surface: string | null;
      organizations: (ProjectedOrganization | null)[] | null;
    }[]
  >({
    query: LOGO_LISTS_QUERY,
    params: { surfaces: [...surfaces] },
    tags: ["content:logoList", "content:organization"],
    label,
    select: (result) => {
      const lists = Object.fromEntries(
        surfaces.map((surface) => [surface, []]),
      ) as unknown as LogoLists<S>;
      const seen = new Set<string>();
      requireArray(result, label);
      for (const item of result) {
        requireObject(item, label);
        const surface = requireString(item.surface, `${label}.surface`);
        if (!surfaces.includes(surface as S) || seen.has(surface))
          throw new ContentError(
            "organization",
            "",
            `${label}: unexpected or duplicate surface ${surface}`,
          );
        seen.add(surface);
        if (item.organizations != null)
          requireArray(item.organizations, `${label}.${surface}`);
        lists[surface as S] = (item.organizations ?? []).map(toOrganization);
      }
      return lists;
    },
  });
}
/** All CMS partners; display ordering is a pure directory concern. */
export function getPartnerOrganizations({
  label,
}: {
  label: string;
}): Promise<Organization[]> {
  return loadContent<Organization[], ProjectedOrganization[]>({
    query: PARTNER_ORGANIZATIONS_QUERY,
    tags: ["content:organization"],
    label,
    select: (result) => {
      requireArray(result, label);
      return result.map(toOrganization);
    },
  });
}
/** CMS organization artwork for referenced keys; no local organization catalog. */
export function getOrganizationsByKey({
  keys,
  label,
}: {
  keys: readonly string[];
  label: string;
}): Promise<Organization[]> {
  return loadContent<Organization[], ProjectedOrganization[]>({
    query: ORGANIZATIONS_BY_KEY_QUERY,
    params: { keys: [...keys] },
    tags: ["content:organization"],
    label,
    select: (result) => {
      requireArray(result, label);
      return result.map(toOrganization);
    },
  });
}
