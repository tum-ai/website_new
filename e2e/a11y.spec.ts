import {
  expect,
  expectNoA11yViolations,
  findA11yViolations,
  findUnannouncedNewTabLinks,
  formatViolations,
  loadLazyContent,
  siteRoutes,
  test,
  waitForAnimations,
} from "./fixtures";

/**
 * Current violations, per route and check, tracked as `test.fixme` until the
 * owning Wave 2 stream fixes them (it removes the entry and the test runs).
 */
const knownIssues: Record<
  string,
  Partial<Record<"axe" | "newTab" | "labelInName", string>>
> = {
  "/e-lab": {
    labelInName:
      "Home+E-Lab: the ApplicationCta links' aria-label (Apply for E-Lab 6.0) drops their visible label.",
  },
  "/partners": {
    newTab:
      "Partners: partner logo tiles (Visit <partner>) open a new tab without saying so.",
  },
};

/*
 * axe-core (WCAG 2 A/AA) on every route, desktop Chromium and iPhone WebKit.
 * Serious and critical violations fail. The page is scrolled through first so
 * scroll reveals and deferred sections are in their final state.
 */

for (const route of siteRoutes) {
  test.describe(route.path, () => {
    const issues = knownIssues[route.path] ?? {};

    test("has no serious or critical axe violations", async ({ page }) => {
      test.fixme(Boolean(issues.axe), issues.axe);
      await page.goto(route.path);
      await loadLazyContent(page);
      await waitForAnimations(page);
      await expectNoA11yViolations(page);
    });

    test("announces links that open a new tab", async ({ page }) => {
      test.fixme(Boolean(issues.newTab), issues.newTab);
      await page.goto(route.path);
      await loadLazyContent(page);
      expect(await findUnannouncedNewTabLinks(page)).toEqual([]);
    });

    test("keeps visible labels in accessible names (WCAG 2.5.3)", async ({
      page,
    }) => {
      test.fixme(Boolean(issues.labelInName), issues.labelInName);
      await page.goto(route.path);
      await loadLazyContent(page);
      // Experimental in axe, so outside the WCAG tag set above.
      const violations = await findA11yViolations(page, {
        onlyRules: ["label-content-name-mismatch"],
      });
      expect(
        violations.flatMap((v) => v.nodes.map((n) => n.html.slice(0, 120))),
        formatViolations(violations),
      ).toEqual([]);
    });
  });
}
