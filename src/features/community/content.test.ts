import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  evaluateMockQuery,
  getMockContentDocuments,
} from "@/lib/cms-content-mock";
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

import { COMMUNITY_COPY_QUERY, getCommunityContent } from "./content";

test("published community content follows the real projection", async () => {
  const result = await getCommunityContent();
  expect(result.copy.hero.title).toBe("A student community");
  expect(result.copy.hero.photo).toMatchObject({
    src: "/assets/fixtures/photo.svg",
    width: 960,
    height: 640,
  });
  expect(result.journey.map(({ kind }) => kind)).toEqual(["single", "fork"]);
  expect(result.departments.map(({ name }) => name)).toEqual(["Example team"]);
  const raw = await evaluateMockQuery<{ hero: { photo: { src: string } } }>(
    COMMUNITY_COPY_QUERY,
    {},
    await getMockContentDocuments(),
  );
  expect(raw.hero.photo.src).toBe("/assets/fixtures/photo.svg");
});
test("required page copy fails at its field boundary", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === "communityCopy" ? { ...doc, hero: {} } : doc,
    );
  await expect(getCommunityContent()).rejects.toThrow(
    /community copy.hero.title/,
  );
});
test("a removed singleton cannot resurrect local copy", async () => {
  state.edit = (docs) => docs.filter((doc) => doc._id !== "communityCopy");
  await expect(getCommunityContent()).rejects.toBeInstanceOf(ContentError);
});
test("empty departments are intentionally empty", async () => {
  state.edit = (docs) => docs.filter((doc) => doc._type !== "department");
  await expect(getCommunityContent()).resolves.toMatchObject({
    departments: [],
  });
});
test("unknown placeholders fail without dropping the department", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._type === "department"
        ? { ...doc, description: "{{missing.token}}" }
        : doc,
    );
  await expect(getCommunityContent()).rejects.toThrow(/unknown placeholder/i);
});

test("cleared optional department photo and caption stay absent", async () => {
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._type === "department"
        ? { ...doc, photo: null, photoCaption: "" }
        : doc,
    );
  const department = (await getCommunityContent()).departments[0];
  expect(department?.photo).toBeUndefined();
  expect(department?.photoCaption).toBe("");
});
