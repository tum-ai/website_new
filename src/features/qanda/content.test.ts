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

import { getQandaContent } from "./content";

test("CMS Q&A spans mark exact passage text and journey points derive from CMS", async () => {
  const content = await getQandaContent();
  expect(content.copy.heroTitle).toBe("Questions");
  expect(content.faqs[0]?.spans).toEqual(["build small projects"]);
  expect(
    content.faqs.find((faq) => faq.id === "member-journey")?.points,
  ).toEqual([
    "In the build track you will join a small project.",
    "In the organize track you will join a team to organize activities.",
  ]);
});
test("clearing all optional questions stays empty", async () => {
  state.edit = (docs) =>
    docs.filter((doc) => !(doc._type === "faq" && doc.collection === "qanda"));
  expect((await getQandaContent()).faqs).toEqual([]);
});
test("explicit optional empty lists and text remain empty", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "faq-qanda-projects"
        ? {
            ...doc,
            points: [],
            spans: [],
            evidence: {
              text: "",
              label: "Explore projects",
              href: "/projects",
            },
          }
        : doc,
    );
  const faq = (await getQandaContent()).faqs[0];
  expect(faq).toMatchObject({ points: [], spans: [], evidence: { text: "" } });
});
test.each(["main-content", "Invalid Anchor", "workshops"])(
  "rejects malformed, reserved or duplicate anchors: %s",
  async (anchor) => {
    state.edit = (docs) =>
      docs.map((doc) =>
        doc._id === "faq-qanda-projects" ? { ...doc, anchor } : doc,
      );
    await expect(getQandaContent()).rejects.toThrow(/anchor/);
  },
);
test.each(["not in passage", "Members build small projects"])(
  "invalid or overlapping spans fail: %s",
  async (span) => {
    state.edit = (docs) =>
      docs.map((doc) =>
        doc._id === "faq-qanda-workshops" ? { ...doc, spans: [span] } : doc,
      );
    await expect(getQandaContent()).rejects.toThrow(/spans/);
  },
);
test("unresolved required copy fails without historical text", async () => {
  state.edit = (docs) => docs.filter((doc) => doc._id !== "qandaCopy");
  await expect(getQandaContent()).rejects.toBeInstanceOf(ContentError);
});
test("unsafe evidence links and incomplete groups fail", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "faq-qanda-projects"
        ? { ...doc, evidence: { label: "Visit", href: "javascript:alert(1)" } }
        : doc,
    );
  await expect(getQandaContent()).rejects.toThrow(/safe site path/);
});
