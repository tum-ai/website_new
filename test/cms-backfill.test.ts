import { describe, expect, test } from "vitest";
import {
  findUnattachedAssets,
  pendingAssetsBeforeImport,
  plannedAssets,
} from "../scripts/sanity/asset-ledger";
import {
  copyProductionDocuments,
  localizeCdnAssets,
  matchesExtension,
} from "../scripts/sanity/production-copy";
import {
  type RepairClient,
  recordPendingAssets,
  repairPendingAssets,
} from "../scripts/sanity/repair-assets";

test("production copy preserves live fields, ignores drafts and does not enrich from local seeds", () => {
  const result = copyProductionDocuments(
    [
      {
        _id: "event-a",
        _type: "event",
        _rev: "r1",
        title: "Example event",
        hosts: ["Live host"],
        poster: { asset: { _ref: "image-abc-10x10-webp" } },
      },
      { _id: "drafts.event-b", _type: "event", title: "Draft" },
      { _id: "settings", _type: "siteSettings", name: "Do not copy" },
    ],
    { projectId: "example" },
  );
  expect(result.documents).toStrictEqual([
    {
      _id: "event-a",
      _type: "event",
      title: "Example event",
      hosts: ["Live host"],
      poster: {
        _sanityAsset:
          "image@https://cdn.sanity.io/images/example/production/abc-10x10.webp",
      },
    },
  ]);
  expect(
    copyProductionDocuments(
      [{ _id: "event-b", _type: "event", title: "Unseeded event" }],
      { projectId: "example" },
    ).documents[0],
  ).not.toHaveProperty("hosts");
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

  test("finds every planned image by the path it records", () => {
    // As an import that created the documents and uploaded nothing.
    const created = JSON.parse(JSON.stringify(planned), (key, value) =>
      key === "_sanityAsset" ? undefined : value,
    ) as { _id: string }[];
    const entries = pendingAssetsBeforeImport(planned, {
      existingIds: new Set(),
      previous: [],
      overwrite: false,
    });
    expect(entries.length).toBe(
      planned.flatMap((document) => plannedAssets(document)).length,
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
