import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchContent } from "@/lib/cms-content";
import { spanProblems } from "@/lib/passage-spans";
import type { QANDA_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildQandaBackfill,
  getQandaContent,
  QANDA_CONTENT_QUERY,
} from "./content";
import { faqs, qandaCopy } from "./data/qanda";

/**
 * Parity: the backfill documents, read back through the real GROQ query
 * under the mock CMS, render exactly what the code renders.
 */
/** Lets a test change the backfill documents the mock CMS serves. */
const tamper = vi.hoisted(() => ({
  edit: null as null | ((document: Record<string, unknown>) => unknown),
}));

vi.mock("@/lib/cms-content-mock", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cms-content-mock")>();
  return {
    ...actual,
    evaluateMockQuery: (
      query: string,
      params: Record<string, unknown>,
      documents: readonly Record<string, unknown>[],
    ) =>
      actual.evaluateMockQuery(
        query,
        params,
        (tamper.edit ? documents.map(tamper.edit) : documents) as never,
      ),
  };
});

afterEach(() => {
  tamper.edit = null;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const fetchBackfill = () =>
  fetchContent<QANDA_CONTENT_QUERY_RESULT>({
    query: QANDA_CONTENT_QUERY,
    tags: [],
    mockDocuments: buildQandaBackfill,
    label: "parity",
  });

describe("the /qanda content slice", () => {
  test("code source: the code copy and questions", async () => {
    useSource("code");
    await expect(getQandaContent()).resolves.toStrictEqual({
      copy: qandaCopy,
      faqs,
    });
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchBackfill();
    expect(result?.copy?.missionPassage).toBe(qandaCopy.missionPassage);
    expect(result?.faqs.map(({ id }) => id)).toStrictEqual(
      faqs.map(({ id }) => id),
    );
  });

  test("sanity source over the backfill: the same copy and questions", async () => {
    useSource("sanity");
    await expect(getQandaContent()).resolves.toStrictEqual({
      copy: qandaCopy,
      faqs,
    });
  });

  test("the CMS mission phrases quote the CMS passage", async () => {
    useSource("sanity");
    const result = await fetchBackfill();
    const passage = result?.copy?.missionPassage ?? "";
    const spans = (result?.faqs ?? []).flatMap((faq) =>
      (faq.spans ?? []).map((text) => ({ id: faq.id ?? "", text })),
    );
    expect(spans.length).toBeGreaterThan(0);
    expect(spanProblems(passage, spans)).toStrictEqual([]);
  });

  test("a phrase the passage lacks is left unmarked, not fatal", async () => {
    useSource("sanity");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    tamper.edit = (document) =>
      document.anchor === "industry"
        ? { ...document, spans: ["words the passage never says"] }
        : document;
    const { faqs: served } = await getQandaContent();
    const industry = served.find(({ id }) => id === "industry");
    expect(industry).toBeDefined();
    expect(industry).not.toHaveProperty("spans");
    expect(served.filter(({ id }) => id !== "industry")).toStrictEqual(
      faqs.filter(({ id }) => id !== "industry"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("words the passage never says"),
    );
  });

  test("the backfill holds the copy singleton and one entry per question", () => {
    const documents = buildQandaBackfill();
    expect(documents.filter(({ _type }) => _type === "qandaCopy")).toHaveLength(
      1,
    );
    const entries = documents.filter(({ _type }) => _type === "faq");
    expect(entries.map(({ anchor }) => anchor)).toStrictEqual(
      faqs.map(({ id }) => id),
    );
    expect(new Set(entries.map(({ collection }) => collection))).toStrictEqual(
      new Set(["qanda"]),
    );
  });
});
