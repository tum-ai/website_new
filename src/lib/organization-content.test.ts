import { evaluate, parse } from "groq-js";
import { beforeEach, expect, test, vi } from "vitest";
import { ContentError } from "./cms-content-model";
import { getFixtureDocuments } from "./cms-fixtures";
import {
  getLogoLists,
  getPartnerOrganizations,
  toOrganization,
} from "./organization-content";

const fixture = vi.hoisted(() => ({ docs: [] as Record<string, unknown>[] }));
vi.mock("./cms-content", () => ({
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
test("resolves organization reference order and editorial partnership order", async () => {
  const lists = await getLogoLists({
    surfaces: ["e-lab-ventures", "partner-marquee"],
    label: "logos",
  });
  expect(lists["e-lab-ventures"][0]?.key).toBe("example-venture");
  expect(lists["partner-marquee"][0]?.logoOnDark?.src).toBe(
    "/assets/fixtures/logo.svg",
  );
  expect(
    (await getPartnerOrganizations({ label: "partners" }))[0]?.partnership,
  ).toMatchObject({ tier: "gold", featured: true, order: 10 });
});
test("honors an editor-owned logo list id through its requested surface", async () => {
  const list = fixture.docs.find((doc) => doc._id === "logolist-ehl-partners");
  if (!list) throw new Error("fixture EHL list missing");
  list._id = "editor-ehl";
  const result = await getLogoLists({
    surfaces: ["ehl-partners"],
    label: "EHL logos",
  });
  expect(
    result["ehl-partners"].map((organization) => organization.key),
  ).toEqual(["example-company"]);
});
test("rejects competing documents for the same requested surface", async () => {
  const list = fixture.docs.find((doc) => doc._id === "logolist-ehl-partners");
  if (!list) throw new Error("fixture EHL list missing");
  fixture.docs.push({ ...list, _id: "editor-ehl" });
  await expect(
    getLogoLists({ surfaces: ["ehl-partners"], label: "EHL logos" }),
  ).rejects.toThrow(/duplicate surface/);
});

test("explicit empty or removed optional lists never restore entries", async () => {
  const doc = fixture.docs.find((doc) => doc._id === "logolist-e-lab-ventures");
  if (doc) doc.organizations = [];
  expect(
    (await getLogoLists({ surfaces: ["e-lab-ventures"], label: "logos" }))[
      "e-lab-ventures"
    ],
  ).toEqual([]);
  fixture.docs = fixture.docs.filter(
    (doc) => doc._id !== "logolist-e-lab-ventures",
  );
  expect(
    (await getLogoLists({ surfaces: ["e-lab-ventures"], label: "logos" }))[
      "e-lab-ventures"
    ],
  ).toEqual([]);
});
test("dangling list references fail visibly", async () => {
  fixture.docs = fixture.docs.filter(
    (doc) => doc._id !== "organization-example-venture",
  );
  await expect(
    getLogoLists({ surfaces: ["e-lab-ventures"], label: "logos" }),
  ).rejects.toThrow(ContentError);
});
test("malformed identities and present artwork are rejected", () => {
  expect(() => toOrganization(null)).toThrow(ContentError);
  expect(() =>
    toOrganization({ key: "sample", name: "Sample", partnerTier: "unknown" }),
  ).toThrow(/unknown tier/);
  expect(() =>
    toOrganization({
      key: "sample",
      name: "Sample",
      logo: { src: null, width: 200, height: 80 },
    }),
  ).toThrow(/artwork/);
});
test("invalid logo dimensions and missing descriptive alt are rejected", () => {
  expect(() =>
    toOrganization({
      key: "sample",
      name: "Sample",
      logo: {
        src: "https://example.com/logo",
        width: -1,
        height: 80,
        alt: "Sample",
      },
    }),
  ).toThrow(/dimensions/);
  expect(() =>
    toOrganization({
      key: "sample",
      name: "Sample",
      logo: {
        src: "https://example.com/logo",
        width: 200,
        height: 80,
        alt: "",
      },
    }),
  ).toThrow(/alt/);
});

test("optional organization text can be intentionally cleared", () => {
  expect(
    toOrganization({ key: "sample", name: "Sample", shortName: "", href: "" }),
  ).toEqual({ key: "sample", name: "Sample", shortName: "" });
});
