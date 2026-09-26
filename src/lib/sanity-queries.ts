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
  location,
  city,
  category,
  "poster": poster.asset->url,
  "images": array::compact([poster.asset->url, img.asset->url]),
  sign_up
}`);

export const RESEARCH_QUERY = defineQuery(`*[_type == "research"]{
  "id": _id,
  title,
  "description": coalesce(desc, ""),
  status,
  publication,
  "keywords": coalesce(keywords, []),
  "image": img.asset->url
}`);

export const PARTNERS_QUERY = defineQuery(`*[_type == "partner"]{
  "id": _id,
  name,
  link,
  "image": image.asset->url,
  category,
  tier,
  featured
}`);

/** Partners shown on /research; the category filter runs in the Content Lake. */
export const RESEARCH_PARTNERS_QUERY =
  defineQuery(`*[_type == "partner" && category == "Research Partners"]{
  "id": _id,
  name,
  link,
  "image": image.asset->url,
  category,
  tier,
  featured
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

/** `/api/getPartners` response body. Frozen. */
export const PUBLIC_PARTNERS_QUERY = defineQuery(`*[_type == "partner"]{
  "id": _id,
  name,
  link,
  "image": image.asset->url,
  category,
  tier,
  featured
}`);
