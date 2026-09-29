import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { memberJourney } from "@/features/community";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import { FAQ_QUERY } from "@/lib/faq-content";
import type {
  APPLY_CONTENT_QUERY_RESULT,
  FAQ_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  APPLY_CONTENT_QUERY,
  buildApplyBackfill,
  getApplyContent,
  getApplyFaqs,
} from "./content";
import { applyCopyTemplate, applyPageTokens } from "./data/apply";
import { faq } from "./data/faq";
import { milestones } from "./data/milestones";

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
    const documents = buildApplyBackfill().filter(
      ({ _type }) => _type === "faq",
    );
    expect(documents.map(({ question }) => question)).toStrictEqual(
      faq.map(({ question }) => question),
    );
    expect(
      new Set(documents.map(({ collection }) => collection)),
    ).toStrictEqual(new Set(["apply"]));
  });
});

describe("the /apply copy, milestones and journey", () => {
  const code = {
    copy: fillCodeCopy(applyCopyTemplate, contentTokens, applyPageTokens),
    milestones: fillCodeCopy(milestones, contentTokens),
    journey: memberJourney,
  };

  test("code source: the code copy, milestones and journey", async () => {
    useSource("code");
    await expect(getApplyContent()).resolves.toStrictEqual(code);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<APPLY_CONTENT_QUERY_RESULT>({
      query: APPLY_CONTENT_QUERY,
      tags: [],
      mockDocuments: buildApplyBackfill,
      label: "parity",
    });
    expect(result?.copy?.selection?.stages).toHaveLength(
      applyCopyTemplate.selection.stages.length,
    );
    expect(result?.milestones).toHaveLength(milestones.length);
  });

  test("sanity source over the backfill: the same copy and milestones", async () => {
    useSource("sanity");
    await expect(getApplyContent()).resolves.toStrictEqual(code);
  });

  test("the backfill holds the copy and one document per milestone", () => {
    const documents = buildApplyBackfill();
    expect(documents.filter(({ _type }) => _type === "applyCopy")).toHaveLength(
      1,
    );
    expect(documents.filter(({ _type }) => _type === "milestone")).toHaveLength(
      milestones.length,
    );
  });
});
