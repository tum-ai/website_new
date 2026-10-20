import { expect, test } from "./fixtures";

/*
 * Routes outside the public site shell. Runs on desktop Chromium against the
 * production build, where the design-system showcase is disabled.
 */

test("/design-system returns 404 in a production build", async ({ page }) => {
  const response = await page.goto("/design-system");
  expect(response?.status()).toBe(404);
});

test("an unknown path returns 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
});

test("/studio renders without the site header, footer or skip link", async ({
  page,
}) => {
  const response = await page.goto("/studio");
  expect(response?.status()).toBe(200);
  await expect(page.locator("#app-root")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
});
