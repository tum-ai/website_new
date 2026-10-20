import { describe, expect, it, vi } from "vitest";
import {
  assertSingleSourceTarget,
  completeMigrationStep,
  type MigrationDocument,
  planSingleSourceMigration,
  readMigrationCompletion,
  type SingleSourcePlan,
  singleSourceCompletionId,
} from "../scripts/sanity/single-source-migration";
import {
  applySingleSourceMigration,
  type SingleSourceClient,
  type UploadLedger,
} from "../scripts/sanity/single-source-migration-apply";
import { singleSourcePreflightRequest } from "../scripts/sanity/single-source-migration-cli";
import { applyPlanToDocuments } from "../scripts/sanity/single-source-migration-readiness";

const target = { projectId: "testproject", dataset: "redesign" };
const document = (
  _id: string,
  _type: string,
  fields: Record<string, unknown> = {},
): MigrationDocument => ({ _id, _type, _rev: `rev-${_id}`, ...fields });
const partners = [
  "openai",
  "google",
  "anthropic",
  "hudson-river-trading",
  "jetbrains",
  "unite",
  "spherecast",
  "dryft",
  "reply",
  "mutagent",
  "nvidia",
  "entire-io",
  "mckinsey-company",
  "jane-street",
  "bmw",
  "aws",
  "amd",
  "ibm",
  "inria",
  "tacto",
  "osapiens",
];
const prerequisiteDocuments = (): MigrationDocument[] => [
  document("siteSettings", "siteSettings", { organization: {} }),
  document("partnersCopy", "partnersCopy", {
    sections: { hero: { title: "Edited title" } },
  }),
  document("eLabCopy", "eLabCopy", {
    voices: { title: "Edited voices heading" },
  }),
  ...partners.map((key) =>
    document(`org-${key}`, "organization", { key, name: `Edited ${key}` }),
  ),
  ...[
    "viktor-shen",
    "benedikt-wieser",
    "leonardo-benini",
    "alexandra-reinert",
    "oliver-schoppe",
    "axel-taeubert",
  ].map((key) =>
    document(`person-e-lab-testimonial-${key}`, "person", { key }),
  ),
  ...[
    "XNCTBM8X9vP2N4tjVzg79c",
    "event-ehl-2026-paris",
    "event-ehl-2026-munich",
    "event-ehl-2026-zurich",
    "event-ehl-2026-grand-finale",
  ].map((id) => document(id, "event")),
  document("casestudy-bmw", "caseStudy"),
  document("casestudy-osapiens", "caseStudy"),
];
const fakeClient = (documents: MigrationDocument[] = []) =>
  ({
    fetchDocuments: vi.fn(async (ids: string[]) =>
      documents.filter((doc) => ids.includes(doc._id)),
    ),
    uploadImage: vi.fn(async () => "image-uploaded-10x10-webp"),
    createIfNotExists: vi.fn<SingleSourceClient["createIfNotExists"]>(
      async () => {},
    ),
    fill: vi.fn<SingleSourceClient["fill"]>(async () => {}),
    finish: vi.fn<SingleSourceClient["finish"]>(async () => {}),
  }) satisfies SingleSourceClient;
const uploads = (ledger: UploadLedger = { ...target, assets: {} }) => ({
  ledger,
  resolveFile: (path: string) => `/public${path}`,
  digest: () => "digest",
  save: vi.fn(async () => {}),
});
const createPlan = (): SingleSourcePlan => ({
  ...target,
  migration: "single-source-2026-10",
  draftVisibility: "verified",
  blocked: [],
  steps: [
    {
      action: "create",
      document: document("organization-atira", "organization", {
        logoOnDark: {
          _type: "image",
          _localAsset: "/assets/events/hosts/atira.svg",
          alt: "Atira logo",
        },
      }),
    },
  ],
});

