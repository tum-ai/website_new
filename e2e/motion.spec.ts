import {
  expect,
  expectContentVisible,
  getRunningAnimations,
  loadLazyContent,
  siteRoutes,
  test,
  waitForAnimations,
} from "./fixtures";

/*
 * `prefers-reduced-motion: reduce` (the `reduced-motion` project): every
 * section is visible without scroll reveals and nothing loops (aurora,
 * drift and the partner marquee hold still).
 */

for (const route of siteRoutes) {
  test.describe(route.path, () => {
    test("shows all content and runs no looping animation", async ({
      page,
    }) => {
      await page.goto(route.path);
      await loadLazyContent(page);
      await waitForAnimations(page);
      await expectContentVisible(page);

      const looping = (await getRunningAnimations(page)).filter(
        (animation) => animation.infinite,
      );
      expect(looping, "infinite animations under reduced motion").toEqual([]);
    });
  });
}
