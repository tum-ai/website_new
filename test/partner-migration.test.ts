import { describe, expect, test } from "vitest";
import { getPartnerKey } from "@/features/partners";
import { buildOrganizationBackfill } from "@/features/partners/server";
import { organizationId } from "@/lib/organization-content";
import {
  applyPartnerMigration,
  type MigrationClient,
  withUploadedImages,
} from "../scripts/sanity/apply-partner-migration";
import { backfillTarget } from "../scripts/sanity/backfill-target";
import {
  type DatasetOrganization,
  type DatasetPartner,
  describePlan,
  keyFromName,
  type MigrationStep,
  planPartnerMigration,
} from "../scripts/sanity/partner-migration";

/**
 * The partner migration (`pnpm sanity:migrate-partners`): the plan on a
 * trimmed copy of the new site's dataset, and the apply step on a fake
 * client. Nothing here talks to Sanity.
 */
const codeOrganizations = buildOrganizationBackfill().filter(
  ({ _type }) => _type === "organization",
);

const image = (ref: string) => ({
  _type: "image",
  asset: { _type: "reference", _ref: ref },
});

/** Partner documents as the old site has them (names as its editors typed). */
const partners: DatasetPartner[] = [
  {
    _id: "p-openai",
    name: "OpenAI",
    category: "Technical Partners",
    link: "https://openai.com/",
    image: image("image-openai-1200x831-png"),
  },
  {
    _id: "p-ibm-technical",
    name: "IBM",
    category: "Technical Partners",
    image: image("image-ibm-500x200-png"),
  },
  {
    _id: "p-ibm-research",
    name: "IBM",
    category: "Research Partners",
    image: image("image-ibm-500x200-png"),
  },
  {
    _id: "p-check24",
    name: "check24",
    category: "Industry Partners",
    link: "https://www.check24.de",
    image: image("image-check24-9856x2417-png"),
  },
  {
    _id: "p-bkw",
    name: "bkw",
    category: "Industry Partners",
    link: "https://www.bkw.de/de",
    tier: "silver",
    image: image("image-bkw-2560x578-png"),
  },
  {
    _id: "p-newcomer",
    name: "Newcomer Labs",
    category: "Research Partners",
    link: "http://newcomer.example",
    featured: true,
    image: { ...image("image-new-400x100-png"), hotspot: { x: 0.5 } },
  },
  { _id: "p-nameless", name: " " },
  { _id: "drafts.p-draft", name: "Draft" },
];

/** Organisations as the first backfill left them (no partnership). */
const organizations: DatasetOrganization[] = [
  {
    _id: "organization-openai",
    key: "openai",
    name: "OpenAI",
    href: "https://openai.com/",
    logo: image("image-a-440x121-webp"),
  },
  {
    _id: "organization-ibm",
    key: "ibm",
    name: "IBM",
    href: "https://www.ibm.com/",
    logo: image("image-b-500x200-png"),
  },
  // Only dark artwork, like the events co-hosts; an editor set a tier.
  {
    _id: "organization-bkw",
    key: "bkw",
    name: "BKW",
    partnerTier: "bronze",
  },
  {
    _id: "organization-jetbrains",
    key: "jetbrains",
    name: "JetBrains",
    href: "https://www.jetbrains.com/",
    logo: image("image-c-298x64-svg"),
  },
];

const plan = planPartnerMigration({
  partners,
  organizations,
  codeOrganizations,
  companyKey: getPartnerKey,
  organizationId,
});

const step = (id: string) => plan.steps.find((entry) => entry.id === id);

