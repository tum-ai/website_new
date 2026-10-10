import { evaluate, parse } from "groq-js";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { programmesFixtureDocuments } from "@/lib/cms-fixtures/programmes";
import type { CmsFixtureDocument } from "@/lib/cms-fixtures/types";

let documents: readonly CmsFixtureDocument[];
vi.mock("@/config/content-tokens", () => ({
  getContentTokens: async () => ({}),
}));
vi.mock("@/lib/cms-content-mock", () => ({
  getMockContentDocuments: () => documents,
  evaluateMockQuery: async (
    query: string,
    params: Record<string, unknown>,
    dataset: readonly CmsFixtureDocument[],
  ) => {
    const result = await evaluate(parse(query, { params }), {
      params,
      dataset,
    });
    return result.get();
  },
}));
beforeEach(() => {
  documents = structuredClone(programmesFixtureDocuments);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
});
afterEach(() => vi.unstubAllEnvs());

import { labSitesFixture } from "@/lib/cms-fixtures/programmes";
import { getLabSiteList, getResearchCopy, selectLabSites } from "./content";

const organization = {
  _id: "organization-example-company",
  _type: "organization",
  key: "example-company",
  name: "Example Company",
};
const image = {
  _id: "fixture-photo",
  _type: "sanity.imageAsset",
  url: "/assets/fixtures/photo.svg",
  metadata: { dimensions: { width: 960, height: 640 } },
};
test("query resolves uploaded panels and lab organizations", async () => {
  documents = [...documents, organization, image];
  const copy = await getResearchCopy();
  expect(copy.figurePanels[0]).toMatchObject({
    src: "/assets/fixtures/photo.svg",
    width: 960,
    caption: "Example figure.",
  });
  expect((await getLabSiteList())[0]?.organizations[0]?.name).toBe(
    "Example Company",
  );
});
test("deleted optional lab sites stay empty", async () => {
  documents = documents.filter((doc) => doc._type !== "labSite");
  expect(await getLabSiteList()).toEqual([]);
});
test("required figure structure rejects an empty list", async () => {
  documents = documents.map((doc) =>
    doc._id === "researchCopy" ? { ...doc, figurePanels: [] } : doc,
  );
  await expect(getResearchCopy()).rejects.toThrow(/two to four/);
});
test("missing copy and dangling organizations fail visibly", async () => {
  documents = documents.filter((doc) => doc._id !== "researchCopy");
  await expect(getResearchCopy()).rejects.toThrow(/research copy/);
  await expect(getLabSiteList()).rejects.toThrow(/object/);
});
test("geographic and home-site invariants are validated", () => {
  expect(() =>
    selectLabSites([{ ...labSitesFixture[0], location: [91, 11] }]),
  ).toThrow(/latitude/);
  expect(() =>
    selectLabSites([{ ...labSitesFixture[0], home: false }]),
  ).toThrow(/exactly one home/);
  expect(() =>
    selectLabSites([{ ...labSitesFixture[0], organizations: [null] }]),
  ).toThrow(/object/);
});
