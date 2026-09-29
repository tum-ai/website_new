import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import { FAQ_QUERY } from "@/lib/faq-content";
import type {
  ELAB_COPY_QUERY_RESULT,
  FAQ_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  buildELabBackfill,
  ELAB_COPY_QUERY,
  getELabCopy,
  getELabFaqs,
  selectStages,
} from "./content";
import { eLabCopyTemplate, eLabPageTokens } from "./data/copy";
import { faq } from "./data/faq";
import { buildStages, selectionStages } from "./data/selection";

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

describe("the /e-lab content slice", () => {
  test("code source: the code FAQ", async () => {
    useSource("code");
    await expect(getELabFaqs()).resolves.toStrictEqual(faq);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<FAQ_QUERY_RESULT>({
      query: FAQ_QUERY,
      params: { collection: "e-lab" },
      tags: [],
      mockDocuments: buildELabBackfill,
      label: "parity",
    });
    expect(result).toHaveLength(faq.length);
  });

  test("sanity source over the backfill: the same FAQ", async () => {
    useSource("sanity");
    await expect(getELabFaqs()).resolves.toStrictEqual(faq);
  });

  test("the backfill holds one e-lab FAQ document per question", () => {
    const documents = buildELabBackfill().filter(
      ({ _type }) => _type === "faq",
    );
    expect(documents.map(({ question }) => question)).toStrictEqual(
      faq.map(({ question }) => question),
    );
    expect(
      new Set(documents.map(({ collection }) => collection)),
    ).toStrictEqual(new Set(["e-lab"]));
  });
});

describe("the /e-lab copy", () => {
  const code = fillCodeCopy(eLabCopyTemplate, contentTokens, eLabPageTokens);

  test("code source: the code copy, whose stages draw the code cohort", async () => {
    useSource("code");
    const copy = await getELabCopy();
    expect(copy).toStrictEqual(code);
    expect(buildStages(copy.gates.stages)).toStrictEqual(selectionStages);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<ELAB_COPY_QUERY_RESULT>({
      query: ELAB_COPY_QUERY,
      tags: [],
      mockDocuments: buildELabBackfill,
      label: "parity",
    });
    expect(result?.gates?.stages).toHaveLength(
      eLabCopyTemplate.gates.stages.length,
    );
  });

  test("sanity source over the backfill: the same copy", async () => {
    useSource("sanity");
    await expect(getELabCopy()).resolves.toStrictEqual(code);
  });
});

describe("the CMS stages", () => {
  const { stages } = fillCodeCopy(
    eLabCopyTemplate,
    contentTokens,
    eLabPageTokens,
  ).gates;
  // The stages as the query returns them, before `toStage`.
  const raw = stages.map(({ kind, ...stage }) => ({
    _type: kind === "gate" ? "gateStage" : "phaseStage",
    ...stage,
  }));

  test("a whole list is served as it is", () => {
    expect(selectStages(raw, raw.length)).toStrictEqual(stages);
  });

  test.each([
    ["a stage dropped for an unknown placeholder", raw.slice(1), raw.length],
    [
      "a gate figure missing",
      raw.filter((stage) => !("figure" in stage) || stage.figure !== "midterm"),
      raw.length - 1,
    ],
    [
      "a gate figure twice",
      raw.map((stage) =>
        "figure" in stage && stage.figure === "midterm"
          ? { ...stage, figure: "admitted" }
          : stage,
      ),
      raw.length,
    ],
    [
      "an incomplete stage",
      raw.map((stage, index) => (index === 0 ? { ...stage, name: "" } : stage)),
      raw.length,
    ],
  ])("%s keeps the code cohort", (_, list, fetched) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(selectStages(list, fetched)).toStrictEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
