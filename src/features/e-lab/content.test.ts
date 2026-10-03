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

import { eLabCopyFixture } from "@/lib/cms-fixtures/programmes";
import { getELabCopy, getELabFaqs, selectStages } from "./content";

const stages = eLabCopyFixture.gates.stages.map((stage) =>
  stage.kind === "gate"
    ? { ...stage, _type: "gateStage" }
    : { ...stage, _type: "phaseStage" },
);
test("real queries read synthetic CMS copy and FAQ", async () => {
  expect((await getELabCopy()).hero.title).toBe("Example programme");
  expect(await getELabFaqs()).toHaveLength(1);
});
test("deleted optional FAQ collection stays empty", async () => {
  documents = documents.filter((doc) => doc._type !== "faq");
  expect(await getELabFaqs()).toEqual([]);
});
test("missing copy singleton fails with its label", async () => {
  documents = documents.filter((doc) => doc._id !== "eLabCopy");
  await expect(getELabCopy()).rejects.toThrow("/e-lab copy");
});
test("required nested copy is validated", async () => {
  documents = documents.map((doc) =>
    doc._id === "eLabCopy" ? { ...doc, hero: { title: "Example" } } : doc,
  );
  await expect(getELabCopy()).rejects.toThrow("hero.lead");
});
test("unknown tokens fail without silently dropping stages", async () => {
  documents = documents.map((doc) =>
    doc._id === "eLabCopy"
      ? { ...doc, hero: { title: "{{unknown}}", lead: "Example" } }
      : doc,
  );
  await expect(getELabCopy()).rejects.toThrow(/unknown/i);
});
test("all five gate figures are required in funnel order", () => {
  expect(selectStages(stages)).toHaveLength(stages.length);
  expect(() => selectStages(stages.slice(1))).toThrow(/funnel order/);
  expect(() => selectStages([...stages.slice(0, -1), stages[0]])).toThrow(
    /funnel order/,
  );
  expect(() => selectStages([...stages].reverse())).toThrow(/funnel order/);
});
test("phase duration and image shape are required when supplied", () => {
  expect(() =>
    selectStages(
      stages.map((stage) =>
        stage._type === "phaseStage"
          ? { ...stage, duration: { amount: -1, unit: "weeks" } }
          : stage,
      ),
    ),
  ).toThrow(/duration/);
  expect(() =>
    selectStages(
      stages.map((stage) =>
        stage._type === "phaseStage"
          ? { ...stage, photo: { src: "x" } }
          : stage,
      ),
    ),
  ).toThrow(/width/);
});

test("phase anchors cannot collide with a gate anchor", () => {
  expect(() =>
    selectStages(
      stages.map((stage) =>
        stage._type === "phaseStage" ? { ...stage, id: "final-pitch" } : stage,
      ),
    ),
  ).toThrow(/unique/);
});