describe("the partner migration plan", () => {
  test("an existing organisation gets the partner's category and id, and the code's tier", () => {
    expect(step("organization-openai")).toStrictEqual({
      action: "update",
      id: "organization-openai",
      key: "openai",
      name: "OpenAI",
      partnerId: "p-openai",
      set: {
        partnerTier: "gold",
        partnerCategory: "Technical Partners",
        legacyPartnerId: "p-openai",
      },
    });
  });

  test("never replaces what the organisation has; fills its missing website and light logo", () => {
    const bkw = step("organization-bkw");
    if (bkw?.action !== "update") throw new Error("expected an update");
    // The editor's bronze stays; the partner document's silver is not used.
    expect(bkw.set).not.toHaveProperty("partnerTier");
    expect(bkw.set).toMatchObject({
      partnerCategory: "Industry Partners",
      legacyPartnerId: "p-bkw",
      href: "https://www.bkw.de/de",
      logo: {
        _type: "image",
        _sanityAsset: expect.stringMatching(
          /^image@file:\/\/.*\/public\/assets\/partners\/logos\/bkw\.webp$/,
        ),
      },
    });
  });

  test("a code partner without a partner document gets its tier", () => {
    expect(step("organization-jetbrains")).toMatchObject({
      action: "update",
      partnerId: null,
      set: { partnerTier: "gold" },
    });
  });

  test("two partner documents for one company: the code's category wins, the other is merged", () => {
    expect(step("organization-ibm")).toMatchObject({
      partnerId: "p-ibm-research",
      set: {
        partnerTier: "bronze",
        partnerCategory: "Research Partners",
        legacyPartnerId: "p-ibm-research",
      },
    });
    expect(plan.merged).toStrictEqual([
      {
        partnerId: "p-ibm-technical",
        name: "IBM",
        category: "Technical Partners",
        key: "ibm",
        keptPartnerId: "p-ibm-research",
      },
    ]);
  });

  test("a missing organisation the code has is created from the code, with its logo file", () => {
    const check24 = step("organization-check24");
    if (check24?.action !== "create") throw new Error("expected a create");
    expect(check24.source).toBe("code");
    expect(check24.document).toMatchObject({
      _id: "organization-check24",
      _type: "organization",
      key: "check24",
      name: "CHECK24",
      href: "https://www.check24.de",
      partnerTier: "supporter",
      partnerCategory: "Industry Partners",
      legacyPartnerId: "p-check24",
      logo: { _sanityAsset: expect.stringMatching(/check24\.webp$/) },
    });
  });

  test("a partner the code lacks becomes an organisation from its document", () => {
    const newcomer = step("organization-newcomer-labs");
    if (newcomer?.action !== "create") throw new Error("expected a create");
    expect(newcomer.source).toBe("partner");
    expect(newcomer.document).toStrictEqual({
      _id: "organization-newcomer-labs",
      _type: "organization",
      key: "newcomer-labs",
      name: "Newcomer Labs",
      partnerTier: "supporter",
      partnerCategory: "Research Partners",
      partnerFeatured: true,
      legacyPartnerId: "p-newcomer",
      // Not https: the organisation's website must be.
      logo: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-new-400x100-png" },
        hotspot: { x: 0.5 },
        alt: "Newcomer Labs logo",
      },
    });
  });

  test("every other code partner is covered, and nameless or draft documents are skipped", () => {
    const covered = new Set(plan.steps.map(({ key }) => key));
    for (const { key, partnerTier } of codeOrganizations) {
      if (partnerTier) expect(covered, String(key)).toContain(key);
    }
    expect(plan.skipped.map(({ partnerId }) => partnerId)).toStrictEqual([
      "drafts.p-draft",
      "p-nameless",
    ]);
  });

  test("an organisation migrated before keeps its partnership as editors left it", () => {
    const again = planPartnerMigration({
      partners: partners.filter(({ _id }) => _id === "p-openai"),
      organizations: [
        {
          _id: "organization-openai",
          key: "openai",
          name: "OpenAI",
          href: "https://openai.com/",
          logo: image("image-a-440x121-webp"),
          legacyPartnerId: "p-openai",
        },
      ],
      codeOrganizations: codeOrganizations.filter(
        ({ key }) => key === "openai",
      ),
      companyKey: getPartnerKey,
      organizationId,
    });
    expect(again.steps).toStrictEqual([]);
    expect(again.unchanged).toStrictEqual([
      { id: "organization-openai", key: "openai", partnerId: "p-openai" },
    ]);
  });

  test("an organisation id taken by another key is skipped, not overwritten", () => {
    const clash = planPartnerMigration({
      partners: [{ _id: "p-x", name: "Newcomer Labs" }],
      organizations: [
        { _id: "organization-newcomer-labs", key: "newcomer", name: "N" },
      ],
      codeOrganizations: [],
      companyKey: getPartnerKey,
      organizationId,
    });
    expect(clash.steps).toStrictEqual([]);
    expect(clash.skipped[0]?.reason).toMatch(/exists with another key/);
  });

  test("the dry run names every step, merge and skip", () => {
    const output = describePlan(plan);
    expect(output).toMatch(/^Create \d+ organisation\(s\):/);
    expect(output).toContain(
      "+ organization-check24  CHECK24  (from code; partner p-check24)",
    );
    expect(output).toContain("logo: upload public/assets/partners/logos/");
    expect(output).toContain(
      '= p-ibm-technical "IBM" (Technical Partners) into ibm, which keeps p-ibm-research',
    );
    expect(output).toContain("! p-nameless: it has no name");
  });

  test("keys from names are lowercase words joined by hyphens", () => {
    expect(keyFromName("Rohde & Schwarz")).toBe("rohde-schwarz");
    expect(keyFromName("Auswärtiges Amt")).toBe("auswartiges-amt");
  });

  test("the migration refuses production and needs a dataset", () => {
    expect(() =>
      backfillTarget(undefined, {}, "pnpm sanity:migrate-partners"),
    ).toThrow(/pnpm sanity:migrate-partners --dataset/);
    expect(() => backfillTarget("production", {})).toThrow(/old site/);
  });
});

