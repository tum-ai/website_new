import { evaluate, parse } from "groq-js";
import { beforeEach, expect, test, vi } from "vitest";
import { getFixtureDocuments } from "@/lib/cms-fixtures";
import {
  getPartnerCaseStudies,
  getPartnerProfiles,
  getPartnersCopy,
} from "./content";

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
test("CMS singleton loads finder, hero image and token-derived facts", async () => {
  const copy = await getPartnersCopy();
  expect(copy.intents.map((item) => item.id)).toEqual([
    "talent",
    "hackathon",
    "brand",
    "research",
  ]);
  expect(copy.sections.hero.image.src).toBe("/assets/fixtures/photo.svg");
  expect(copy.prompts.resultQuestion).toContain("{{format}}");
  expect(copy.prompts.bookingLead).toContain("{{host}}");
  expect(copy.stats[0]?.value).not.toContain("{{");
});
test("blank optional copy and explicit empty collections remain cleared", async () => {
  const singleton = fixture.docs.find((doc) => doc._id === "partnersCopy");
  if (!singleton) throw new Error("fixture singleton missing");
  singleton.reasons = [];
  singleton.stats = null;
  singleton.pillars = null;
  const sections = singleton.sections as {
    hero: { lead: string };
    proof: { caption: unknown };
  };
  sections.hero.lead = "";
  sections.proof.caption = null;
  const copy = await getPartnersCopy();
  expect(copy.reasons).toEqual([]);
  expect(copy.stats).toEqual([]);
  expect(copy.pillars).toEqual([]);
  expect(copy.sections.hero.lead).toBe("");
  expect(copy.sections.proof.caption).toBe("");
});
test("missing singleton, uploaded hero and unknown placeholders fail visibly", async () => {
  const singleton = fixture.docs.find((doc) => doc._id === "partnersCopy");
  if (!singleton) throw new Error("fixture singleton missing");
  singleton.pitch = "{{unknown.fact}}";
  await expect(getPartnersCopy()).rejects.toThrow(/unknown placeholder/);
  fixture.docs = fixture.docs.filter((doc) => doc._id !== "partnersCopy");
  await expect(getPartnersCopy()).rejects.toThrow(/required object/);
});
test("required hero image cannot inherit retired imagery", async () => {
  const singleton = fixture.docs.find((doc) => doc._id === "partnersCopy");
  if (!singleton) throw new Error("fixture singleton missing");
  const sections = singleton.sections as { hero: { image: unknown } };
  sections.hero.image = null;
  await expect(getPartnersCopy()).rejects.toThrow(/hero.image/);
});

test("case studies and profiles resolve their CMS organization", async () => {
  expect((await getPartnerCaseStudies())[0]).toMatchObject({
    id: "caseStudy-example-company",
    name: "Example Company",
    organization: "example-company",
  });
  expect((await getPartnerProfiles())[0]?.role).toBe(
    "Engineer @ Example Company",
  );
  fixture.docs = fixture.docs.filter(
    (doc) => doc._type !== "caseStudy" && doc._type !== "person",
  );
  expect(await getPartnerCaseStudies()).toEqual([]);
  expect(await getPartnerProfiles()).toEqual([]);
});
test("broken case attribution never inherits a local name", async () => {
  fixture.docs = fixture.docs.filter(
    (doc) => doc._id !== "organization-example-company",
  );
  await expect(getPartnerCaseStudies()).rejects.toThrow(/organization/);
});
