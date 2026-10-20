import { expect, test } from "vitest";
import { REEL_LOGO_SIZES, reelImagePreloads } from "./reel-images";

test("the preloads ask the optimizer for what the reel renders", () => {
  const [logo, icon, ...rest] = reelImagePreloads({
    logos: { acme: { src: "/a.png", aspect: 3 } },
    icons: { mercura: "/m.webp" },
  });
  expect(rest).toStrictEqual([]);
  expect(logo?.sizes).toBe(REEL_LOGO_SIZES);
  expect(logo?.srcSet).toContain("/_next/image?url=%2Fa.png&w=");
  // A fixed-size icon: density descriptors, no `sizes`.
  expect(icon?.sizes).toBeUndefined();
  expect(icon?.srcSet).toMatch(/^\/_next\/image\?url=%2Fm\.webp.* 1x, .* 2x$/);
});

test("no artwork, nothing to preload", () => {
  expect(reelImagePreloads({ logos: {}, icons: {} })).toStrictEqual([]);
});
