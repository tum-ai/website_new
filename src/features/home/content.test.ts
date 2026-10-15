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
  expect(content.copy.join.quotes).toEqual([
    {
      key: "example-member",
      name: "Example Member",
      excerpt: "I built a small project with the team.",
    },
  ]);
  expect(Object.getPrototypeOf(content.copy.join.quotes[0])).toBe(
    Object.prototype,
  );
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
  await expect(getHomeContent()).rejects.toThrow(/quotes\[0\].key/);
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

function replaceQuotes(docs: CmsFixtureDocument[], quotes: unknown) {
  return docs.map((doc) =>
    doc._id === "homeCopy"
      ? { ...doc, join: { ...(doc.join as Record<string, unknown>), quotes } }
      : doc,
  );
}
const exampleQuote = {
  _key: "example-member",
  _type: "memberQuote",
  person: { _type: "reference", _ref: "person-member-story-example-member" },
  excerpt: "I built a small project with the team.",
};

test.each([undefined, null, [], Array.from({ length: 9 }, () => exampleQuote)])(
  "required member quotes reject a missing, cleared or oversized list (%j)",
  async (quotes) => {
    state.edit = (docs) => replaceQuotes(docs, quotes);
    await expect(getHomeContent()).rejects.toThrow(/join.quotes/);
  },
);

test("each member can be quoted only once", async () => {
  state.edit = (docs) =>
    replaceQuotes(docs, [exampleQuote, { ...exampleQuote, _key: "duplicate" }]);
  await expect(getHomeContent()).rejects.toThrow(/identifiers must be unique/);
});

test("each quote requires its own complete excerpt and member-story reference", async () => {
  state.edit = (docs) =>
    replaceQuotes(docs, [exampleQuote, { ...exampleQuote, excerpt: "" }]);
  await expect(getHomeContent()).rejects.toThrow(/quotes\[1\].excerpt/);
  state.edit = (docs) =>
    docs.map((doc) =>
      doc._id === exampleQuote.person._ref
        ? { ...doc, placement: "e-lab-testimonial" }
        : doc,
    );
  await expect(getHomeContent()).rejects.toThrow(/resolved member story/);
});

test("distinct members with the same name retain independent identity and order", async () => {
  state.edit = (docs) => {
    const member = docs.find((doc) => doc._id === exampleQuote.person._ref);
    if (!member) throw new Error("Missing test person");
    const second = {
      ...member,
      _id: "person-second",
      key: "second-member",
      story: "A second independent story.",
    };
    return replaceQuotes(
      [...docs, second],
      [
        exampleQuote,
        {
          _key: "second",
          _type: "memberQuote",
          person: { _type: "reference", _ref: second._id },
          excerpt: second.story,
        },
      ],
    );
  };
  const { copy } = await getHomeContent();
  expect(copy.join.quotes.map(({ key, name }) => ({ key, name }))).toEqual([
    { key: "example-member", name: "Example Member" },
    { key: "second-member", name: "Example Member" },
  ]);
});
