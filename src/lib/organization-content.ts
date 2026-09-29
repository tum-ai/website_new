import "server-only";

import { defineQuery } from "next-sanity";
import {
  type BackfillDocument,
  type BackfillImage,
  backfillId,
  backfillImage,
} from "./cms-backfill";
import { loadContent } from "./cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ProjectedImage,
  toContentImage,
} from "./cms-content-model";
import {
  type LogoArtwork,
  type LogoListSurface,
  type LogoLists,
  logoListDocumentId,
  type Organization,
} from "./people-and-logos";
import type { LOGO_LISTS_QUERY_RESULT } from "./sanity.types.generated";
import { isHttpsUrl } from "./security";

/**
 * The `organization` and `logoList` content types, shared by every page that
 * shows logos (/partners, /e-lab, /events, /research and the homepage).
 *
 * - An `organization` document holds one company's name, link and artwork
 *   (a logo for light and one for dark backgrounds); pages never list
 *   organisations directly.
 * - A `logoList` document per page section (fixed `_id`, see
 *   {@link logoListId}) holds references to organisations in the order the
 *   section shows them. Order and membership live on the list, not on the
 *   organisation, because one organisation appears in several sections in
 *   different orders (Anthropic: partner marquee and events hero).
 *
 * Each feature keeps its code fallback and passes it in (like
 * `lib/faq-content.ts`); this module is the query, the mapping and the
 * backfill builders they share.
 */

/** GROQ projection of an `organization` into what {@link toOrganization} reads. */
const ORGANIZATION_PROJECTION = `{
  key,
  name,
  shortName,
  href,
  "logo": logo${CONTENT_IMAGE_PROJECTION},
  "logoSymbolOnly": logo.symbolOnly,
  "logoAspectRatio": logo.aspectRatio,
  "logoOnDark": logoOnDark${CONTENT_IMAGE_PROJECTION},
  "logoOnDarkSymbolOnly": logoOnDark.symbolOnly,
  "logoOnDarkAspectRatio": logoOnDark.aspectRatio
}`;

const LOGO_LISTS_QUERY = defineQuery(`*[_type == "logoList" && _id in $ids]{
  surface,
  "organizations": organizations[]->${ORGANIZATION_PROJECTION}
}`);

/** An organisation as {@link ORGANIZATION_PROJECTION} returns it. */
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
};

/** The fixed `_id` of a section's `logoList` document. */
export function logoListId(surface: LogoListSurface): string {
  return logoListDocumentId(surface);
}

/** The backfill `_id` of an organisation, from its key. */
export function organizationId(key: string): string {
  return backfillId("organization", key);
}

function toArtwork(
  image: ProjectedImage,
  symbolOnly: boolean | null | undefined,
  aspectRatio: number | null | undefined,
): LogoArtwork | undefined {
  const content = toContentImage(image);
  if (!content) return undefined;
  const artwork: LogoArtwork = content;
  if (symbolOnly) artwork.symbolOnly = true;
  if (typeof aspectRatio === "number" && aspectRatio > 0) {
    artwork.aspectRatio = aspectRatio;
  }
  return artwork;
}

/**
 * A projected organisation as the code shape, or `null` when it lacks a key
 * or a name (a dangling reference or an unfinished draft). Empty optional
 * fields are left out, like in code.
 */
export function toOrganization(
  projected: ProjectedOrganization | null | undefined,
): Organization | null {
  const key = projected?.key?.trim();
  const name = projected?.name?.trim();
  if (!projected || !key || !name) return null;
  const organization: Organization = { key, name };
  const shortName = projected.shortName?.trim();
  if (shortName) organization.shortName = shortName;
  const href = projected.href?.trim();
  if (href && isHttpsUrl(href)) organization.href = href;
  const logo = toArtwork(
    projected.logo,
    projected.logoSymbolOnly,
    projected.logoAspectRatio,
  );
  if (logo) organization.logo = logo;
  const logoOnDark = toArtwork(
    projected.logoOnDark,
    projected.logoOnDarkSymbolOnly,
    projected.logoOnDarkAspectRatio,
  );
  if (logoOnDark) organization.logoOnDark = logoOnDark;
  return organization;
}

/**
 * The organisations of each section in `lists`: the CMS list when the source
 * is `sanity` and that section's list has any organisation, otherwise the
 * code list (per section; see `mergeOverFallback`).
 */
export function getLogoLists<S extends LogoListSurface>({
  lists,
  label,
  mockDocuments,
}: {
  /** The code lists, one per section this page reads. */
  lists: LogoLists<S>;
  label: string;
  /** The documents the mock CMS queries: the slice's backfill. */
  mockDocuments: () => readonly BackfillDocument[];
}): Promise<LogoLists<S>> {
  const surfaces = Object.keys(lists) as S[];
  return loadContent<LogoLists<S>, LOGO_LISTS_QUERY_RESULT>({
    fallback: lists,
    query: LOGO_LISTS_QUERY,
    params: { ids: surfaces.map(logoListId) },
    tags: ["content:logoList", "content:organization"],
    label,
    mockDocuments,
    select: (result) =>
      Object.fromEntries(
        result.flatMap(({ surface, organizations }) =>
          surface && (surfaces as string[]).includes(surface)
            ? [
                [
                  surface,
                  (organizations ?? []).flatMap(
                    (organization) => toOrganization(organization) ?? [],
                  ),
                ],
              ]
            : [],
        ),
      ),
  });
}

function artworkImage(artwork: LogoArtwork) {
  const image: BackfillImage & { symbolOnly?: true; aspectRatio?: number } =
    backfillImage(artwork.src, {
      alt: artwork.alt,
      objectPosition: artwork.objectPosition,
    });
  if (artwork.symbolOnly) image.symbolOnly = true;
  if (artwork.aspectRatio !== undefined)
    image.aspectRatio = artwork.aspectRatio;
  return image;
}

/** The `organization` document that recreates a code organisation. */
export function buildOrganizationDocument(
  organization: Organization,
): BackfillDocument {
  const { key, name, shortName, href, logo, logoOnDark } = organization;
  return {
    _id: organizationId(key),
    _type: "organization",
    key,
    name,
    ...(shortName ? { shortName } : {}),
    ...(href ? { href } : {}),
    ...(logo ? { logo: artworkImage(logo) } : {}),
    ...(logoOnDark ? { logoOnDark: artworkImage(logoOnDark) } : {}),
  };
}

/** A reference to an organisation's backfill document, by key. */
export function organizationReference(key: string) {
  return { _type: "reference", _ref: organizationId(key) } as const;
}

/**
 * The `logoList` document of a section: references to the organisations'
 * backfill documents, in order. The organisations themselves are built by
 * whichever slice owns them (`buildOrganizationDocument`).
 */
export function buildLogoListDocument(
  surface: LogoListSurface,
  organizations: readonly Pick<Organization, "key">[],
): BackfillDocument {
  return {
    _id: logoListId(surface),
    _type: "logoList",
    surface,
    organizations: organizations.map(({ key }) => ({
      _key: key,
      ...organizationReference(key),
    })),
  };
}
