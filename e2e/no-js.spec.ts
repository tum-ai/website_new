import {
  expect,
  expectContentVisible,
  siteRoutes,
  test,
  waitForAnimations,
} from "./fixtures";

/*
 * JavaScript disabled (the `no-js` project): the server HTML alone shows
 * every page's content. Scroll reveals, count-ups and client islands are
 * progressive enhancements, so nothing may start hidden waiting for them.
 */

for (const route of siteRoutes) {
  test(`${route.path} shows its content without JavaScript`, async ({
    page,
  }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator("h1")).toBeVisible();
    // Scroll through so below-the-fold layout is measured, as a reader would.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // CSS entrance animations still run without scripts; let them finish.
    await waitForAnimations(page);
    await expectContentVisible(page);
  });
}
