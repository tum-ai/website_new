import { afterEach, describe, expect, test, vi } from "vitest";
import { organizationsWithKeys } from "@/features/partners";
import { hostArtworkOf } from "./data/host-logos";
import { getHostArtwork } from "./host-content";

/**
 * Parity for the /events co-host artwork: the co-hosts' organisations, read
 * back from the backfill through the real query under the mock CMS, give
 * the code artwork, aspect ratios included.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const keys = ["anthropic", "manage-and-more", "mercura", "red-bull", "nope"];
const codeArtwork = hostArtworkOf(organizationsWithKeys(keys));

describe("the /events co-host artwork", () => {
  test("code source: the code organisations' artwork", async () => {
    useSource("code");
    await expect(getHostArtwork(keys)).resolves.toStrictEqual(codeArtwork);
  });

  test("sanity source over the backfill: the same artwork", async () => {
    useSource("sanity");
    const artwork = await getHostArtwork(keys);
    expect(artwork).toStrictEqual(codeArtwork);
    expect(Object.keys(artwork.logos)).toStrictEqual([
      "anthropic",
      "manage-and-more",
      "red-bull",
    ]);
    expect(artwork.icons).toStrictEqual({
      mercura: "/assets/events/hosts/mercura-icon.webp",
    });
  });

  test("no co-host organisations, no request and no artwork", async () => {
    useSource("sanity");
    await expect(getHostArtwork([])).resolves.toStrictEqual({
      logos: {},
      icons: {},
    });
  });
});

describe("hostArtworkOf", () => {
  test("keys the dark logos by organisation, icons apart", () => {
    const { logos, icons } = hostArtworkOf(
      organizationsWithKeys(["red-bull", "mercura"]),
    );
    expect(logos["red-bull"]?.aspect).toBeCloseTo(224.189 / 36);
    expect(icons).toStrictEqual({
      mercura: "/assets/events/hosts/mercura-icon.webp",
    });
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
