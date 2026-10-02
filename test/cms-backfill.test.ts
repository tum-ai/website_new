import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  assetFileOf,
  collectSanityAssets,
  findUnattachedAssets,
  pendingAssetsBeforeImport,
  plannedAssets,
} from "@/lib/cms-backfill";
import { liveEventHosts, redesignOnlyEvents } from "@/lib/mock-cms";
import { pinnedDocuments } from "@/sanity/content-structure";
import { liveSchemaTypes } from "@/sanity/schemas";
import {
  contentSchemaTypes,
  contentSingletons,
} from "@/sanity/schemas/content";
import { liveTypesWithReferences } from "@/sanity/schemas/content/live-references";
import { backfillTarget } from "../scripts/sanity/backfill-target";
import {
  copiedTypes,
  copyFromProduction,
  copyProductionDocuments,
  imageAssetUrl,
  localizeCdnAssets,
  matchesExtension,
  type SourceDocument,
} from "../scripts/sanity/production-copy";
import {
  type RepairClient,
  recordPendingAssets,
  repairPendingAssets,
} from "../scripts/sanity/repair-assets";
import { backfillSlices, collectBackfill } from "../scripts/sanity/slices";
import productionFixture from "./fixtures/production-documents.json";

/**
 * Every registered content slice's backfill (scripts/sanity/slices.ts) is
 * importable as is: what `pnpm sanity:backfill --apply` would send.
 */
const documents = collectBackfill();

type Field = { name: string; validation?: unknown };
// The page content types, plus the old site's `event` in the shape the new
// site's dataset registers it (the redesign-only events).
const schemaByName = new Map<string, { name: string; fields: Field[] }>(
  [
    ...contentSchemaTypes,
    ...liveTypesWithReferences.filter(({ name }) => name === "event"),
  ].map((type) => [
    type.name,
    type as unknown as { name: string; fields: Field[] },
  ]),
);

/**
 * Whether a field's `validation` calls `Rule.required()`: runs it against a
 * stand-in Rule whose every method chains and records `required`.
 */
function isRequired(validation: unknown): boolean {
  if (typeof validation !== "function") return false;
  let required = false;
  const rule: unknown = new Proxy(() => rule, {
    get: (_, method) => () => {
      if (method === "required") required = true;
      return rule;
    },
  });
  validation(rule);
  return required;
}

const isSet = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  !(typeof value === "string" && value.trim() === "") &&
  !(Array.isArray(value) && value.length === 0);

describe("the CMS backfill", () => {
  test("every slice builds documents", () => {
    for (const { slice, build } of backfillSlices) {
      expect(build().length, slice).toBeGreaterThan(0);
    }
  });

  test("every reference points at a backfilled document", () => {
    const ids = new Set(documents.map(({ _id }) => _id));
    const dangling: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          walk(item, `${path}[${index}]`);
        }
      } else if (value && typeof value === "object") {
        const { _ref } = value as { _ref?: unknown };
        if (typeof _ref === "string" && !ids.has(_ref)) {
          dangling.push(`${path} → ${_ref}`);
        }
        for (const [key, item] of Object.entries(value)) {
          walk(item, `${path}.${key}`);
        }
      }
    };
    for (const document of documents) walk(document, document._id);
    // Strong references to a missing document fail the whole import.
    expect(dangling).toStrictEqual([]);
  });

  test("ids are unique and public (no dots, no drafts prefix)", () => {
    const ids = documents.map(({ _id }) => _id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toStrictEqual(
      [],
    );
    // Letters (a singleton's id is its camelCase type name), digits and
    // hyphens: a `.` would make the document private.
    for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9][a-zA-Z0-9-]*$/);
  });

  test("the code content is page content types and the redesign-only events", () => {
    const unknown = documents
      .map(({ _type }) => _type)
      .filter((type) => !schemaByName.has(type));
    expect([...new Set(unknown)]).toStrictEqual([]);
  });

  test("singletons use their type as the id", () => {
    const singletons = new Set(contentSingletons.map(({ type }) => type));
    for (const { _id, _type } of documents) {
      if (singletons.has(_type)) expect(_id).toBe(_type);
    }
  });

  test("every document the Studio pins by id is backfilled with that id", () => {
    for (const { id, type } of pinnedDocuments) {
      expect(
        documents.find(({ _id }) => _id === id)?._type,
        `pinned document ${id}`,
      ).toBe(type);
    }
  });

  test("every required field is set", () => {
    let checked = 0;
    const missing = documents.flatMap((document) =>
      (schemaByName.get(document._type)?.fields ?? [])
        .filter((field) => isRequired(field.validation))
        .filter((field) => {
          checked++;
          return !isSet(document[field.name]);
        })
        .map((field) => `${document._id}.${field.name}`),
    );
    expect(missing).toStrictEqual([]);
    // Guards the Rule stand-in: the content types do have required fields.
    expect(checked).toBeGreaterThan(documents.length);
  });

  test("every image file exists", () => {
    const missing = collectSanityAssets(documents).filter((asset) => {
      const file = assetFileOf(asset);
      return !file || !existsSync(file);
    });
    expect(missing).toStrictEqual([]);
  });

  test("the required-field check sees Rule.required()", () => {
    expect(
      isRequired((rule: { required: () => unknown }) => rule.required()),
    ).toBe(true);
    expect(isRequired(undefined)).toBe(false);
    expect(
      isRequired((rule: { integer: () => unknown }) => rule.integer()),
    ).toBe(false);
  });
});

