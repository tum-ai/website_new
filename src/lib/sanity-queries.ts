/**
 * GROQ queries for the CMS-backed pages and the public API.
 *
 * Every query is wrapped in `defineQuery` so Sanity TypeGen finds it and
 * writes its result type to `sanity.types.generated.ts`. After changing a
 * query or a schema in `src/sanity/schemas`, run `pnpm sanity:typegen`; CI
 * fails when the generated file is stale.
 *
 * Site queries (`EVENTS_QUERY`, …) may change with the pages. The
 * `PUBLIC_*` queries are the response bodies of `/api/getNotes`,
 * `/api/getPartners` and `/api/getResearch`, which external consumers read:
 * their shape is frozen, and sanity-queries.test.ts pins it.
 */
import { defineQuery } from "next-sanity";

export const EVENTS_QUERY = defineQuery(`*[_type == "event"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  event_date,
  end_date,
  location,
  city,
  category,
  "hosts": coalesce(hosts, []),
  "coHosts": coHosts[]->{ key, name },
  "poster": poster.asset->url,
  "images": array::compact([poster.asset->url, img.asset->url]),
  sign_up
}`);

export const RESEARCH_QUERY = defineQuery(`*[_type == "research"]{
  "id": _id,
  title,
  "institutions": institutions[]->{ key, name, "logo": logo.asset->url },
  "description": coalesce(desc, ""),
  status,
  field,
  startYear,
  publication,
  "keywords": coalesce(keywords, [])
}`);

/** `/api/getNotes` response body. Frozen: includes the legacy `detail` text. */
export const PUBLIC_EVENTS_QUERY = defineQuery(`*[_type == "event"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  event_date,
  location,
  city,
  category,
  "poster": poster.asset->url,
  "images": array::compact([poster.asset->url, img.asset->url]),
  sign_up,
  detail
}`);

/** `/api/getResearch` response body. Frozen: keywords as one ", "-joined string. */
export const PUBLIC_RESEARCH_QUERY = defineQuery(`*[_type == "research"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  status,
  publication,
  "keywords": array::join(keywords, ", "),
  "image": img.asset->url
}`);

/**
 * `/api/getPartners` response body on `production`, the old site's dataset,
 * and on the new site's dataset until the partners are migrated to
 * organisations (`getPublishedPartners`). Frozen.
 */
export const PUBLIC_PARTNERS_QUERY = defineQuery(`*[_type == "partner"]{
  "id": _id,
  name,
  link,
  "image": image.asset->url,
  category,
  tier,
  featured
}`);

/**
 * `/api/getPartners` response body from the partner organisations (every
 * `organization` with a `partnerTier`), in exactly the shape of
 * {@link PUBLIC_PARTNERS_QUERY}. `id` is the old site's partner document id
 * the migration kept (`legacyPartnerId`), so consumers keep the ids they
 * know; a partner added since has its organisation's `_id`. Frozen.
 */
export const PUBLIC_PARTNER_ORGANIZATIONS_QUERY =
  defineQuery(`*[_type == "organization" && defined(partnerTier)]{
  "id": coalesce(legacyPartnerId, _id),
  name,
  "link": href,
  "image": logo.asset->url,
  "category": partnerCategory,
  "tier": partnerTier,
  "featured": partnerFeatured
}`);
