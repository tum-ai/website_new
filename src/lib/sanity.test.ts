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
  stegaClean: <T>(value: T) => value,
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

const project = {
  id: "r1",
  title: "Study",
  description: "",
  status: "ongoing",
  publication: null,
  keywords: [],
  image: "https://cdn/study.png",
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
    await expect(sanity.getSanityResearchProjects()).resolves.toStrictEqual([]);
    expect(mocks.sanityFetch).not.toHaveBeenCalled();
  });

  test("fetch published content without stega outside draft mode", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: [project] });
    const sanity = await loadSanity({ SANITY_API_READ_TOKEN: "t" });

    const projects = await sanity.getSanityResearchProjects();

    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        perspective: "published",
        stega: false,
        tags: ["research-projects", "content:organization"],
      }),
    );
    // `null` fields are dropped for the page components' optional props.
    expect(projects).toStrictEqual([
      {
        id: "r1",
        title: "Study",
        description: "",
        status: "ongoing",
        keywords: [],
        image: "https://cdn/study.png",
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

  test("leave out event drafts without a title or a valid date", async () => {
    mocks.draftModeEnabled = true;
    mocks.resolvePerspectiveFromCookies.mockResolvedValue("drafts");
    const draft = {
      description: "",
      location: null,
      city: null,
      category: null,
      hosts: [],
      coHosts: null,
      poster: null,
      images: [],
      sign_up: null,
    };
    mocks.sanityFetch.mockResolvedValue({
      data: [
        { ...draft, id: "untitled", title: null, event_date: "2026-10-04" },
        { ...draft, id: "blank", title: "  ", event_date: "2026-10-04" },
        { ...draft, id: "undated", title: "Talk", event_date: null },
        { ...draft, id: "invalid", title: "Talk", event_date: "soon" },
        { ...draft, id: "ready", title: "Talk", event_date: "2026-10-04" },
      ],
    });
    const sanity = await loadSanity({ SANITY_API_READ_TOKEN: "t" });

    const events = await sanity.getSanityEvents();

    expect(events.map(({ id }) => id)).toStrictEqual(["ready"]);
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

  test.each(["getSanityEvents", "getSanityResearchProjects"] as const)(
    "%s logs a CMS failure and returns []",
    async (name) => {
      mocks.sanityFetch.mockRejectedValue(new Error("Sanity is down"));
      const sanity = await loadSanity();

      await expect(sanity[name]()).resolves.toStrictEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[sanity] Could not load"),
        expect.any(Error),
      );
    },
  );

  test("rethrow Next's control-flow errors instead of swallowing them", async () => {
    mocks.sanityFetch.mockImplementation(() => redirect("/elsewhere"));
    const sanity = await loadSanity();

    await expect(sanity.getSanityEvents()).rejects.toThrow("NEXT_REDIRECT");
  });

  test("a non-array result becomes []", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: null });
    const sanity = await loadSanity();
    await expect(sanity.getSanityEvents()).resolves.toStrictEqual([]);
  });
});

describe("mock CMS gate", () => {
  test("USE_MOCK_CMS=1 serves fixtures without contacting Sanity", async () => {
    const sanity = await loadSanity({
      USE_MOCK_CMS: "1",
      MOCK_CMS_NOW: "2026-09-25T12:00:00Z",
    });

    const events = await sanity.getSanityEvents();
    const projects = await sanity.getSanityResearchProjects();

    expect(events).toHaveLength(9);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "settings-fixture-match",
          title: "Fixture match",
        }),
        expect.objectContaining({
          id: "fixture-event-0",
          title: "Example hackathon 1",
          event_date: "2026-10-04T18:00:00.000Z",
          poster: "/assets/fixtures/photo.svg",
        }),
      ]),
    );
    expect(projects.map(({ id }) => id)).toEqual([
      "fixture-research-ongoing",
      "fixture-research-complete",
    ]);
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

  test("partners come from the partner organisations on the new site's dataset", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: [partner] });
    const sanity = await loadSanity({ NEXT_PUBLIC_SANITY_DATASET: "redesign" });

    await expect(sanity.getPublishedPartners()).resolves.toStrictEqual([
      partner,
    ]);
    expect(mocks.sanityFetch).toHaveBeenCalledOnce();
    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('_type == "organization"'),
        tags: ["content:organization"],
      }),
    );
  });

  test("partners fall back to the partner documents until organisations have tiers", async () => {
    mocks.sanityFetch
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [partner] });
    const sanity = await loadSanity({ NEXT_PUBLIC_SANITY_DATASET: "redesign" });

    await expect(sanity.getPublishedPartners()).resolves.toStrictEqual([
      partner,
    ]);
    expect(mocks.sanityFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('_type == "partner"'),
        tags: ["partners"],
      }),
    );
  });

  test("partners on production are the partner documents only", async () => {
    mocks.sanityFetch.mockResolvedValue({ data: [partner] });
    const sanity = await loadSanity({
      NEXT_PUBLIC_SANITY_DATASET: "production",
    });

    await expect(sanity.getPublishedPartners()).resolves.toStrictEqual([
      partner,
    ]);
    expect(mocks.sanityFetch).toHaveBeenCalledOnce();
    expect(mocks.sanityFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('_type == "partner"'),
      }),
    );
  });

  test("throw on a CMS failure so the route can answer 500", async () => {
    mocks.sanityFetch.mockRejectedValue(new Error("Sanity is down"));
    const sanity = await loadSanity();
    await expect(sanity.getPublishedEvents()).rejects.toThrow("Sanity is down");
  });
});