describe("the backfill target", () => {
  test("needs an explicit dataset", () => {
    expect(() => backfillTarget(undefined, {})).toThrow(/--dataset/);
    expect(() => backfillTarget("", {})).toThrow(/--dataset/);
    expect(() => backfillTarget("Not a name", {})).toThrow(/dataset name/);
  });

  test("never production, the old site's dataset", () => {
    expect(() => backfillTarget("production", {})).toThrow(/old site/);
    expect(() =>
      backfillTarget("production", { NEXT_PUBLIC_SANITY_DATASET: "redesign" }),
    ).toThrow(/old site/);
  });

  test("names the new site's dataset and the configured project", () => {
    expect(
      backfillTarget("redesign", {
        NEXT_PUBLIC_SANITY_PROJECT_ID: "abc123",
        NEXT_PUBLIC_SANITY_DATASET: "redesign",
      }),
    ).toStrictEqual({ dataset: "redesign", projectId: "abc123" });
    expect(backfillTarget("redesign", {})).toStrictEqual({
      dataset: "redesign",
      projectId: null,
    });
  });
});

/**
 * The copy of the old site's content, on a snapshot of `production`
 * (test/fixtures/production-documents.json: every published event and a few
 * partners and research projects, from the public API, trimmed to the
 * fields the copy handles) plus the documents a response could also hold.
 */
