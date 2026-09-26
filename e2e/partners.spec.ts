import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * /partners flows, on desktop Chromium and iPhone WebKit: in-page anchors
 * clear the fixed header, the partnership finder walks through its steps,
 * and the booking dialog always offers a way out when the calendar embed
 * cannot load.
 */

/** Scroll margin of every /partners anchor target (clears the header pill). */
const ANCHOR_OFFSET = 110;

/** Blocks the third-party Cal.eu embed so tests never depend on it. */
async function blockCalendar(page: Page) {
  await page.route(/cal\.(eu|com)/, (route) => route.abort());
}

/** Waits until the page stops scrolling, then returns `target`'s top edge. */
async function settledTop(page: Page, target: Locator): Promise<number> {
  let previous = Number.NaN;
  await expect
    .poll(
      async () => {
        const current = await page.evaluate(() => window.scrollY);
        const settled = current === previous;
        previous = current;
        return settled;
      },
      { intervals: [150] },
    )
    .toBe(true);
  return target.evaluate((node) => node.getBoundingClientRect().top);
}

test.describe("anchors", () => {
  for (const id of ["find-your-fit", "our-partners", "partner-contact"]) {
    test(`#${id} lands ${ANCHOR_OFFSET}px below the top`, async ({ page }) => {
      await page.goto("/partners");
      const target = page.locator(`#${id}`);
      await page.evaluate((hash) => {
        window.location.hash = hash;
      }, id);

      const top = await settledTop(page, target);
      const atBottom = await page.evaluate(
        () =>
          Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight - 1,
      );
      if (atBottom) {
        // The last section may be too short to scroll all the way up.
        expect(top).toBeGreaterThanOrEqual(ANCHOR_OFFSET - 2);
      } else {
        expect(Math.abs(top - ANCHOR_OFFSET)).toBeLessThanOrEqual(2);
      }
    });
  }

  test("the hero link scrolls to the finder", async ({ page }) => {
    await page.goto("/partners");
    await page
      .getByRole("main")
      .locator('a[href="#find-your-fit"]')
      .first()
      .click();
    await expect(page).toHaveURL(/#find-your-fit$/);
    const top = await settledTop(page, page.locator("#find-your-fit"));
    expect(Math.abs(top - ANCHOR_OFFSET)).toBeLessThanOrEqual(2);
  });
});

test.describe("partnership finder", () => {
  test("recommends a partnership in two steps, with back and restart", async ({
    page,
  }) => {
    await page.goto("/partners");
    const finder = page.locator("#find-your-fit");
    const heading = finder.locator("h3");
    await expect(heading).toHaveText("What matters most to you right now?");

    await finder.getByRole("button", { name: /Hiring top AI talent/ }).click();
    await expect(heading).toHaveText(/one-off activation or an ongoing/);
    await expect(heading).toBeFocused();

    await finder.getByRole("button", { name: "Back" }).click();
    await expect(heading).toHaveText("What matters most to you right now?");
    await expect(heading).toBeFocused();

    await finder.getByRole("button", { name: /Hiring top AI talent/ }).click();
    await finder
      .getByRole("button", { name: /An ongoing, strategic relationship/ })
      .click();
    await expect(heading).toHaveText(/is a good fit\.$/);
    await expect(heading).toBeFocused();
    await expect(finder.locator('[aria-current="step"]')).toContainText(
      "Your fit",
    );

    // The email carries the finder answers as context.
    const email = finder.getByRole("link", { name: "Request via email" });
    await expect(email).toHaveAttribute("href", /^mailto:/);
    const href = decodeURIComponent((await email.getAttribute("href")) ?? "");
    expect(href).toMatch(/talent/i);

    await finder.getByRole("button", { name: "Start again" }).click();
    await expect(heading).toHaveText("What matters most to you right now?");
  });
});

test.describe("booking dialog", () => {
  test("offers the booking page and email when the calendar fails", async ({
    page,
  }) => {
    await blockCalendar(page);
    await page.goto("/partners");
    await page
      .locator("#partner-contact")
      .getByRole("button", { name: "Book a call" })
      .click();

    const dialog = page.getByRole("dialog", {
      name: "Let’s talk about your partnership.",
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: /Open booking page/ }),
    ).toHaveAttribute("href", /^https:\/\/cal\.(eu|com)\//);
    await expect(
      dialog.getByRole("link", { name: "Email us instead" }),
    ).toHaveAttribute("href", /^mailto:/);

    // The embed never reports ready, so the status turns into the fallback.
    await expect(dialog.getByRole("status")).toHaveText(
      /Open the booking page below, or email us/,
      { timeout: 20_000 },
    );

    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).toBeHidden();
  });
});
