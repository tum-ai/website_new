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
 * section is visible without scroll reveals, nothing loops, and marquees
 * become a static list without their duplicate copy.
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

test("marquees render one static, reachable list", async ({ page }) => {
  await page.goto("/");
  await loadLazyContent(page);
  const marquees = page.locator('[class~="group/marquee"]');
  expect(await marquees.count()).toBeGreaterThan(0);

  for (const marquee of await marquees.all()) {
    // The inert duplicate is display: none; the labelled original remains.
    await expect(marquee.locator("ul[aria-hidden]")).toBeHidden();
    await expect(marquee.locator("ul[aria-label]")).toBeVisible();
    expect(await getRunningAnimations(page, marquee)).toEqual([]);
  }
});
