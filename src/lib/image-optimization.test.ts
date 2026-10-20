import { describe, expect, test } from "vitest";
import { coverSizes, isUnoptimizedRemoteImage } from "./image-optimization";

describe("coverSizes", () => {
  test("widens each breakpoint by how much wider the photo is than its frame", () => {
    expect(
      coverSizes({ width: 3000, height: 1000 }, [
        { media: "(min-width: 64rem)", width: 80, unit: "rem", aspect: 3 },
        { media: "(min-width: 40rem)", width: 100, unit: "vw", aspect: 2 },
        { width: 100, unit: "vw", aspect: 4 / 3 },
      ]),
    ).toBe("(min-width: 64rem) 80rem, (min-width: 40rem) 150vw, 225vw");
  });

  test("keeps the frame width for a photo narrower than its frame", () => {
    expect(
      coverSizes({ width: 800, height: 1200 }, [
        { width: 30, unit: "rem", aspect: 1 },
      ]),
    ).toBe("30rem");
  });
});

describe("isUnoptimizedRemoteImage", () => {
  test.each([
    "https://cdn.sanity.io/images/project/redesign/portrait-800x1200.webp",
    "https://cdn.sanity.io/images/project/redesign/photo.webp?w=600&fit=crop",
    "/assets/fixtures/photo.svg",
    "/assets/tum_ai_logo_new.svg",
    "",
  ])("keeps configured Sanity images and local assets optimized: %s", (src) => {
    expect(isUnoptimizedRemoteImage(src)).toBe(false);
  });

  test.each([
    "https://example.org/portrait.webp",
    "http://example.org/portrait.webp",
    "http://cdn.sanity.io/images/project/redesign/portrait.webp",
    "https://cdn.sanity.io/files/project/redesign/file.png",
    "https://cdn.sanity.io/images-other/portrait.webp",
    "https://cdn.sanity.io.evil.example/images/portrait.webp",
  ])(
    "bypasses optimization outside the configured remote pattern: %s",
    (src) => {
      expect(isUnoptimizedRemoteImage(src)).toBe(true);
    },
  );
});
