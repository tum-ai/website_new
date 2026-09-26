import { redirect } from "next/navigation";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * The Sanity fetch layer (lib/sanity.ts) with `next/headers` and next-sanity
 * mocked: Sanity Live only loads under the react-server runtime, and the
 * module reads its env at import time, so each test stubs the env and
 * imports a fresh copy.
 */
const mocks = vi.hoisted(() => ({
  sanityFetch: vi.fn(),
  defineLive: vi.fn(),
  resolvePerspectiveFromCookies: vi.fn(),
  draftModeEnabled: false,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({})),
  draftMode: vi.fn(async () => ({ isEnabled: mocks.draftModeEnabled })),
}));

vi.mock("next-sanity", () => ({
  createClient: vi.fn((config: unknown) => ({ config })),
  defineQuery: (query: string) => query,
}));

vi.mock("next-sanity/live", () => ({
  defineLive: mocks.defineLive.mockImplementation(() => ({
    sanityFetch: mocks.sanityFetch,
    SanityLive: () => null,
  })),
  resolvePerspectiveFromCookies: mocks.resolvePerspectiveFromCookies,
}));

async function loadSanity(env: Record<string, string> = {}) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123");
  vi.stubEnv("SANITY_API_READ_TOKEN", "");
  vi.stubEnv("SANITY_API_BROWSER_TOKEN", "");
  vi.stubEnv("USE_MOCK_CMS", "");
  vi.stubEnv("VERCEL", "");
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.resetModules();
  return import("@/lib/sanity");
}

const partner = {
  id: "p1",
  name: "IBM",
  link: null,
  image: "https://cdn/ibm.png",
  category: "Research Partners",
  tier: null,
  featured: null,
};

beforeEach(() => {
  mocks.draftModeEnabled = false;
  mocks.sanityFetch.mockReset();
  mocks.defineLive.mockClear();
  mocks.resolvePerspectiveFromCookies.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("tokens", () => {
  test("the read token stays on the server; no browser token by default", async () => {
    await loadSanity({ SANITY_API_READ_TOKEN: "server-secret" });
    expect(mocks.defineLive).toHaveBeenCalledWith(
      expect.objectContaining({
        serverToken: "server-secret",
        browserToken: false,
      }),
    );
  });

  test("only the separate browser token is handed to the browser", async () => {
    await loadSanity({
      SANITY_API_READ_TOKEN: "server-secret",
      SANITY_API_BROWSER_TOKEN: "browser-viewer",
    });
    expect(mocks.defineLive).toHaveBeenCalledWith(
      expect.objectContaining({ browserToken: "browser-viewer" }),
    );
  });

  test("getSanityReadToken treats an empty value as unset", async () => {
    const sanity = await loadSanity();
    expect(sanity.getSanityReadToken()).toBeUndefined();
  });
});

describe("page fetchers", () => {
  test("return [] without a request when no project is configured", async () => {
    const sanity = await loadSanity({ NEXT_PUBLIC_SANITY_PROJECT_ID: "" });
    await expect(sanity.getSanityPartners()).resolves.toStrictEqual([]);
    expect(mocks.sanityFetch).not.toHaveBeenCalled();
  });

  test("fetch published content without stega outside draft mode", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: [partner] });
    const sanity = await loadSanity({ SANITY_API_READ_TOKEN: "t" });

    const partners = await sanity.getSanityPartners();

    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        perspective: "published",
        stega: false,
        tags: ["partners"],
      }),
    );
    // `null` fields are dropped for the page components' optional props.
    expect(partners).toStrictEqual([
      {
        id: "p1",
        name: "IBM",
        image: "https://cdn/ibm.png",
        category: "Research Partners",
      },
    ]);
  });

  test("fetch drafts with stega in draft mode when a token is set", async () => {
    mocks.draftModeEnabled = true;
    mocks.resolvePerspectiveFromCookies.mockResolvedValue("drafts");
    mocks.sanityFetch.mockResolvedValue({ data: [] });
    const sanity = await loadSanity({ SANITY_API_READ_TOKEN: "t" });

    await sanity.getSanityEvents();

    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "drafts", stega: true }),
    );
  });

  test("stay on published content in draft mode without a token", async () => {
    mocks.draftModeEnabled = true;
    mocks.sanityFetch.mockResolvedValue({ data: [] });
    const sanity = await loadSanity();

    await sanity.getSanityResearchProjects();

    expect(mocks.resolvePerspectiveFromCookies).not.toHaveBeenCalled();
    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "published", stega: false }),
    );
  });

  test.each([
    "getSanityEvents",
    "getSanityPartners",
    "getSanityResearchPartners",
    "getSanityResearchProjects",
  ] as const)("%s logs a CMS failure and returns []", async (name) => {
    mocks.sanityFetch.mockRejectedValue(new Error("Sanity is down"));
    const sanity = await loadSanity();

    await expect(sanity[name]()).resolves.toStrictEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[sanity] Could not load"),
      expect.any(Error),
    );
  });

  test("rethrow Next's control-flow errors instead of swallowing them", async () => {
    mocks.sanityFetch.mockImplementation(() => redirect("/elsewhere"));
    const sanity = await loadSanity();

    await expect(sanity.getSanityEvents()).rejects.toThrow("NEXT_REDIRECT");
  });

  test("a non-array result becomes []", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: null });
    const sanity = await loadSanity();
    await expect(sanity.getSanityPartners()).resolves.toStrictEqual([]);
  });
});

describe("mock CMS gate", () => {
  test("USE_MOCK_CMS=1 serves fixtures without contacting Sanity", async () => {
    const sanity = await loadSanity({
      USE_MOCK_CMS: "1",
      MOCK_CMS_NOW: "2026-09-25T12:00:00Z",
    });

    const events = await sanity.getSanityEvents();
    const researchPartners = await sanity.getSanityResearchPartners();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].id).toMatch(/^mock-/);
    expect(events[0].event_date).toBe("2026-10-04T18:00:00.000Z");
    expect(researchPartners.length).toBeGreaterThan(0);
    expect(mocks.sanityFetch).not.toHaveBeenCalled();
  });

  test.each([
    ["off", { USE_MOCK_CMS: "" }],
    ["not exactly 1", { USE_MOCK_CMS: "true" }],
    ["on Vercel", { USE_MOCK_CMS: "1", VERCEL: "1" }],
  ])("is ignored when %s", async (_, env) => {
    mocks.sanityFetch.mockResolvedValue({ data: [] });
    const sanity = await loadSanity(env);

    await expect(sanity.getSanityEvents()).resolves.toStrictEqual([]);
    expect(mocks.sanityFetch).toHaveBeenCalledOnce();
  });
});

describe("published fetchers for the public API", () => {
  test("ignore draft mode, the mock CMS and keep null fields", async () => {
    mocks.draftModeEnabled = true;
    mocks.resolvePerspectiveFromCookies.mockResolvedValue("drafts");
    mocks.sanityFetch.mockResolvedValue({ data: [partner] });
    const sanity = await loadSanity({
      SANITY_API_READ_TOKEN: "t",
      USE_MOCK_CMS: "1",
    });

    await expect(sanity.getPublishedPartners()).resolves.toStrictEqual([
      partner,
    ]);
    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "published", stega: false }),
    );
    expect(mocks.resolvePerspectiveFromCookies).not.toHaveBeenCalled();
  });

  test("throw on a CMS failure so the route can answer 500", async () => {
    mocks.sanityFetch.mockRejectedValue(new Error("Sanity is down"));
    const sanity = await loadSanity();
    await expect(sanity.getPublishedEvents()).rejects.toThrow("Sanity is down");
  });
});