/** A fake dataset: documents by id, uploads by file. */
function fakeClient(existing: Record<string, Record<string, unknown>>) {
  const documents = new Map(Object.entries(existing));
  const uploads: string[] = [];
  const client: MigrationClient = {
    uploadImage: async (file) => {
      uploads.push(file);
      return `image-${uploads.length}`;
    },
    createIfNotExists: async (document) => {
      const id = document._id as string;
      if (documents.has(id)) return false;
      documents.set(id, document);
      return true;
    },
    exists: async (id) => documents.has(id),
    setIfMissing: async (id, fields) => {
      const document = documents.get(id);
      if (!document) throw new Error(`no document ${id}`);
      for (const [field, value] of Object.entries(fields)) {
        if (document[field] === undefined) document[field] = value;
      }
    },
  };
  return { client, documents, uploads };
}

describe("applying the plan", () => {
  const file = "image@file:///repo/public/assets/partners/logos/x.webp";

  test("creates missing organisations with uploaded logos and fills published documents and drafts", async () => {
    const steps: MigrationStep[] = [
      {
        action: "create",
        id: "organization-x",
        key: "x",
        name: "X",
        source: "code",
        partnerId: "p-x",
        document: {
          _id: "organization-x",
          _type: "organization",
          key: "x",
          name: "X",
          logo: { _type: "image", _sanityAsset: file, alt: "X logo" },
        },
      },
      {
        action: "update",
        id: "organization-y",
        key: "y",
        name: "Y",
        partnerId: "p-y",
        set: {
          partnerTier: "gold",
          logo: { _type: "image", _sanityAsset: file },
        },
      },
    ];
    const { client, documents, uploads } = fakeClient({
      "organization-y": { _id: "organization-y", partnerTier: "silver" },
      "drafts.organization-y": { _id: "drafts.organization-y" },
    });
    await expect(applyPartnerMigration(steps, client)).resolves.toStrictEqual({
      created: 1,
      updated: 1,
      failures: [],
    });
    // One upload per file, however often it is used.
    expect(uploads).toStrictEqual([
      "/repo/public/assets/partners/logos/x.webp",
    ]);
    expect(documents.get("organization-x")?.logo).toStrictEqual({
      _type: "image",
      alt: "X logo",
      asset: { _type: "reference", _ref: "image-1" },
    });
    // The editor's silver stays; the missing logo is set on both.
    expect(documents.get("organization-y")?.partnerTier).toBe("silver");
    expect(documents.get("drafts.organization-y")).toMatchObject({
      partnerTier: "gold",
      logo: { asset: { _ref: "image-1" } },
    });
  });

  test("an organisation created since the dry run is left alone; a failing step does not stop the rest", async () => {
    const { client, documents } = fakeClient({
      "organization-x": { _id: "organization-x", name: "Edited" },
    });
    const result = await applyPartnerMigration(
      [
        {
          action: "create",
          id: "organization-x",
          key: "x",
          name: "X",
          source: "partner",
          partnerId: null,
          document: { _id: "organization-x", _type: "organization", name: "X" },
        },
        {
          action: "update",
          id: "organization-gone",
          key: "gone",
          name: "Gone",
          partnerId: null,
          set: { partnerTier: "supporter" },
        },
      ],
      client,
    );
    expect(result.created).toBe(0);
    expect(result.failures).toStrictEqual([
      "organization-gone: no document organization-gone",
    ]);
    expect(documents.get("organization-x")?.name).toBe("Edited");
  });

  test("an image that is not a local file is refused", async () => {
    await expect(
      withUploadedImages(
        { _sanityAsset: "image@https://cdn.example/x.png" },
        async () => "never",
      ),
    ).rejects.toThrow(/no local file/);
  });
});
