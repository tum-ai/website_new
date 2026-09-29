/**
 * The Next cache tags the site's Sanity reads carry, by document type, so a
 * Sanity webhook (`app/api/revalidate/route.ts`) can expire exactly the
 * pages that read a changed document. Isomorphic and pure.
 *
 * - Events, partners and research (`lib/sanity.ts`): a fixed tag per type,
 *   shared by the page getters and the public API.
 * - Page content (content slices, `lib/cms-content.ts`): `content:<type>`
 *   for every type a slice's query reads, including the types it
 *   dereferences (`content:person` on the homepage copy). New content types
 *   need no change here.
 */

/** The cache tags of events, partners and research, by `_type`. */
export const liveCacheTags = {
  event: ["events"],
  partner: ["partners"],
  research: ["research-projects"],
} as const satisfies Record<string, readonly string[]>;

/** The tag every content slice that reads documents of `type` carries. */
export function contentCacheTag(type: string): string {
  return `content:${type}`;
}

/** A Sanity type name as a webhook sends it; anything else is ignored. */
const typeName = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

/**
 * The cache tags to expire when a document of `type` changes: its live tags
 * for a live type, otherwise its content tag. Empty for a value that is not a
 * type name.
 */
export function cacheTagsForType(type: unknown): string[] {
  if (typeof type !== "string" || !typeName.test(type)) return [];
  if (Object.hasOwn(liveCacheTags, type)) {
    return [...liveCacheTags[type as keyof typeof liveCacheTags]];
  }
  return [contentCacheTag(type)];
}
