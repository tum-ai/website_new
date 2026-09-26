import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/*
 * Keyboard access. `@keyboard` tests run on desktop Chromium and desktop
 * WebKit; `@mobile-menu` tests run where the header collapses into the menu
 * (below xl: 1024, 768 and the iPhone).
 */

/**
 * Presses Tab (Shift+Tab with `backwards`). WebKit on macOS follows Safari's
 * default of skipping links on Tab, as if "Press Tab to highlight each item"
 * were off; Option+Tab reaches every focusable element, as Tab does in
 * Chromium and in WebKit on Linux (CI).
 */
async function pressTab(page: Page, backwards = false) {
  const browser = page.context().browser()?.browserType().name();
  const option = browser === "webkit" && process.platform === "darwin";
  const key = `${option ? "Alt+" : ""}${backwards ? "Shift+" : ""}Tab`;
  await page.keyboard.press(key);
}

/** Presses Tab until `target` has focus (at most `limit` presses). */
async function tabTo(page: Page, target: Locator, limit = 40) {
  for (let presses = 0; presses < limit; presses++) {
    if (await target.evaluate((node) => node === document.activeElement)) {
      return;
    }
    await pressTab(page);
  }
  await expect(
    target,
    `reached with Tab within ${limit} presses`,
  ).toBeFocused();
}

/** True when the focused element is `container` or inside it. */
function focusIsWithin(container: Locator) {
  return container.evaluate((node) => node.contains(document.activeElement));
}

/**
 * Opens a dialog from `trigger` with the keyboard and checks the modal
 * contract: focus moves inside, Tab cannot leave it, Escape closes it, and
 * focus returns to the trigger.
 */
async function expectModalDialog(page: Page, trigger: Locator) {
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect.poll(() => focusIsWithin(dialog)).toBe(true);

  // Base UI's focus guards hold focus for a moment before wrapping it back
  // into the popup, so each step polls instead of reading focus at once.
  for (let presses = 0; presses < 12; presses++) {
    await pressTab(page);
    await expect
      .poll(() => focusIsWithin(dialog), {
        message: `focus trapped (Tab ${presses + 1})`,
      })
      .toBe(true);
  }
  await pressTab(page, true);
  await expect
    .poll(() => focusIsWithin(dialog), { message: "focus trapped (Shift+Tab)" })
    .toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
}

test.describe("skip link", { tag: "@keyboard" }, () => {
  test("is the first Tab stop and moves focus to the main content", async ({
    page,
  }) => {
    await page.goto("/events");
    await pressTab(page);

    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    // The next Tab stop lies inside the page, past the header.
    await pressTab(page);
    const header = page.locator("header").first();
    expect(await focusIsWithin(header)).toBe(false);
  });
});

test.describe("mobile menu", { tag: "@mobile-menu" }, () => {
  test("traps focus, closes on Escape and returns focus to its button", async ({
    page,
  }) => {
    await page.goto("/events");
    const open = page.getByRole("button", { name: "Open menu" });
    await expectModalDialog(page, open);
  });

  test("closes when a link is chosen", async ({ page }) => {
    await page.goto("/events");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Research" }).click();
    await expect(page).toHaveURL(/\/research$/);
    await expect(dialog).toBeHidden();
  });
});

test.describe("dialogs", { tag: "@keyboard" }, () => {
  test("event details", async ({ page }) => {
    await page.goto("/events");
    const trigger = page
      .getByRole("main")
      .getByRole("button", { name: /^Read More about / })
      .first();
    await expectModalDialog(page, trigger);
  });

  test("research project details", async ({ page }) => {
    await page.goto("/research");
    const trigger = page
      .getByRole("tabpanel", { name: "Projects" })
      .locator('button[aria-haspopup="dialog"]')
      .first();
    await expectModalDialog(page, trigger);
  });

  test("partner booking", async ({ page }) => {
    // Keep the third-party calendar out of the test.
    await page.route(/cal\.(eu|com)/, (route) => route.abort());
    await page.goto("/partners");
    const trigger = page
      .locator("#partner-contact")
      .getByRole("button", { name: "Book a call" });
    await expectModalDialog(page, trigger);
  });
});

test.describe("disclosure widgets", { tag: "@keyboard" }, () => {
  test("FAQ accordion toggles with Enter and Space", async ({ page }) => {
    await page.goto("/qanda");
    const triggers = page.getByRole("main").locator("button[aria-expanded]");
    const first = triggers.first();
    const second = triggers.nth(1);

    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");

    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    const panelId = await second.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();

    await page.keyboard.press("Space");
    await expect(second).toHaveAttribute("aria-expanded", "false");
  });

  test("research tabs follow the arrow keys", async ({ page }) => {
    await page.goto("/research");
    const projects = page.getByRole("tab", { name: "Projects" });
    const exchange = page.getByRole("tab", {
      name: "Research Exchange Program",
    });
    await expect(projects).toHaveAttribute("aria-selected", "true");

    await projects.focus();
    await page.keyboard.press("ArrowRight");
    await expect(exchange).toBeFocused();
    await expect(exchange).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("tabpanel", { name: "Research Exchange Program" }),
    ).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(projects).toBeFocused();
    await expect(projects).toHaveAttribute("aria-selected", "true");
  });

  test("event filter chips use roving focus and keep focus on Clear", async ({
    page,
  }) => {
    await page.goto("/events");
    const category = page.getByRole("group", { name: "Category" });
    const all = category.getByRole("button", { name: /^All Categories/ });
    const hackathon = category.getByRole("button", { name: /^Hackathon/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    await all.focus();
    await page.keyboard.press("ArrowRight");
    await expect(hackathon).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(hackathon).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");

    const clear = page.getByRole("button", { name: "Clear" });
    await clear.focus();
    await page.keyboard.press("Enter");
    await expect(clear).toBeHidden();
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(all).toBeFocused();
  });
});

test.describe("header navigation", { tag: "@keyboard" }, () => {
  test("reaches every main link with Tab", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 1280,
      "The inline navigation shows from xl; smaller widths use the menu.",
    );
    await page.goto("/events");
    const nav = page.getByRole("navigation", { name: "Main" });
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(7);
    await tabTo(page, links.last());
    await expect(links.last()).toBeFocused();
  });
});
