import { expect, test } from "vitest";
import { getPartnerKey } from "@/features/partners/partner-key";
import {
  applyPartnerMigration,
  type MigrationClient,
} from "../scripts/sanity/apply-partner-migration";
import { planPartnerMigration } from "../scripts/sanity/partner-migration";

const plan = (
  organizations: Parameters<typeof planPartnerMigration>[0]["organizations"],
) =>
  planPartnerMigration({
    organizations,
    partners: [
      {
        _id: "p-a",
        name: "Example alias",
        category: "Research Partners",
        tier: "silver",
        link: "https://example.com/",
        image: { asset: { _ref: "image-existing" } },
      },
    ],
    companyKey: getPartnerKey,
    organizationId: (key) => `organization-${key}`,
  });
test("matches CMS key/name/shortName, preserves edits and fills from CMS partner", () => {
  const result = plan([
    {
      _id: "org",
      key: "example",
      name: "Example company",
      shortName: "Example alias",
      partnerTier: "gold",
    },
  ]);
  expect(result.steps).toMatchObject([
    {
      action: "update",
      id: "org",
      set: {
        partnerCategory: "Research Partners",
        legacyPartnerId: "p-a",
        href: "https://example.com/",
        logo: { asset: { _ref: "image-existing" } },
      },
    },
  ]);
  expect(result.steps[0]).not.toHaveProperty("set.partnerTier");
});
test("missing organization is created from the CMS document without a local catalog or upload", () => {
  expect(plan([]).steps).toMatchObject([
    {
      action: "create",
      source: "partner",
      document: {
        _id: "organization-example-alias",
        name: "Example alias",
        partnerTier: "silver",
        logo: { asset: { _ref: "image-existing" } },
      },
    },
  ]);
});
test("prior migration marker keeps intentionally cleared partnership fields absent", () => {
  const result = plan([
    {
      _id: "org",
      key: "example",
      name: "Example alias",
      legacyPartnerId: "p-a",
      href: "https://example.com/",
      logo: { asset: { _ref: "existing" } },
    },
  ]);
  expect(result.steps).toStrictEqual([]);
});
test("published and draft fields are applied in one transaction; failures stay retryable", async () => {
  const calls: string[][] = [];
  const client: MigrationClient = {
    createIfNotExists: async () => false,
    exists: async () => true,
    setIfMissing: async (ids) => {
      calls.push(ids);
      throw new Error("revision conflict");
    },
  };
  const result = await applyPartnerMigration(
    plan([{ _id: "org", key: "example", name: "Example alias" }]).steps,
    client,
  );
  expect(calls).toStrictEqual([["org", "drafts.org"]]);
  expect(result).toMatchObject({
    created: 0,
    updated: 0,
    failures: ["org: revision conflict"],
  });
});

test("different aliases resolving to one CMS organization produce one patch and primary legacy ID", () => {
  const result = planPartnerMigration({
    organizations: [
      {
        _id: "org",
        key: "acme",
        name: "Acme Research",
        shortName: "AR",
        partnerCategory: "Research Partners",
      },
    ],
    partners: [
      { _id: "p-1", name: "AR", category: "Technical Partners" },
      { _id: "p-2", name: "Acme Research", category: "Research Partners" },
    ],
    companyKey: getPartnerKey,
    organizationId: (key) => `organization-${key}`,
  });
  expect(result.steps).toHaveLength(1);
  expect(result.steps[0]).toMatchObject({
    id: "org",
    partnerId: "p-2",
    set: { legacyPartnerId: "p-2" },
  });
  expect(result.merged).toMatchObject([
    { partnerId: "p-1", keptPartnerId: "p-2" },
  ]);
});

test("explicit CMS clears are not migration targets", () => {
  const result = plan([
    {
      _id: "org",
      key: "example",
      name: "Example alias",
      partnerTier: null,
      partnerCategory: "",
      partnerFeatured: false,
      legacyPartnerId: "p-a",
      href: null,
      logo: null,
    },
  ]);
  expect(result.steps).toStrictEqual([]);
});
