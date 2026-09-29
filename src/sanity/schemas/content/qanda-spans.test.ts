import type { ValidationContext } from "sanity";
import { describe, expect, test } from "vitest";
import { evaluateMockQuery } from "@/lib/cms-content-mock";
import { validateEntrySpans, validatePassageSpans } from "./qanda-spans";

const passage = "We build, we teach, and we found.";

const documents = [
  { _id: "qandaCopy", _type: "qandaCopy", missionPassage: passage },
  {
    _id: "faq-qanda-build",
    _type: "faq",
    collection: "qanda",
    question: "Do you build?",
    spans: ["We build"],
  },
  {
    _id: "drafts.faq-qanda-build",
    _type: "faq",
    collection: "qanda",
    question: "Do you build?",
    spans: ["a draft phrase"],
  },
  {
    _id: "faq-apply-x",
    _type: "faq",
    collection: "apply",
    question: "Not on the Q&A page",
    spans: ["nowhere"],
  },
];

/** A validation context whose client runs GROQ over `docs` with groq-js. */
function contextOf(
  document: Record<string, unknown> | undefined,
  docs: readonly Record<string, unknown>[] = documents,
) {
  return {
    document,
    getClient: () => ({
      fetch: (query: string, params: Record<string, unknown> = {}) =>
        evaluateMockQuery(query, params, docs as never),
    }),
  } as unknown as ValidationContext;
}

const entry = (spans: string[], id = "drafts.faq-qanda-teach") =>
  validateEntrySpans(
    spans,
    contextOf({ _id: id, _type: "faq", collection: "qanda" }),
  );

describe("the Q&A mission phrase validation", () => {
  test("accepts phrases that occur once and don't overlap other entries'", async () => {
    await expect(entry(["we teach"])).resolves.toBe(true);
  });

  test("rejects a phrase the published passage doesn't contain", async () => {
    await expect(entry(["we research"])).resolves.toMatch(
      /not in the passage: "we research"/,
    );
  });

  test("rejects a phrase that occurs more than once", async () => {
    await expect(entry(["we"])).resolves.toMatch(/more than once/);
  });

  test("rejects a phrase that overlaps another published entry's", async () => {
    await expect(entry(["build, we teach"])).resolves.toMatch(/overlap/);
  });

  test("checks an entry's draft against its own published phrases only once", async () => {
    await expect(entry(["We build"], "drafts.faq-qanda-build")).resolves.toBe(
      true,
    );
  });

  test("ignores other pages and entries without phrases", async () => {
    await expect(
      validateEntrySpans(
        ["nowhere"],
        contextOf({ _id: "faq-apply-x", collection: "apply" }),
      ),
    ).resolves.toBe(true);
    await expect(
      validateEntrySpans(
        undefined,
        contextOf({ _id: "faq-qanda-x", collection: "qanda" }),
      ),
    ).resolves.toBe(true);
  });

  test("passes while no passage is published (the page uses the code one)", async () => {
    await expect(
      validateEntrySpans(
        ["anything"],
        contextOf(
          { _id: "faq-qanda-x", collection: "qanda" },
          documents.slice(1),
        ),
      ),
    ).resolves.toBe(true);
  });
});

describe("the Q&A mission passage validation", () => {
  test("accepts a passage every published phrase still quotes", async () => {
    await expect(
      validatePassageSpans(passage, contextOf({ _id: "qandaCopy" })),
    ).resolves.toBe(true);
  });

  test("names the questions whose phrases an edit breaks", async () => {
    await expect(
      validatePassageSpans(
        "We make, we teach, and we found.",
        contextOf({ _id: "qandaCopy" }),
      ),
    ).resolves.toMatch(/no longer match the passage.*Do you build\?/);
  });

  test("ignores an empty passage", async () => {
    await expect(
      validatePassageSpans(undefined, contextOf({ _id: "qandaCopy" })),
    ).resolves.toBe(true);
  });
});
