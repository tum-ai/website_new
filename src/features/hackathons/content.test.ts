import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { evaluateMockQuery } from "@/lib/cms-content-mock";
import {
  hackathonsFixture,
  hackathonsFixtureDocuments,
} from "@/lib/cms-fixtures/hackathons";
import type { CmsFixtureDocument } from "@/lib/cms-fixtures/types";
import {
  getHackathonsCopy,
  HACKATHONS_COPY_QUERY,
  parseHackathonsCopy,
} from "./content";

const mock = vi.hoisted(() => ({ documents: [] as CmsFixtureDocument[] }));
vi.mock("@/config/content-tokens", () => ({
  getContentTokens: async () => ({}),
}));
vi.mock("@/lib/cms-content-mock", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/cms-content-mock")>()),
  getMockContentDocuments: () => mock.documents,
}));
beforeEach(() => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  mock.documents = structuredClone([
    ...hackathonsFixtureDocuments,
    {
      _id: "fixture-photo",
      _type: "sanity.imageAsset",
      url: hackathonsFixture.makeathon.editionsPhoto.src,
      metadata: { dimensions: { width: 960, height: 640 } },
    },
  ]);
});
afterEach(() => vi.unstubAllEnvs());

const edit = () => mock.documents[0] as Record<string, unknown>;

describe("published hackathons copy", () => {
  test("the real query reads synthetic editions and leaves page tokens for the view", async () => {
    const projected = await evaluateMockQuery(
      HACKATHONS_COPY_QUERY,
      {},
      mock.documents,
    );
    expect(projected).toMatchObject({
      makeathon: { editions: hackathonsFixture.makeathon.editions },
    });
    const copy = await getHackathonsCopy();
    expect(copy.hero.lead).toContain("{{since}}");
    expect(copy.makeathon.editions).toEqual(
      hackathonsFixture.makeathon.editions,
    );
  });
  test("missing required singleton fails visibly", async () => {
    mock.documents = [];
    await expect(getHackathonsCopy()).rejects.toThrow(
      /hackathons copy.*required object/,
    );
  });
  test.each([
    ["missing title", { name: null }],
    ["reversed dates", { end: "2020-01-01" }],
    ["invalid date", { start: "2025-02-30" }],
    ["unknown placeholder", { note: "{{unknown.fact}}" }],
  ])("an edition with %s fails as a whole", async (_, change) => {
    const makeathon = edit().makeathon as {
      editions: Record<string, unknown>[];
    };
    Object.assign(makeathon.editions[0], change);
    await expect(getHackathonsCopy()).rejects.toThrow();
  });
  test("editor deletions replace editions, without restoring the removed edition", async () => {
    const makeathon = edit().makeathon as {
      editions: Record<string, unknown>[];
    };
    makeathon.editions = makeathon.editions.slice(-1);
    expect((await getHackathonsCopy()).makeathon.editions).toHaveLength(1);
  });
  test("empty structural editions, duplicate keys and wrong order fail", () => {
    for (const editions of [
      [],
      [
        hackathonsFixture.makeathon.editions[0],
        hackathonsFixture.makeathon.editions[0],
      ],
      [...hackathonsFixture.makeathon.editions].reverse(),
    ]) {
      expect(() =>
        parseHackathonsCopy({
          ...hackathonsFixture,
          makeathon: { ...hackathonsFixture.makeathon, editions },
        }),
      ).toThrow();
    }
  });
  test("blank optional results and empty runners-up stay cleared", async () => {
    const league = edit().league as { finale: Record<string, unknown> };
    Object.assign(league.finale, {
      champion: "",
      runnersUp: [],
      recapCaption: "",
    });
    expect((await getHackathonsCopy()).league.finale).toMatchObject({
      champion: "",
      runnersUp: [],
      recapCaption: "",
    });
  });
  test("a selected unresolved case-study fails", async () => {
    edit().voiceCaseStudy = { _type: "reference", _ref: "missing-case" };
    await expect(getHackathonsCopy()).rejects.toThrow(
      /voiceCaseStudy.*does not resolve/,
    );
  });
  test("case-study selection comes from the owner reference", async () => {
    edit().outcomeCaseStudy = { _type: "reference", _ref: "case-example" };
    mock.documents.push({ _id: "case-example", _type: "caseStudy" });
    expect((await getHackathonsCopy()).outcomeCaseStudy).toBe("case-example");
  });
  test("missing required and malformed optional images fail", async () => {
    const league = edit().league as { finale: Record<string, unknown> };
    league.finale.recapPhoto = {
      _type: "image",
      asset: { _type: "reference", _ref: "missing-image" },
    };
    await expect(getHackathonsCopy()).rejects.toThrow();
    delete league.finale.recapPhoto;
    league.finale.poster = null;
    await expect(getHackathonsCopy()).rejects.toThrow();
  });
});
