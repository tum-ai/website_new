import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { spanProblems } from "@/lib/passage-spans";
import type { QANDA_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildQandaBackfill,
  getQandaContent,
  QANDA_CONTENT_QUERY,
  selectFaqs,
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

  test("the member-journey answer lists the CMS journey's tracks, not the entry's own points", async () => {
    useSource("sanity");
    tamper.edit = (document) =>
      document.anchor === "member-journey"
        ? { ...document, points: ["A point the entry still holds."] }
        : document._type === "journeyStep" && document.number === "02B"
          ? { ...document, description: "Run a department. Then more." }
          : document;
    const { faqs: served } = await getQandaContent();
    const answer = served.find(({ id }) => id === "member-journey");
    expect(answer?.points).toHaveLength(2);
    expect(answer?.points).toContain(
      "In the initiative track you will run a department.",
    );
    expect(answer?.points).not.toContain("A point the entry still holds.");
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

describe("CMS entries", () => {
  const entry = (id: string, href = "/research") => ({
    id,
    question: `About ${id}?`,
    answer: "Yes.",
    points: null,
    spans: null,
    evidence: { text: null, label: "See it", href },
  });

  test("drop an anchor that is malformed, reserved or already used", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const served = selectFaqs(
      [entry("one"), entry("main-content"), entry("one"), entry("Two Words")],
      contentTokens,
    );
    expect(served.map(({ id }) => id)).toStrictEqual(["one"]);
    expect(warn).toHaveBeenCalledTimes(3);
    warn.mockRestore();
  });

  test("render evidence only with a link on the site or https", () => {
    const served = selectFaqs(
      [
        entry("site", "/community#journey"),
        entry("web", "https://example.com/"),
        entry("protocol-relative", "//evil.example"),
        entry("backslash", "/\\evil.example"),
        entry("script", "javascript:alert(1)"),
      ],
      contentTokens,
    );
    expect(
      served.map(({ id, evidence }) => [id, evidence?.href ?? null]),
    ).toStrictEqual([
      ["site", "/community#journey"],
      ["web", "https://example.com/"],
      ["protocol-relative", null],
      ["backslash", null],
      ["script", null],
    ]);
  });
});
