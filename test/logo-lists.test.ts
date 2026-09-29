import { expect, test } from "vitest";
import { logoListPinnedDocuments } from "@/sanity/content-structure";
import { collectBackfill } from "../scripts/sanity/slices";

/**
 * The logo lists the content Studio pins by id (`sanity/content-structure.ts`)
 * are the documents the backfill creates, so editors open the imported list,
 * not an empty twin.
 */
test("every logo list the Studio pins is backfilled with that id", () => {
  const documents = collectBackfill();
  expect(logoListPinnedDocuments.length).toBeGreaterThan(0);
  for (const { id, type } of logoListPinnedDocuments) {
    expect(
      documents.find(({ _id }) => _id === id)?._type,
      `pinned logo list ${id}`,
    ).toBe(type);
  }
});
