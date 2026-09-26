import {
  expect,
  expectNoBrokenImages,
  expectNoConsoleErrors,
  expectNoHorizontalOverflow,
  loadLazyContent,
  siteRoutes,
  test,
} from "./fixtures";

/*
 * Per-route smoke checks. The full set runs on chromium-desktop,
 * chromium-small (320px) and webkit-iphone; the `@layout` overflow check also
 * covers the in-between breakpoints (1024, 768) and desktop WebKit.
 */

for (const route of siteRoutes) {
  test.describe(route.path, () => {
    test("renders one h1 and one main, its title, no console errors, overflow or broken images", async ({
      page,
      consoleErrors,
      failedImages,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(route.title);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();

      await loadLazyContent(page);
      await expectNoHorizontalOverflow(page);
      await expectNoBrokenImages(page, failedImages);
      expectNoConsoleErrors(consoleErrors);
    });

    test("does not scroll horizontally", { tag: "@layout" }, async ({
      page,
    }) => {
      await page.goto(route.path);
      await loadLazyContent(page);
      await expectNoHorizontalOverflow(page);
    });
  });
}
