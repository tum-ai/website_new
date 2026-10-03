import { describe, expect, test } from "vitest";
import { isUnoptimizedRemoteImage } from "./image-optimization";

describe("isUnoptimizedRemoteImage", () => {
  test.each([
    "https://cdn.sanity.io/images/project/redesign/portrait-800x1200.webp",
    "https://cdn.sanity.io/images/project/redesign/photo.webp?w=600&fit=crop",
    "/assets/homepage/IBM_visit.webp",
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
