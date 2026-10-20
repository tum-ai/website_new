import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { publicApiCacheControl } from "@/lib/public-api";

/**
 * The legacy public API routes through the real fetch layer (lib/sanity.ts),
 * with next-sanity and `next/headers` mocked. The browser has a draft-mode
 * cookie and the server a read token, so a route that followed draft mode
 * would ask for drafts.
 */
const mocks = vi.hoisted(() => ({ sanityFetch: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({})),
  draftMode: vi.fn(async () => ({ isEnabled: true })),
}));

vi.mock("next-sanity", () => ({
  createClient: vi.fn(() => ({})),
  defineQuery: (query: string) => query,
}));

vi.mock("next-sanity/live", () => ({
  defineLive: () => ({
    sanityFetch: mocks.sanityFetch,
    SanityLive: () => null,
  }),
  resolvePerspectiveFromCookies: vi.fn(async () => "drafts"),
}));

const routes = [
  ["getNotes", "events", ["events"]],
  ["getPartners", "partners", ["partners"]],
  ["getResearch", "research", ["research-projects"]],
] as const;

async function loadRoute(name: (typeof routes)[number][0]) {
  vi.resetModules();
  const modules = {
    getNotes: () => import("./getNotes/route"),
    getPartners: () => import("./getPartners/route"),
    getResearch: () => import("./getResearch/route"),
  };
  return (await modules[name]()).GET;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123");
  vi.stubEnv("SANITY_API_READ_TOKEN", "server-secret");
  mocks.sanityFetch.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe.each(routes)("/api/%s", (name, resource, tags) => {
  test("serves the published perspective with CDN cache headers", async () => {
    const body = [{ id: "1", title: "Published", poster: null }];
    mocks.sanityFetch.mockResolvedValue({ data: body });

    const response = await (await loadRoute(name))();

    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "published", stega: false, tags }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(publicApiCacheControl);
    // The frozen shape keeps `null` fields.
    expect(await response.json()).toStrictEqual(body);
  });

  test("answers an uncached 500 when Sanity fails", async () => {
    mocks.sanityFetch.mockRejectedValue(new Error("Sanity is down"));

    const response = await (await loadRoute(name))();

    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toStrictEqual({
      error: `Failed to fetch ${resource}`,
    });
  });
});

test("the CDN may cache successes, browsers always revalidate", () => {
  expect(publicApiCacheControl).toMatch(/\bpublic\b/);
  expect(publicApiCacheControl).toMatch(/\bmax-age=0\b/);
  expect(publicApiCacheControl).toMatch(/\bs-maxage=\d+/);
});
