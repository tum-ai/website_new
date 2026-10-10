import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { evaluateMockQuery } from "@/lib/cms-content-mock";
import { eventsCopyFixture } from "@/lib/cms-fixtures/hackathons";
import type { CmsFixtureDocument } from "@/lib/cms-fixtures/types";
import { EVENTS_COPY_QUERY, getEventsCopy } from "./content";

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
  mock.documents = [
    {
      _id: "eventsCopy",
      _type: "eventsCopy",
      ...structuredClone(eventsCopyFixture),
    },
  ];
});
afterEach(() => vi.unstubAllEnvs());

describe("published events copy", () => {
  test("the real query reads editor content and leaves page tokens for sections", async () => {
    expect(
      await evaluateMockQuery(EVENTS_COPY_QUERY, {}, mock.documents),
    ).toEqual(eventsCopyFixture);
    expect(await getEventsCopy()).toEqual(eventsCopyFixture);
  });
  test("missing singleton fails instead of restoring local wording", async () => {
    mock.documents = [];
    await expect(getEventsCopy()).rejects.toThrow(
      /events copy.*required object/,
    );
  });
  test.each([null, "", 42])(
    "an invalid required field %s fails",
    async (emptyLead) => {
      mock.documents[0].hero = { emptyLead };
      await expect(getEventsCopy()).rejects.toThrow(/hero.emptyLead/);
    },
  );
  test("an unknown token fails visibly", async () => {
    mock.documents[0].hero = { emptyLead: "{{unknown.example}}" };
    await expect(getEventsCopy()).rejects.toThrow(/unknown/);
  });
  test("editor changes are returned exactly", async () => {
    mock.documents[0].hero = { emptyLead: "An edited introduction." };
    expect((await getEventsCopy()).hero.emptyLead).toBe(
      "An edited introduction.",
    );
  });
});
