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

import { getMemberStories } from "./people-content";

test("member stories use published person data and resolved portraits", async () => {
  const stories = await getMemberStories();
  expect(stories).toHaveLength(1);
  expect(stories[0]).toMatchObject({
    key: "example-member",
    name: "Example Member",
    story: expect.stringContaining("I built a small project with the team."),
    image: "/assets/fixtures/photo.svg",
  });
});
test("deleted member stories remain deleted", async () => {
  state.edit = (docs) => docs.filter((doc) => doc.placement !== "member-story");
  expect(await getMemberStories()).toEqual([]);
});
test("missing story or unresolved portrait fails at the person boundary", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc.placement === "member-story" ? { ...doc, portrait: null } : doc,
    );
  await expect(getMemberStories()).rejects.toBeInstanceOf(ContentError);
});
