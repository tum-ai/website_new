import { evaluate, parse } from "groq-js";
import { beforeEach, expect, test, vi } from "vitest";
import { getFixtureDocuments } from "@/lib/cms-fixtures";
import {
  getELabVoices,
  getNotableStartups,
  getTestimonialCards,
  getTracedVenture,
  selectTracedVenture,
} from "./venture-content";

const fixture = vi.hoisted(() => ({ docs: [] as Record<string, unknown>[] }));
vi.mock("@/lib/cms-content", () => ({
  loadContent: async ({
    query,
    params,
    select,
  }: {
    query: string;
    params?: Record<string, unknown>;
    select: (result: unknown) => unknown;
  }) =>
    select(
      await (
        await evaluate(parse(query), { dataset: fixture.docs, params })
      ).get(),
    ),
}));
beforeEach(() => {
  fixture.docs = structuredClone(getFixtureDocuments());
});
test("testimonials, logo list and trace resolve the same venture", async () => {
  const trace = await getTracedVenture();
  expect((await getNotableStartups()).map((s) => s.id)).toContain(
    trace.startupId,
  );
  expect(
    (await getTestimonialCards()).find((p) => p.id === trace.testimonialId)
      ?.context,
  ).toBe(trace.cohort);
  expect(await getELabVoices()).toEqual({
    founders: ["example-founder"],
    investors: ["example-investor"],
  });
});
test("cleared voices remain empty and unresolved person references fail", async () => {
  const copy = fixture.docs.find((doc) => doc._id === "eLabCopy");
  if (!copy) throw new Error("fixture eLabCopy missing");
  copy.voices = { founders: [], investors: [] };
  expect(await getELabVoices()).toEqual({ founders: [], investors: [] });
  copy.voices = {
    founders: [{ _type: "reference", _ref: "missing" }],
    investors: [],
  };
  await expect(getELabVoices()).rejects.toThrow(/founders/);
});
test("voice selections reject people from another placement", async () => {
  const copy = fixture.docs.find((doc) => doc._id === "eLabCopy");
  if (!copy) throw new Error("fixture eLabCopy missing");
  copy.voices = {
    founders: [
      { _type: "reference", _ref: "person-member-story-example-member" },
    ],
    investors: [],
  };
  await expect(getELabVoices()).rejects.toThrow(/E-Lab testimonial/);
});
test("trace rejects an organization removed from its venture list", async () => {
  const list = fixture.docs.find(
    (doc) => doc._id === "logolist-e-lab-ventures",
  );
  if (!list) throw new Error("fixture venture list missing");
  list.organizations = [];
  await expect(getTracedVenture()).rejects.toThrow(/ventures logo list/);
});

test("deleted optional testimonials stay empty", async () => {
  fixture.docs = fixture.docs.filter((doc) => doc._type !== "person");
  expect(await getTestimonialCards()).toEqual([]);
  await expect(getTracedVenture()).rejects.toThrow(/person/);
});
test("trace validates coherent attribution and sourced milestones", () => {
  const trace = {
    startupId: "sample",
    testimonialId: "founder",
    cohort: "Sample cohort",
    founderContext: "Sample cohort",
    founderPlacement: "e-lab-testimonial",
    startupListed: true,
    after: [{ text: "Prototype", source: "https://example.com" }],
  };
  expect(selectTracedVenture({ ...trace, now: "" }).now).toBe("");
  expect(() =>
    selectTracedVenture({ ...trace, founderContext: "Other cohort" }),
  ).toThrow(/must match/);
  expect(() => selectTracedVenture({ ...trace, after: [] })).toThrow(
    /at least one/,
  );
  expect(() =>
    selectTracedVenture({
      ...trace,
      after: [{ text: "Prototype", source: "http://example.com" }],
    }),
  ).toThrow(/HTTPS/);
});