describe("focused single-source migration planning", () => {
  it("plans only missing gap documents and new fields while leaving prerequisite inputs intact", () => {
    const docs = prerequisiteDocuments();
    const before = structuredClone(docs);
    const plan = planSingleSourceMigration(docs, target);
    expect(plan.blocked).toEqual([]);
    const creates = plan.steps.filter((step) => step.action === "create");
    expect(creates.map((step) => step.document._type).sort()).toEqual([
      "hackathonsCopy",
      "logoList",
      "organization",
    ]);
    const copy = creates.find(
      (step) => step.document._id === "hackathonsCopy",
    )?.document;
    if (!copy) throw new Error("No hackathons copy in plan");
    expect((copy.makeathon as { editions: unknown[] }).editions).toHaveLength(
      8,
    );
    expect(copy).toHaveProperty("voiceCaseStudy._ref", "casestudy-bmw");
    expect(
      (copy.league as { finale: Record<string, unknown> }).finale,
    ).not.toHaveProperty("champion");
    const settings = plan.steps.find(
      (step) => step.action === "fill" && step.id === "siteSettings",
    );
    expect(settings?.action === "fill" && settings.fields).toHaveProperty(
      "hackathons.league.matches.0.event._ref",
      "XNCTBM8X9vP2N4tjVzg79c",
    );
    expect(docs).toEqual(before);
  });

  it("previews planned references with dimensions without mutating live documents or uploading", () => {
    const docs = prerequisiteDocuments();
    const before = structuredClone(docs);
    const plan = planSingleSourceMigration(docs, target);
    const projected = applyPlanToDocuments(plan, docs);
    const settings = projected.find((doc) => doc._id === "siteSettings");
    expect(settings).toHaveProperty(
      "organization.startedApplicationsPerBatch",
      2100,
    );
    const atira = projected.find((doc) => doc._id === "organization-atira");
    if (!atira) throw new Error("No Atira in preview");
    const imageId = (atira.logoOnDark as { asset: { _ref: string } }).asset
      ._ref;
    const asset = projected.find((doc) => doc._id === imageId);
    expect(asset).toHaveProperty("metadata.dimensions", {
      width: 44,
      height: 18,
      aspectRatio: 44 / 18,
    });
    expect(asset).toHaveProperty("source.name", "single-source-readiness-only");
    expect(docs).toEqual(before);
  });

  it("does not replace intentional clears, existing copy or existing editorial selections", () => {
    const docs = prerequisiteDocuments().map((doc) => {
      if (doc._type === "organization") return { ...doc, partnerOrder: null };
      if (doc._id === "partnersCopy")
        return { ...doc, sections: { hero: { image: null } } };
      if (doc._id === "siteSettings")
        return {
          ...doc,
          hackathons: {},
          organization: { startedApplicationsPerBatch: null },
        };
      if (doc._id === "eLabCopy")
        return { ...doc, voices: { founders: [], investors: null } };
      return doc;
    });
    docs.push(
      document("hackathonsCopy", "hackathonsCopy", {
        hero: { title: "Edited" },
        voiceCaseStudy: null,
        outcomeCaseStudy: null,
      }),
    );
    const plan = planSingleSourceMigration(docs, target);
    expect(plan.steps.filter((step) => step.action === "fill")).toEqual([]);
    expect(plan.blocked).toEqual([]);
  });

  it("is idempotent after missing fields and documents have been migrated", () => {
    const docs = prerequisiteDocuments();
    const first = planSingleSourceMigration(docs, target);
    for (const step of first.steps) {
      if (step.action === "create")
        docs.push({ ...step.document, _rev: "created-rev" });
      else {
        const doc = docs.find((doc) => doc._id === step.id);
        if (!doc) throw new Error("Missing test document");
        for (const [path, value] of Object.entries(step.fields)) {
          const fields = path.split(".");
          let parent: Record<string, unknown> = doc;
          for (const field of fields.slice(0, -1))
            parent = parent[field] as Record<string, unknown>;
          parent[fields.at(-1) as string] = value;
        }
      }
    }
    expect(planSingleSourceMigration(docs, target)).toMatchObject({
      steps: [],
      blocked: [],
    });
  });

  it("reports missing or ambiguous references instead of recreating the retired catalog", () => {
    const docs = prerequisiteDocuments().filter(
      (doc) => doc._id !== "org-google",
    );
    docs.push(document("duplicate-reply", "organization", { key: "reply" }));
    const plan = planSingleSourceMigration(docs, target);
    expect(plan.blocked).toContain("Missing organization google");
    expect(plan.blocked).toContain("Ambiguous organization key reply");
    expect(
      plan.steps
        .filter((step) => step.action === "create")
        .map((step) => step.document._id),
    ).not.toContain("organization-google");
  });

  it("preserves alternate CMS IDs for existing Atira and EHL logos", () => {
    const docs = prerequisiteDocuments();
    docs.push(
      document("editor-atira", "organization", { key: "atira" }),
      document("editor-ehl", "logoList", {
        surface: "ehl-partners",
        organizations: [],
      }),
    );
    const plan = planSingleSourceMigration(docs, target);
    expect(
      plan.steps
        .filter((step) => step.action === "create")
        .map((step) => step.document._id),
    ).toEqual(["hackathonsCopy"]);
  });

  it("refuses production, missing revisions and unpublished gap-document drafts", () => {
    expect(() =>
      assertSingleSourceTarget({ ...target, dataset: "production" }),
    ).toThrow("Refusing");
    const docs = prerequisiteDocuments();
    delete docs[0]._rev;
    docs.push(document("drafts.hackathonsCopy", "hackathonsCopy"));
    const plan = planSingleSourceMigration(docs, target);
    expect(plan.blocked).toContain("siteSettings lacks a revision");
    expect(
      plan.blocked.some((reason) => reason.includes("unpublished draft")),
    ).toBe(true);
  });
});

