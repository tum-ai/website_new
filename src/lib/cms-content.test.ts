import { redirect } from "next/navigation";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * The content read path (lib/cms-content.ts) with next-sanity mocked. The
 * module reads the project and dataset at import time, so each test stubs
 * the env and imports a fresh copy.
 */
const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("next-sanity", () => ({
  createClient: mocks.createClient.mockImplementation((config: unknown) => ({
    config,
    fetch: mocks.fetch,
  })),
}));

async function loadCmsContent(env: Record<string, string> = {}) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
  vi.stubEnv("NEXT_PUBLIC_SANITY_CONTENT_DATASET", "redesign");
  vi.stubEnv("CMS_CONTENT_SOURCE", "sanity");
  vi.stubEnv("USE_MOCK_CMS", "");
  vi.stubEnv("VERCEL", "");
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.resetModules();
  return import("./cms-content");
}

const doc = { _id: "t-1", _type: "thing", title: "From the mock" };
const options = {
  query: `*[_type == "thing"][0]{ title }`,
  tags: ["content:thing"],
  mockDocuments: () => [doc],
  label: "the thing",
};

beforeEach(() => {
  mocks.fetch.mockReset();
  mocks.createClient.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getContentSource", () => {
  test("defaults to code and accepts either source, in any case", async () => {
    const { getContentSource } = await loadCmsContent();
    expect(getContentSource("")).toBe("code");
    expect(getContentSource(" Sanity ")).toBe("sanity");
    expect(getContentSource("code")).toBe("code");
  });

  test("throws on anything else, so a typo fails the build", async () => {
    const { getContentSource } = await loadCmsContent();
    expect(() => getContentSource("cms")).toThrow(/CMS_CONTENT_SOURCE/);
  });

  test("reads CMS_CONTENT_SOURCE by default", async () => {
    const { getContentSource } = await loadCmsContent({
      CMS_CONTENT_SOURCE: "",
    });
    expect(getContentSource()).toBe("code");
  });
});

test("the content client reads the content dataset, published, from the CDN", async () => {
  await loadCmsContent();
  expect(mocks.createClient).toHaveBeenCalledWith(
    expect.objectContaining({
      projectId: "abc123",
      dataset: "redesign",
      perspective: "published",
      useCdn: true,
    }),
  );
});

test("the content dataset defaults to the live dataset", async () => {
  await loadCmsContent({ NEXT_PUBLIC_SANITY_CONTENT_DATASET: "" });
  expect(mocks.createClient).toHaveBeenCalledWith(
    expect.objectContaining({ dataset: "production" }),
  );
});

describe("fetchContent", () => {
  test("fetches with the tags and params, and revalidate only when given", async () => {
    mocks.fetch.mockResolvedValue({ title: "CMS" });
    const { fetchContent } = await loadCmsContent();

    await expect(
      fetchContent({ ...options, params: { a: 1 } }),
    ).resolves.toStrictEqual({ title: "CMS" });
    expect(mocks.fetch).toHaveBeenLastCalledWith(
      options.query,
      { a: 1 },
      { next: { tags: ["content:thing"] } },
    );

    await fetchContent({ ...options, revalidate: 60 });
    expect(mocks.fetch).toHaveBeenLastCalledWith(
      options.query,
      {},
      { next: { tags: ["content:thing"], revalidate: 60 } },
    );
  });

  test("returns null for an empty result", async () => {
    mocks.fetch.mockResolvedValue(null);
    const { fetchContent } = await loadCmsContent();
    await expect(fetchContent(options)).resolves.toBeNull();
  });

  test("returns null without a request when no project is configured", async () => {
    const { fetchContent } = await loadCmsContent({
      NEXT_PUBLIC_SANITY_PROJECT_ID: "",
    });
    await expect(fetchContent(options)).resolves.toBeNull();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  test("logs a failed request and returns null", async () => {
    mocks.fetch.mockRejectedValue(new Error("offline"));
    const { fetchContent } = await loadCmsContent();
    await expect(fetchContent(options)).resolves.toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("the thing"),
      expect.any(Error),
    );
  });

  test("rethrows Next.js control flow", async () => {
    mocks.fetch.mockImplementation(() => redirect("/elsewhere"));
    const { fetchContent } = await loadCmsContent();
    await expect(fetchContent(options)).rejects.toThrow("NEXT_REDIRECT");
  });

  test("evaluates the query over the mock documents under the mock CMS", async () => {
    const { fetchContent } = await loadCmsContent({ USE_MOCK_CMS: "1" });
    await expect(fetchContent(options)).resolves.toStrictEqual({
      title: "From the mock",
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  test("never uses the mock on Vercel", async () => {
    mocks.fetch.mockResolvedValue({ title: "CMS" });
    const { fetchContent } = await loadCmsContent({
      USE_MOCK_CMS: "1",
      VERCEL: "1",
    });
    await expect(fetchContent(options)).resolves.toStrictEqual({
      title: "CMS",
    });
  });
});

describe("loadContent", () => {
  const fallback = { title: "Code", lead: "Code lead" };
  const load = {
    ...options,
    fallback,
    select: (result: { title: string }) => result,
  };

  test("the code source returns the fallback without a request", async () => {
    const { loadContent } = await loadCmsContent({
      CMS_CONTENT_SOURCE: "code",
    });
    await expect(loadContent(load)).resolves.toBe(fallback);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  test("the sanity source merges the selected result over the fallback", async () => {
    mocks.fetch.mockResolvedValue({ title: "CMS" });
    const { loadContent } = await loadCmsContent();
    await expect(loadContent(load)).resolves.toStrictEqual({
      title: "CMS",
      lead: "Code lead",
    });
  });

  test("a failed request renders the fallback", async () => {
    mocks.fetch.mockRejectedValue(new Error("offline"));
    const { loadContent } = await loadCmsContent();
    await expect(loadContent(load)).resolves.toBe(fallback);
  });
});
