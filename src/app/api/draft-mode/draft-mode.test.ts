import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET as disable } from "./disable/route";
import { GET as enable } from "./enable/route";

const mocks = vi.hoisted(() => ({
  readToken: undefined as string | undefined,
  withConfig: vi.fn((config: unknown) => ({ config })),
  nextSanityEnable: vi.fn(),
  defineEnableDraftMode: vi.fn(),
  disableDraftMode: vi.fn(),
}));

// The real module defines Sanity Live, which only loads under react-server.
vi.mock("@/lib/sanity", () => ({
  client: { withConfig: mocks.withConfig },
  getSanityReadToken: () => mocks.readToken,
}));

vi.mock("next-sanity/draft-mode", () => ({
  defineEnableDraftMode: mocks.defineEnableDraftMode.mockImplementation(() => ({
    GET: mocks.nextSanityEnable,
  })),
}));

vi.mock("next/headers", () => ({
  draftMode: async () => ({ disable: mocks.disableDraftMode }),
}));

beforeEach(() => {
  mocks.readToken = undefined;
  vi.clearAllMocks();
});

const origin = "https://preview.example";

describe("/api/draft-mode/enable", () => {
  test("answers 503 with an explanation when no read token is set", async () => {
    const response = await enable(
      new Request(`${origin}/api/draft-mode/enable?sanity-preview-secret=x`),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toContain("SANITY_API_READ_TOKEN");
    expect(mocks.nextSanityEnable).not.toHaveBeenCalled();
  });

  test("validates the preview secret through next-sanity with the server token", async () => {
    mocks.readToken = "server-secret";
    mocks.nextSanityEnable.mockResolvedValue(
      new Response(null, { status: 307, headers: { Location: "/events" } }),
    );
    const request = new Request(
      `${origin}/api/draft-mode/enable?sanity-preview-secret=x`,
    );

    const response = await enable(request);

    expect(mocks.withConfig).toHaveBeenCalledWith({ token: "server-secret" });
    expect(mocks.defineEnableDraftMode).toHaveBeenCalledWith({
      client: { config: { token: "server-secret" } },
    });
    expect(mocks.nextSanityEnable).toHaveBeenCalledWith(request);
    expect(response.status).toBe(307);
  });

  test("passes next-sanity's 401 for a wrong secret through", async () => {
    mocks.readToken = "server-secret";
    mocks.nextSanityEnable.mockResolvedValue(
      new Response("Invalid secret", { status: 401 }),
    );

    const response = await enable(
      new Request(`${origin}/api/draft-mode/enable?sanity-preview-secret=bad`),
    );

    expect(response.status).toBe(401);
  });
});

describe("/api/draft-mode/disable", () => {
  const location = async (query: string) => {
    const response = await disable(
      new Request(`${origin}/api/draft-mode/disable${query}`),
    );
    expect(response.status).toBe(307);
    return response.headers.get("Location");
  };

  test("turns draft mode off and returns to the given page", async () => {
    expect(await location("?redirect=/events?x=1")).toBe(
      `${origin}/events?x=1`,
    );
    expect(mocks.disableDraftMode).toHaveBeenCalledOnce();
  });

  test("falls back to the homepage without a redirect", async () => {
    expect(await location("")).toBe(`${origin}/`);
  });

  test.each([
    "https://evil.example/",
    "//evil.example/",
    "/\\evil.example/",
    "javascript:alert(1)",
  ])("is not an open redirect: %s goes home", async (target) => {
    expect(await location(`?redirect=${encodeURIComponent(target)}`)).toBe(
      `${origin}/`,
    );
  });
});