describe("guarded single-source apply", () => {
  it("uploads and persists assets before creating a fully attached image", async () => {
    const client = fakeClient();
    const assetState = uploads();
    await expect(
      applySingleSourceMigration(createPlan(), target, client, assetState),
    ).resolves.toMatchObject({ created: 1, failures: [] });
    expect(client.createIfNotExists).toHaveBeenCalledWith(
      expect.objectContaining({
        logoOnDark: {
          _type: "image",
          alt: "Atira logo",
          asset: { _type: "reference", _ref: "image-uploaded-10x10-webp" },
        },
      }),
      expect.objectContaining({ _id: singleSourceCompletionId }),
    );
    expect(assetState.save.mock.invocationCallOrder[0]).toBeLessThan(
      client.createIfNotExists.mock.invocationCallOrder[0],
    );
  });

  it("never creates an unattached skeleton after upload or ledger persistence failure", async () => {
    const client = fakeClient();
    client.uploadImage.mockRejectedValue(new Error("upload offline"));
    const result = await applySingleSourceMigration(
      createPlan(),
      target,
      client,
      uploads(),
    );
    expect(result.failures).toHaveLength(1);
    expect(client.createIfNotExists).not.toHaveBeenCalled();
    const nextClient = fakeClient();
    const assetState = uploads();
    assetState.save.mockRejectedValue(new Error("disk full"));
    await applySingleSourceMigration(
      createPlan(),
      target,
      nextClient,
      assetState,
    );
    expect(nextClient.createIfNotExists).not.toHaveBeenCalled();
  });

  it("reuses completed uploads after a failed document write", async () => {
    const client = fakeClient();
    client.createIfNotExists.mockRejectedValueOnce(new Error("write failed"));
    const assetState = uploads();
    await applySingleSourceMigration(createPlan(), target, client, assetState);
    await applySingleSourceMigration(createPlan(), target, client, assetState);
    expect(client.uploadImage).toHaveBeenCalledTimes(1);
    expect(client.createIfNotExists).toHaveBeenCalledTimes(2);
  });

  it("skips racing creates and refuses a new unpublished draft before uploading", async () => {
    const client = fakeClient([document("organization-atira", "organization")]);
    expect(
      await applySingleSourceMigration(createPlan(), target, client, uploads()),
    ).toMatchObject({ skipped: 1 });
    expect(client.uploadImage).not.toHaveBeenCalled();
    const draftClient = fakeClient([
      document("drafts.organization-atira", "organization"),
    ]);
    expect(
      (
        await applySingleSourceMigration(
          createPlan(),
          target,
          draftClient,
          uploads(),
        )
      ).failures,
    ).toHaveLength(1);
    expect(draftClient.uploadImage).not.toHaveBeenCalled();
  });

  it("guards both published and draft revisions and rejects changed published revisions", async () => {
    const published = document("org-google", "organization");
    const draft = document("drafts.org-google", "organization");
    const plan: SingleSourcePlan = {
      ...target,
      migration: "single-source-2026-10",
      draftVisibility: "verified",
      blocked: [],
      steps: [
        {
          action: "fill",
          id: published._id,
          type: "organization",
          revision: published._rev as string,
          fields: { partnerOrder: 20 },
        },
      ],
    };
    const client = fakeClient([published, draft]);
    await applySingleSourceMigration(plan, target, client, uploads());
    expect(client.fill).toHaveBeenCalledWith(
      [
        {
          id: published._id,
          revision: published._rev,
          fields: { partnerOrder: 20 },
        },
        { id: draft._id, revision: draft._rev, fields: { partnerOrder: 20 } },
      ],
      expect.objectContaining({ _id: singleSourceCompletionId }),
    );
    published._rev = "editor-new-revision";
    client.fill.mockClear();
    expect(
      (await applySingleSourceMigration(plan, target, client, uploads()))
        .failures,
    ).toHaveLength(1);
    expect(client.fill).not.toHaveBeenCalled();
  });

  it("excludes explicit draft clears from setIfMissing patches", async () => {
    const published = document("eLabCopy", "eLabCopy", {
      voices: { title: "Published heading" },
    });
    const draft = document("drafts.eLabCopy", "eLabCopy", {
      voices: { founders: null, investors: [] },
    });
    const fields = {
      "voices.founders": [{ _type: "reference", _ref: "person-test" }],
      "voices.investors": [],
    };
    const plan: SingleSourcePlan = {
      ...target,
      migration: "single-source-2026-10",
      draftVisibility: "verified",
      blocked: [],
      steps: [
        {
          action: "fill",
          id: "eLabCopy",
          type: "eLabCopy",
          revision: published._rev as string,
          fields,
        },
      ],
    };
    const client = fakeClient([published, draft]);
    await applySingleSourceMigration(plan, target, client, uploads());
    expect(client.fill).toHaveBeenCalledWith(
      [{ id: published._id, revision: published._rev, fields }],
      expect.objectContaining({ _id: singleSourceCompletionId }),
    );
  });

  it("refuses blocked, target-mismatched and out-of-scope persisted plans before reads", async () => {
    const client = fakeClient();
    const plan = createPlan();
    plan.blocked.push("Missing event");
    await expect(
      applySingleSourceMigration(plan, target, client, uploads()),
    ).rejects.toThrow("blocked");
    plan.blocked = [];
    await expect(
      applySingleSourceMigration(
        plan,
        { ...target, dataset: "different" },
        client,
        uploads(),
      ),
    ).rejects.toThrow("target");
    plan.steps = [
      {
        action: "fill",
        id: "org-bmw",
        type: "organization",
        revision: "rev",
        fields: { name: "overwrite" },
      },
    ];
    await expect(
      applySingleSourceMigration(plan, target, client, uploads()),
    ).rejects.toThrow("Unexpected fill");
    expect(client.fetchDocuments).not.toHaveBeenCalled();
  });
});

