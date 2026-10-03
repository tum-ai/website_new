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

import { getHomeContent } from "./content";

test("home copy has serializable complete quote groups and resolved artwork", async () => {
  const content = await getHomeContent();
  expect(content.copy.hero.title).toBe("A place to build");
  expect(content.copy.room.photos).toHaveLength(5);
  expect(content.copy.join.quote).toEqual({
    key: "example-member",
    name: "Example Member",
    excerpt: "I built a small project with the team.",
  });
  expect(Object.getPrototypeOf(content.copy.join.quote)).toBe(Object.prototype);
  expect(JSON.parse(JSON.stringify(content.copy))).toEqual(content.copy);
  expect(content.copy.partners.quote).toBe("example-founder");
  expect(content.departmentCount).toBe(1);
});
test("empty departments yield zero without a local count", async () => {
  state.edit = (docs) => docs.filter((doc) => doc._type !== "department");
  expect((await getHomeContent()).departmentCount).toBe(0);
});
test("a missing member reference cannot acquire another author", async () => {
  state.edit = (docs) =>
    docs.filter((doc) => doc._id !== "person-member-story-example-member");
  await expect(getHomeContent()).rejects.toThrow(/quote.key/);
});
test("the quoted excerpt must still occur in the resolved story", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "person-member-story-example-member"
        ? { ...doc, story: "A different story." }
        : doc,
    );
  await expect(getHomeContent()).rejects.toThrow(/word for word/);
});
test("partner quote must resolve to an E-Lab testimonial", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "person-e-lab-testimonial-example-founder"
        ? { ...doc, placement: "member-story" }
        : doc,
    );
  await expect(getHomeContent()).rejects.toThrow(/resolved E-Lab testimonial/);
});
test("structural home lists retain required counts", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "homeCopy"
        ? { ...doc, room: { title: "Room", lead: "Lead", photos: [] } }
        : doc,
    );
  await expect(getHomeContent()).rejects.toThrow(/exactly 5 photos/);
});
test("missing required singleton fails visibly", async () => {
  state.edit = (docs) => docs.filter((doc) => doc._id !== "homeCopy");
  await expect(getHomeContent()).rejects.toBeInstanceOf(ContentError);
});