describe("the copy from production", () => {
  const projectId = "o9uuv2sq";
  const published = productionFixture as SourceDocument[];
  const eventId = "XNCTBM8X9vP2N4tjVzgD4y";
  const extra: SourceDocument[] = [
    { _id: `drafts.${eventId}`, _type: "event", title: "Draft" },
    { _id: `versions.r1.${eventId}`, _type: "event", title: "In a release" },
    { _id: "image-abc-1x1-png", _type: "sanity.imageAsset" },
    {
      _id: "partner-with-crop",
      _type: "partner",
      name: "Cropped",
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: "image-abc123-640x480-jpg" },
        hotspot: {
          _type: "sanity.imageHotspot",
          x: 0.4,
          y: 0.5,
          width: 1,
          height: 1,
        },
        crop: {
          _type: "sanity.imageCrop",
          top: 0.1,
          bottom: 0,
          left: 0,
          right: 0.2,
        },
      },
    },
  ];
  const copy = copyProductionDocuments([...published, ...extra], { projectId });
  const byId = new Map(
    copy.documents.map((document) => [document._id, document]),
  );

  test("copies the old site's types, the ones the Studio registers everywhere", () => {
    expect([...copiedTypes]).toStrictEqual(
      expect.arrayContaining(liveSchemaTypes.map(({ name }) => name)),
    );
    expect(copiedTypes).toHaveLength(liveSchemaTypes.length);
  });

  test("keeps every published _id and skips drafts, versions and other types", () => {
    expect(copy.documents.map(({ _id }) => _id)).toStrictEqual([
      ...published.map(({ _id }) => _id),
      "partner-with-crop",
    ]);
    const events = copy.documents.filter(({ _type }) => _type === "event");
    expect(events).toHaveLength(20);
  });

  test("drops the source's revision fields and keeps the content", () => {
    for (const document of copy.documents) {
      expect(Object.keys(document)).not.toEqual(
        expect.arrayContaining(["_rev"]),
      );
      expect(document).not.toHaveProperty("_updatedAt");
      expect(document).not.toHaveProperty("_system");
    }
    const source = published.find(({ _id }) => _id === eventId);
    expect(byId.get(eventId)).toMatchObject({
      _type: "event",
      _createdAt: source?._createdAt,
      title: source?.title,
      event_date: source?.event_date,
    });
  });

  test("turns every asset reference into an upload from the CDN", () => {
    const serialized = JSON.stringify(copy.documents);
    expect(serialized).not.toContain('"asset"');
    expect(serialized).not.toContain("_ref");
    const assets = collectSanityAssets(copy.documents);
    expect(assets.length).toBeGreaterThan(20);
    for (const asset of assets) {
      expect(asset).toMatch(
        /^image@https:\/\/cdn\.sanity\.io\/images\/o9uuv2sq\/production\/[a-f0-9]+-\d+x\d+\.[a-z]+$/,
      );
    }
    expect(byId.get("partner-with-crop")?.image).toStrictEqual({
      _type: "image",
      _sanityAsset:
        "image@https://cdn.sanity.io/images/o9uuv2sq/production/abc123-640x480.jpg",
      hotspot: {
        _type: "sanity.imageHotspot",
        x: 0.4,
        y: 0.5,
        width: 1,
        height: 1,
      },
      crop: {
        _type: "sanity.imageCrop",
        top: 0.1,
        bottom: 0,
        left: 0,
        right: 0.2,
      },
    });
  });

  test("refuses an asset it could not upload", () => {
    expect(() =>
      imageAssetUrl("file-abc-pdf", projectId, "production"),
    ).toThrow(/image asset/);
  });

  // Titles in production carry stray and non-breaking spaces.
  const titleOf = (document: SourceDocument) =>
    String(document.title).replace(/\s+/g, " ").trim();

  test("gives every live event its co-hosts, matched by title and start", () => {
    expect(liveEventHosts.length).toBeGreaterThan(0);
    expect(copy.hostsAdded).toBe(liveEventHosts.length);
    for (const { title, event_date, hosts } of liveEventHosts) {
      const event = copy.documents.find(
        (document) =>
          document._type === "event" &&
          titleOf(document) === title &&
          Date.parse(String(document.event_date)) === Date.parse(event_date),
      );
      expect(event?.hosts, title).toStrictEqual(hosts);
    }
    const withHosts = copy.documents.filter(({ hosts }) => hosts !== undefined);
    expect(withHosts).toHaveLength(liveEventHosts.length);
  });

  test("keeps the hosts an event already has", () => {
    const [entry] = liveEventHosts;
    const own = published.map((document) =>
      document._type === "event" && titleOf(document) === entry?.title
        ? { ...document, hosts: ["Their own"] }
        : document,
    );
    const result = copyProductionDocuments(own, { projectId });
    expect(result.hostsKept).toBe(1);
    expect(result.hostsAdded).toBe(liveEventHosts.length - 1);
  });

  test("fails on co-hosts that match no single event", () => {
    expect(() =>
      copyProductionDocuments(published, {
        projectId,
        eventHosts: [
          {
            title: "Google Hackathon",
            event_date: "2025-09-09T00:00:00Z",
            hosts: ["X"],
          },
          {
            title: "No such event",
            event_date: "2025-01-01T00:00:00Z",
            hosts: ["Y"],
          },
        ],
      }),
    ).toThrow(/Google Hackathon[\s\S]*No such event/);
  });

  test("reads production through the fetch it is given", async () => {
    const sources: unknown[] = [];
    const result = await copyFromProduction({
      projectId,
      fetchDocuments: async (source) => {
        sources.push(source);
        return published;
      },
    });
    expect(sources).toStrictEqual([{ projectId, dataset: "production" }]);
    expect(result.documents).toHaveLength(published.length);
  });

  test("the copies and the code content never share an _id", () => {
    const code = new Set(documents.map(({ _id }) => _id));
    expect(copy.documents.filter(({ _id }) => code.has(_id))).toStrictEqual([]);
  });

  test("the redesign-only events are new hackathons, not copies", () => {
    const events = documents.filter(({ _type }) => _type === "event");
    expect(events).toHaveLength(redesignOnlyEvents.length);
    const copied = copy.documents.filter(({ _type }) => _type === "event");
    for (const event of events) {
      expect(event.category).toBe("Hackathon");
      // Neither the same id nor the same title and start as a copied event.
      expect(
        copied.some(
          (source) =>
            source._id === event._id ||
            (source.title === event.title &&
              source.event_date === event.event_date),
        ),
      ).toBe(false);
    }
  });
});