describe("permanent migration handoff", () => {
  it("reports public draft readiness unknown and authenticated raw draft preflight verified", () => {
    const publicRead = singleSourcePreflightRequest(target);
    expect(publicRead.draftVisibility).toBe("unknown");
    expect(publicRead.url.searchParams.get("perspective")).toBe("published");
    expect(publicRead.init).toBeUndefined();
    const privateRead = singleSourcePreflightRequest(
      target,
      "synthetic-test-token",
    );
    expect(privateRead.draftVisibility).toBe("verified");
    expect(privateRead.url.searchParams.get("perspective")).toBe("raw");
    expect(privateRead.url.searchParams.get("query")).not.toContain(
      'path("drafts.**")',
    );
    expect(privateRead.init?.headers.Authorization).toBe(
      "Bearer synthetic-test-token",
    );
    const docs = [
      ...prerequisiteDocuments(),
      document("drafts.hackathonsCopy", "hackathonsCopy"),
    ];
    expect(
      planSingleSourceMigration(docs, target, {
        draftVisibility: "verified",
      }).blocked.some((reason) => reason.includes("unpublished draft")),
    ).toBe(true);
    expect(
      planSingleSourceMigration(prerequisiteDocuments(), target)
        .draftVisibility,
    ).toBe("unknown");
  });

  it("never reseeds completed fields or completed creates during partial retries", () => {
    const docs = prerequisiteDocuments();
    const first = planSingleSourceMigration(docs, target);
    const projected = applyPlanToDocuments(first, docs);
    const copyCreate = first.steps.find(
      (step) =>
        step.action === "create" && step.document._id === "hackathonsCopy",
    );
    const settingsFill = first.steps.find(
      (step) => step.action === "fill" && step.id === "siteSettings",
    );
    if (!copyCreate || !settingsFill)
      throw new Error("Missing expected migration steps");
    let completion = completeMigrationStep(
      readMigrationCompletion([], target),
      copyCreate,
    );
    completion = {
      ...completeMigrationStep(completion, settingsFill),
      _rev: "receipt-rev",
    };
    const settings = projected.find((doc) => doc._id === "siteSettings");
    if (!settings) throw new Error("Missing settings");
    delete (settings.organization as Record<string, unknown>)
      .startedApplicationsPerBatch;
    const afterEdit = projected.filter((doc) => doc._id !== "hackathonsCopy");
    afterEdit.push(completion);
    expect(planSingleSourceMigration(afterEdit, target)).toMatchObject({
      steps: [],
      blocked: [],
    });
  });

  it("finalizes zero-step handoff and preserves later unsets/deletions of initially existing content", async () => {
    const firstDocs = prerequisiteDocuments();
    const fullyEdited = applyPlanToDocuments(
      planSingleSourceMigration(firstDocs, target),
      firstDocs,
    );
    const zeroPlan = planSingleSourceMigration(fullyEdited, target);
    expect(zeroPlan.steps).toEqual([]);
    const client = fakeClient(fullyEdited);
    await applySingleSourceMigration(zeroPlan, target, client, uploads());
    expect(client.finish).toHaveBeenCalledWith(
      expect.objectContaining({ complete: true }),
    );
    const completion = {
      ...client.finish.mock.calls[0][0],
      _rev: "complete-rev",
    };
    const afterEdit = fullyEdited.filter((doc) => doc._id !== "hackathonsCopy");
    const partners = afterEdit.find((doc) => doc._id === "partnersCopy");
    if (!partners) throw new Error("Missing partners copy");
    delete (
      (partners.sections as Record<string, unknown>).hero as Record<
        string,
        unknown
      >
    ).image;
    afterEdit.push(completion);
    expect(planSingleSourceMigration(afterEdit, target)).toMatchObject({
      steps: [],
      blocked: [],
    });
  });

  it("retries only unfinished writes after a partial failure and finalizes once", async () => {
    const plan = createPlan();
    plan.steps.push({
      action: "create",
      document: document("hackathonsCopy", "hackathonsCopy"),
    });
    const stored: MigrationDocument[] = [];
    const client = fakeClient(stored);
    let writes = 0;
    client.createIfNotExists.mockImplementation(async (doc, receipt) => {
      if (++writes === 2) throw new Error("second step failed");
      stored.push(doc);
      const old = stored.findIndex(
        (doc) => doc._id === singleSourceCompletionId,
      );
      if (old >= 0) stored.splice(old, 1);
      stored.push({ ...receipt, _rev: `receipt-${writes}` });
    });
    expect(
      (await applySingleSourceMigration(plan, target, client, uploads()))
        .failures,
    ).toHaveLength(1);
    expect(client.finish).not.toHaveBeenCalled();
    expect(
      (await applySingleSourceMigration(plan, target, client, uploads()))
        .failures,
    ).toEqual([]);
    expect(client.createIfNotExists).toHaveBeenCalledTimes(3);
    expect(client.finish).toHaveBeenCalledTimes(1);
  });

  it("passes the completion revision atomically with fields and never finalizes a ledger conflict", async () => {
    const stored = [
      document("org-google", "organization"),
      { ...readMigrationCompletion([], target), _rev: "receipt-revision" },
    ];
    const client = fakeClient(stored);
    client.fill.mockRejectedValue(
      new Error("completion revision conflict; transaction aborted"),
    );
    const plan: SingleSourcePlan = {
      ...target,
      migration: "single-source-2026-10",
      draftVisibility: "verified",
      blocked: [],
      steps: [
        {
          action: "fill",
          id: "org-google",
          type: "organization",
          revision: "rev-org-google",
          fields: { partnerOrder: 20 },
        },
      ],
    };
    expect(
      (await applySingleSourceMigration(plan, target, client, uploads()))
        .failures,
    ).toHaveLength(1);
    expect(client.fill).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ _rev: "receipt-revision" }),
    );
    expect(stored[0]).not.toHaveProperty("partnerOrder");
    expect(client.finish).not.toHaveBeenCalled();
  });
});
