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

import {
  projectsCopyFixture,
  taskForcesFixture,
} from "@/lib/cms-fixtures/programmes";
import { getProjectsContent, selectProjectsContent } from "./content";

const organization = {
  _id: "organization-example-company",
  _type: "organization",
  key: "example-company",
  name: "Example Company",
};
test("query resolves task force partner references", async () => {
  documents = [...documents, organization];
  const content = await getProjectsContent();
  expect(content.taskForces[0]?.work?.partner).toBe("Example Company");
  expect(content.copy.hero.title).toBe("Example fields");
});
test("deleted optional task forces stay empty", async () => {
  documents = documents.filter((doc) => doc._type !== "taskForce");
  expect((await getProjectsContent()).taskForces).toEqual([]);
});
test("dangling work reference fails rather than inventing a partner", async () => {
  await expect(getProjectsContent()).rejects.toThrow(/partner/);
});
test("missing singleton fails visibly", async () => {
  documents = documents.filter((doc) => doc._id !== "projectsCopy");
  await expect(getProjectsContent()).rejects.toThrow(/projects content/);
});
test("malformed nested work and duplicate anchors are rejected", () => {
  expect(() =>
    selectProjectsContent({
      copy: projectsCopyFixture,
      taskForces: [
        { ...taskForcesFixture[0], work: { partner: "Example", items: [5] } },
      ],
    }),
  ).toThrow(/items/);
  expect(() =>
    selectProjectsContent({
      copy: projectsCopyFixture,
      taskForces: [...taskForcesFixture, ...taskForcesFixture],
    }),
  ).toThrow(/unique/);
});
