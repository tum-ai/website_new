import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ContentError } from "@/lib/cms-content-model";
import type { CmsFixtureDocument } from "@/lib/cms-fixtures/types";

const state = vi.hoisted(() => ({
  edit: (docs: CmsFixtureDocument[]) => docs,
}));
vi.mock("@/lib/cms-content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cms-content")>();
  const fixture = await import("@/lib/cms-content-mock");
  return {
    ...actual,
    loadContent: async <T, R>({
      query,
      params = {},
      select,
    }: {
      query: string;
      params?: Record<string, unknown>;
      select: (result: R) => T;
    }) =>
      select(
        await fixture.evaluateMockQuery<R>(
          query,
          params,
          state.edit(structuredClone(await fixture.getMockContentDocuments())),
        ),
      ),
  };
});
beforeEach(() => {
  state.edit = (docs) => docs;
});
afterEach(() => {
  vi.restoreAllMocks();
});

import { getFaqs } from "./faq-content";

test("FAQ collections query CMS independently and retain published ordering", async () => {
  expect(await getFaqs("apply", { tokens: {} as never })).toEqual([
    {
      question: "Can I apply?",
      answer: "Read the current call for applications.",
    },
  ]);
});
test("FAQ deletion stays deleted", async () => {
  state.edit = (docs) => docs.filter((doc) => doc.collection !== "apply");
  expect(await getFaqs("apply", { tokens: {} as never })).toEqual([]);
});
test("unknown placeholders fail instead of silently dropping an answer", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc.collection === "apply"
        ? { ...doc, answer: "{{unknown.value}}" }
        : doc,
    );
  await expect(getFaqs("apply", { tokens: {} as never })).rejects.toThrow(
    /unknown placeholder/i,
  );
});
test("an incomplete question fails at its field path", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc.collection === "apply" ? { ...doc, question: "" } : doc,
    );
  await expect(
    getFaqs("apply", { tokens: {} as never }),
  ).rejects.toBeInstanceOf(ContentError);
});
