import { describe, expect, test } from "vitest";
import { cacheTagsForType, contentCacheTag, liveCacheTags } from "./cache-tags";

describe("cacheTagsForType", () => {
  test("maps the live types to the live getters' tags", () => {
    expect(cacheTagsForType("event")).toStrictEqual(["events"]);
    expect(cacheTagsForType("partner")).toStrictEqual(["partners"]);
    expect(cacheTagsForType("research")).toStrictEqual(["research-projects"]);
    expect(Object.keys(liveCacheTags)).toStrictEqual([
      "event",
      "partner",
      "research",
    ]);
  });

  test("maps any other type to its content tag", () => {
    expect(cacheTagsForType("siteSettings")).toStrictEqual([
      "content:siteSettings",
    ]);
    expect(cacheTagsForType("person")).toStrictEqual([
      contentCacheTag("person"),
    ]);
  });

  test("ignores values that are not type names", () => {
    for (const value of [
      undefined,
      null,
      3,
      "",
      "has space",
      "../x",
      "constructor x",
    ]) {
      expect(cacheTagsForType(value)).toStrictEqual([]);
    }
    expect(cacheTagsForType("toString")).toStrictEqual(["content:toString"]);
  });
});
