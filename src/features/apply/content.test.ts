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

import { getApplyContent, getApplyFaqs } from "./content";

test("application content comes from CMS-shaped documents", async () => {
  const content = await getApplyContent();
  expect(content.copy.heroTitle).toBe("Applications");
  expect(content.copy.selection.lead).toBe("{{count}} stages");
  expect(content.milestones).toEqual([
    {
      year: 2024,
      kind: "programs",
      title: "An example program",
      detail: "A first local workshop",
    },
  ]);
  expect(content.journey.find((stage) => stage.kind === "fork")).toBeDefined();
  expect(await getApplyFaqs()).toEqual([
    {
      question: "Can I apply?",
      answer: "Read the current call for applications.",
    },
  ]);
});
test("removing optional milestones and FAQ entries stays empty", async () => {
  state.edit = (docs) =>
    docs.filter(
      (doc) =>
        doc._type !== "milestone" &&
        !(doc._type === "faq" && doc.collection === "apply"),
    );
  expect((await getApplyContent()).milestones).toEqual([]);
  expect(await getApplyFaqs()).toEqual([]);
});
test("required selection and copy fields cannot be omitted", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "applyCopy"
        ? {
            ...doc,
            selection: { title: "Selection", lead: "Stages", stages: [] },
          }
        : doc,
    );
  await expect(getApplyContent()).rejects.toThrow(/selection.stages/);
});
test("unknown stage timing and incomplete points fail", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "applyCopy"
        ? {
            ...doc,
            selection: {
              title: "Selection",
              lead: "Stages",
              stages: [{ title: "Stage", text: "Description", when: "never" }],
            },
          }
        : doc,
    );
  await expect(getApplyContent()).rejects.toThrow(/when/);
});
test("milestone enum and year are validated", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._type === "milestone" ? { ...doc, kind: "unknown" } : doc,
    );
  await expect(getApplyContent()).rejects.toBeInstanceOf(ContentError);
});
test("an optional milestone detail can be intentionally blank", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._type === "milestone" ? { ...doc, detail: "" } : doc,
    );
  expect((await getApplyContent()).milestones[0]?.detail).toBe("");
});
