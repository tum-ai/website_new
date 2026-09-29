import { afterEach, describe, expect, test, vi } from "vitest";
import {
  eventHostLists,
  hostArtworkOf,
  hostIcon,
  hostLogo,
} from "./data/host-logos";
import { getHostArtwork } from "./host-content";

/**
 * Parity for the /events co-host slice: the `event-hosts` list, read back
 * from the backfill through the real query under the mock CMS, gives the
 * code artwork, aspect ratios included.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const codeArtwork = hostArtworkOf(eventHostLists["event-hosts"]);

describe("the /events co-host slice", () => {
  test("code source: the code artwork", async () => {
    useSource("code");
    await expect(getHostArtwork()).resolves.toStrictEqual(codeArtwork);
  });

  test("sanity source over the backfill: the same artwork", async () => {
    useSource("sanity");
    const artwork = await getHostArtwork();
    expect(artwork).toStrictEqual(codeArtwork);
    expect(Object.keys(artwork.logos).length).toBeGreaterThan(10);
  });
});

describe("host artwork lookups", () => {
  test("match a co-host by its key or its name, and set icons apart", () => {
    expect(hostLogo("Manage & More")).toStrictEqual(
      hostLogo("Manage and More"),
    );
    expect(hostLogo("Red Bull")?.aspect).toBeCloseTo(224.189 / 36);
    expect(hostLogo("Mercura")).toBeUndefined();
    expect(hostIcon("Mercura")).toBe("/assets/events/hosts/mercura-icon.webp");
    expect(hostLogo("Unknown Co")).toBeUndefined();
  });

  test("artwork without an aspect ratio is sized by its file", () => {
    const { logos } = hostArtworkOf([
      {
        key: "acme",
        name: "Acme",
        logoOnDark: { src: "/a.svg", width: 300, height: 100, alt: "Acme" },
      },
      { key: "plain", name: "Plain" },
    ]);
    expect(logos).toStrictEqual({ acme: { src: "/a.svg", aspect: 3 } });
  });
});
