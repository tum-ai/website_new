import {
  expect,
  loadLazyContent,
  routeSlug,
  siteRoutes,
  test,
  visualMasks,
  waitForAnimations,
} from "./fixtures";

/*
 * Full-page screenshots of every route at 390 and 1440 px, in the
 * `visual-chromium` and `visual-webkit` projects (reduced motion, so reveals
 * and count-ups settle at their final state). Runs only with
 * `pnpm test:e2e:visual`. Baselines are Linux screenshots from the Playwright
 * Docker image (`.github/workflows/e2e-snapshots.yml`); screenshots taken on
 * other platforms stay local (e2e/.gitignore).
 */

const widths = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

for (const viewport of widths) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });

    for (const route of siteRoutes) {
      test(route.path, async ({ page }) => {
        await page.goto(route.path);
        await loadLazyContent(page);
        await waitForAnimations(page);
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(
          `${routeSlug(route.path)}-${viewport.width}.png`,
          { fullPage: true, mask: visualMasks(page) },
        );
      });
    }
  });
}