describe("copied images", () => {
  const webp = new Uint8Array([
    ...new TextEncoder().encode("RIFF"),
    0,
    0,
    0,
    0,
    ...new TextEncoder().encode("WEBP"),
  ]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const url = "https://cdn.sanity.io/images/p/production/abc-10x10.webp";
  const documents = [
    {
      _id: "event-1",
      _type: "event",
      poster: {
        _type: "image",
        _sanityAsset: `image@${url}`,
        hotspot: { x: 0.5 },
      },
    },
  ];

  test("checks each file against its extension", () => {
    expect(matchesExtension(webp, "webp")).toBe(true);
    expect(matchesExtension(jpeg, "webp")).toBe(false);
    expect(matchesExtension(jpeg, "jpg")).toBe(true);
    expect(
      matchesExtension(
        new TextEncoder().encode('<?xml?><svg viewBox="0 0 1 1">'),
        "svg",
      ),
    ).toBe(true);
  });

  test("points the import at the downloaded files and keeps the image fields", async () => {
    const written = new Map<string, Uint8Array>();
    const result = await localizeCdnAssets(documents, {
      dir: "/tmp/backfill-assets",
      writeFile: (path, bytes) => written.set(path, bytes),
      download: async () => webp,
    });
    expect(result.downloaded).toBe(1);
    expect(result.documents[0]).toMatchObject({
      poster: {
        _sanityAsset: "image@file:///tmp/backfill-assets/abc-10x10.webp",
        hotspot: { x: 0.5 },
      },
    });
    expect([...written.keys()]).toStrictEqual([
      "/tmp/backfill-assets/abc-10x10.webp",
    ]);
  });

  test("fails when the CDN sends another format than the file names", async () => {
    await expect(
      localizeCdnAssets(documents, {
        dir: "/tmp/backfill-assets",
        writeFile: () => {},
        download: async () => jpeg,
      }),
    ).rejects.toThrow(/did not download as a \.webp file/);
  });
});

describe("the recovery of images an import left without a file", () => {
  const image = (file: string, alt?: string) => ({
    _type: "image",
    _sanityAsset: `image@file:///backfill/${file}`,
    ...(alt ? { alt } : {}),
  });
  const planned = [
    { _id: "homeCopy", _type: "homeCopy", hero: image("hero.webp") },
    { _id: "person-ada", _type: "person", portrait: image("ada.webp") },
    { _id: "person-bo", _type: "person", portrait: image("hero.webp") },
    {
      _id: "organization-acme",
      _type: "organization",
      logo: image("acme.svg", "Acme"),
    },
    { _id: "faq-one", _type: "faq", question: "No image here?" },
  ];
  const pending = (documentId: string, path: string, file: string) => ({
    documentId,
    path,
    sanityAsset: `image@file:///backfill/${file}`,
  });

  /** A dataset of `stored` documents that records what the recovery does. */
  function dataset(stored: Record<string, unknown>[]) {
    const asked: string[] = [];
    const uploads: string[] = [];
    const attached: [string, string, Record<string, string>][] = [];
    const client: RepairClient = {
      existingIds: async (ids) => {
        asked.push(...ids);
        return stored
          .map(({ _id }) => String(_id))
          .filter((id) => ids.includes(id));
      },
      fetchDocuments: async (ids) =>
        stored.filter((document) =>
          ids.includes(String(document._id)),
        ) as never,
      uploadImage: async (file) => {
        uploads.push(file);
        return `image-${file.split("/").pop()}`;
      },
      attach: async (id, rev, assets) => {
        attached.push([id, rev, assets]);
      },
    };
    return { client, asked, uploads, attached };
  }

  test("before the import, records the images of the documents it creates", async () => {
    const { client, asked } = dataset([
      { _id: "homeCopy", _rev: "r1" },
      { _id: "organization-acme", _rev: "r2" },
    ]);
    const previous = [pending("homeCopy", "hero", "hero.webp")];
    expect(
      await recordPendingAssets(planned, previous, client, {
        overwrite: false,
      }),
    ).toStrictEqual([
      pending("homeCopy", "hero", "hero.webp"),
      pending("person-ada", "portrait", "ada.webp"),
      pending("person-bo", "portrait", "hero.webp"),
    ]);
    // Only the documents that upload images.
    expect(asked).toStrictEqual([
      "homeCopy",
      "person-ada",
      "person-bo",
      "organization-acme",
    ]);
  });

  test("before an --overwrite import, records every image", async () => {
    const { client, asked } = dataset([{ _id: "homeCopy", _rev: "r1" }]);
    expect(
      await recordPendingAssets(planned, [], client, { overwrite: true }),
    ).toStrictEqual([
      pending("homeCopy", "hero", "hero.webp"),
      pending("person-ada", "portrait", "ada.webp"),
      pending("person-bo", "portrait", "hero.webp"),
      pending("organization-acme", "logo", "acme.svg"),
    ]);
    expect(asked).toStrictEqual([]);
  });

  test("uploads each pending file once, sets only those references and drops them", async () => {
    const { client, uploads, attached } = dataset([
      // Created, then the upload failed; an editor changed the title since.
      {
        _id: "homeCopy",
        _rev: "r1",
        title: "Edited",
        hero: { _type: "image" },
      },
      { _id: "drafts.homeCopy", _rev: "r2", hero: { _type: "image" } },
      // The import attached this one.
      {
        _id: "person-ada",
        _rev: "r3",
        portrait: { asset: { _ref: "image-x" } },
      },
      { _id: "person-bo", _rev: "r4", portrait: { _type: "image" } },
    ]);
    const result = await repairPendingAssets(
      [
        pending("homeCopy", "hero", "hero.webp"),
        pending("person-ada", "portrait", "ada.webp"),
        pending("person-bo", "portrait", "hero.webp"),
      ],
      client,
    );
    expect(result).toStrictEqual({ attached: 3, failures: [], pending: [] });
    expect(uploads).toStrictEqual(["/backfill/hero.webp"]);
    expect(attached).toStrictEqual([
      ["homeCopy", "r1", { hero: "image-hero.webp" }],
      ["drafts.homeCopy", "r2", { hero: "image-hero.webp" }],
      ["person-bo", "r4", { portrait: "image-hero.webp" }],
    ]);
  });

  test("leaves an image an editor removed in the Studio removed", async () => {
    // Remove keeps the custom fields: alt stays, only asset goes.
    const removed = { _type: "image", alt: "Acme" };
    const { client, attached } = dataset([
      { _id: "organization-acme", _rev: "r1", logo: removed },
      { _id: "drafts.organization-acme", _rev: "r2", logo: removed },
    ]);
    const before = await recordPendingAssets(planned, [], client, {
      overwrite: false,
    });
    expect(before.map(({ documentId }) => documentId)).not.toContain(
      "organization-acme",
    );
    expect(await repairPendingAssets(before, client)).toStrictEqual({
      attached: 0,
      failures: [],
      pending: [],
    });
    expect(attached).toStrictEqual([]);
  });

  test("keeps a failed upload for the next run and carries on with the others", async () => {
    const stored = [
      { _id: "homeCopy", _rev: "r1", hero: { _type: "image" } },
      { _id: "person-ada", _rev: "r3", portrait: { _type: "image" } },
    ];
    const entries = [
      pending("homeCopy", "hero", "hero.webp"),
      pending("person-ada", "portrait", "ada.webp"),
    ];
    const { client, attached } = dataset(stored);
    client.uploadImage = async (file) => {
      if (file.endsWith("hero.webp")) throw new Error("network down");
      return "image-ada";
    };
    const result = await repairPendingAssets(entries, client);
    expect(result).toStrictEqual({
      attached: 1,
      failures: ["homeCopy: network down"],
      pending: [entries[0]],
    });
    expect(attached).toStrictEqual([
      ["person-ada", "r3", { portrait: "image-ada" }],
    ]);

    // The next run retries it.
    const retry = dataset(stored);
    expect(
      await repairPendingAssets(result.pending, retry.client),
    ).toStrictEqual({ attached: 1, failures: [], pending: [] });
    expect(retry.attached).toStrictEqual([
      ["homeCopy", "r1", { hero: "image-hero.webp" }],
    ]);
  });

  test("retries only the draft when its repair failed after the published one succeeded", async () => {
    const stored = [
      { _id: "homeCopy", _rev: "r1", hero: { _type: "image" } },
      { _id: "drafts.homeCopy", _rev: "r2", hero: { _type: "image" } },
    ];
    const entry = pending("homeCopy", "hero", "hero.webp");
    const { client } = dataset(stored);
    client.attach = async (id) => {
      if (id.startsWith("drafts.")) throw new Error("revision changed");
    };
    const result = await repairPendingAssets([entry], client);
    expect(result).toStrictEqual({
      attached: 1,
      failures: ["drafts.homeCopy: revision changed"],
      pending: [{ ...entry, draftOnly: true }],
    });

    // The published image now has its file; the next run still repairs the draft.
    const retry = dataset([
      {
        ...stored[0],
        _rev: "r3",
        hero: { asset: { _ref: "image-hero.webp" } },
      },
      { ...stored[1], _rev: "r4" },
    ]);
    expect(
      await repairPendingAssets(result.pending, retry.client),
    ).toStrictEqual({ attached: 1, failures: [], pending: [] });
    expect(retry.attached).toStrictEqual([
      ["drafts.homeCopy", "r4", { hero: "image-hero.webp" }],
    ]);
  });

  test("finds every image of the real backfill by the path it records", () => {
    // As an import that created the documents and uploaded nothing.
    const created = JSON.parse(JSON.stringify(documents), (key, value) =>
      key === "_sanityAsset" ? undefined : value,
    ) as { _id: string }[];
    const entries = pendingAssetsBeforeImport(documents, {
      existingIds: new Set(),
      previous: [],
      overwrite: false,
    });
    expect(entries.length).toBe(
      documents.flatMap((document) => plannedAssets(document)).length,
    );
    expect(entries.length).toBeGreaterThan(0);
    expect(findUnattachedAssets(entries, created).open).toStrictEqual(entries);
  });

  test("asks only for the pending documents and their drafts", async () => {
    const asked: string[] = [];
    const { client } = dataset([]);
    client.fetchDocuments = async (ids) => {
      asked.push(...ids);
      return [];
    };
    await repairPendingAssets(
      [
        pending("homeCopy", "hero", "hero.webp"),
        pending("person-ada", "portrait", "ada.webp"),
      ],
      client,
    );
    expect(asked).toStrictEqual([
      "homeCopy",
      "drafts.homeCopy",
      "person-ada",
      "drafts.person-ada",
    ]);
  });
});
