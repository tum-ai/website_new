import { expect, test } from "vitest";
import { cacheTagsForType, liveCacheTags } from "@/lib/cache-tags";
import { liveSchemaTypes } from "@/sanity/schemas";
import { contentSchemaTypes } from "@/sanity/schemas/content";

/**
 * The revalidation webhook reaches every type the Studio edits: each live
 * type has its getters' tags, each content type its `content:<type>` tag.
 */
test("every Studio type maps to the tags its readers carry", () => {
  for (const { name } of liveSchemaTypes) {
    expect(Object.keys(liveCacheTags), name).toContain(name);
  }
  for (const { name } of contentSchemaTypes) {
    expect(cacheTagsForType(name), name).toStrictEqual([`content:${name}`]);
  }
});
