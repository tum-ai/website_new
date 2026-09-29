import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchContent } from "@/lib/cms-content";
import { FAQ_QUERY } from "@/lib/faq-content";
import type { FAQ_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { buildApplyBackfill, getApplyFaqs } from "./content";
import { faq } from "./data/faq";

/**
 * Parity: the backfill documents, read back through the real GROQ query
 * under the mock CMS, render exactly what the code renders. If this fails,
 * the query, `select` or the builder lost or changed something on the way to
 * the CMS.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

describe("the /apply content slice", () => {
  test("code source: the code FAQ", async () => {
    useSource("code");
    await expect(getApplyFaqs()).resolves.toStrictEqual(faq);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<FAQ_QUERY_RESULT>({
      query: FAQ_QUERY,
      params: { collection: "apply" },
      tags: [],
      mockDocuments: buildApplyBackfill,
      label: "parity",
    });
    expect(result).toHaveLength(faq.length);
  });

  test("sanity source over the backfill: the same FAQ", async () => {
    useSource("sanity");
    await expect(getApplyFaqs()).resolves.toStrictEqual(faq);
  });

  test("the backfill holds one apply FAQ document per question", () => {
    const documents = buildApplyBackfill();
    expect(documents.map(({ question }) => question)).toStrictEqual(
      faq.map(({ question }) => question),
    );
    expect(
      new Set(documents.map(({ collection }) => collection)),
    ).toStrictEqual(new Set(["apply"]));
  });
});
