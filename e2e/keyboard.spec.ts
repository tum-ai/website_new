import type { Locator, Page } from "@playwright/test";
import { campaignsFallback } from "@/config/campaigns";
import { eLabCohortNameOf } from "@/config/e-lab";
import { membershipConfig } from "@/config/membership";
import {
  getHeaderOptions,
  headerCtaAt,
  headerCtaSchedule,
  mainNavigation,
} from "@/config/navigation";
import { siteFactsFallback } from "@/config/site-facts";
import { expect, MOCK_CMS_NOW, test } from "./fixtures";

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

/**
 * The header CTA the server renders on `path` at the mock clock, computed
 * the way the site layout does (`headerCtaAt(headerCtaSchedule(…))`, with
 * campaigns), from the code facts the E2E build serves.
 */
function headerCtaOn(path: string) {
  const schedule = headerCtaSchedule({
    membership: membershipConfig,
    fallback: siteFactsFallback.headerCtaFallback,
    eLabCohortName: eLabCohortNameOf(siteFactsFallback.eLab.currentIteration),
    campaigns: campaignsFallback,
  });
  return getHeaderOptions(path, {
    cta: headerCtaAt(schedule, new Date(MOCK_CMS_NOW)),
  }).cta;
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

    // The first answer starts open (MissionAnswers' initial state), the rest
    // closed.
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");

    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    const panelId = await second.getAttribute("aria-controls");
    // The open state, not the height transition, which a slow renderer can
    // leave mid-way for a while.
    await expect(page.locator(`[id="${panelId}"]`)).toHaveAttribute(
      "data-open",
    );

    await page.keyboard.press("Space");
    await expect(second).toHaveAttribute("aria-expanded", "false");
  });

  test("event filter chips use roving focus", async ({ page }) => {
    await page.goto("/events");
    const category = page.getByRole("group", { name: "Category" });
    const all = category.getByRole("button", { name: /^All/ });
    const hackathons = category.getByRole("button", { name: /^Hackathons/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");

    await all.focus();
    await page.keyboard.press("ArrowRight");
    await expect(hackathons).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(hackathons).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(all).toBeFocused();
  });
});

/*
 * The header CTA per route, as the server renders it (`headerCtaOn`;
 * untagged: runs on the desktop and phone projects). A page CTA shows in the pill from `sm` and in
 * the menu everywhere; an in-page anchor stays in the pill on phones too.
 */
test.describe("header call to action", () => {
  for (const path of ["/events", "/partners"]) {
    test(path, async ({ page }) => {
      // The server renders by the mock clock, and the header keeps that
      // answer (the clock is fixed), so the expectation uses the same instant.
      const cta = headerCtaOn(path);
      test.skip(!cta, "no CTA configured for this route");
      if (!cta) return;
      await page.goto(path);

      const inPill = page.getByRole("banner").getByRole("link", {
        name: cta.label,
      });
      const phone = (page.viewportSize()?.width ?? 0) < 640;
      if (phone && !cta.href.startsWith("#")) {
        await expect(inPill).toBeHidden();
      } else {
        await expect(inPill).toBeVisible();
        await expect(inPill).toHaveAttribute("href", cta.href);
      }

      if (phone) {
        await page.getByRole("button", { name: "Open menu" }).click();
        const menuCta = page
          .getByRole("dialog", { name: "Menu" })
          .getByRole("link", { name: cta.label });
        await expect(menuCta).toHaveAttribute("href", cta.href);
      }
    });
  }
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
    await expect(links).toHaveCount(mainNavigation.length);
    await tabTo(page, links.last());
    await expect(links.last()).toBeFocused();
  });
});

test.describe("interactive figures", { tag: "@keyboard" }, () => {
  test("the research globe turns with the arrow keys", async ({ page }) => {
    await page.goto("/research");
    const globe = page.getByRole("slider", {
      name: "Globe of our research sites",
    });
    const centre = async () =>
      Number(await globe.getAttribute("aria-valuenow"));
    const start = await centre();

    await globe.focus();
    await expect(globe).toBeFocused();
    // Right raises the value: the longitude at the centre moves east.
    await page.keyboard.press("ArrowRight");
    await expect.poll(centre).toBeGreaterThan(start);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(centre).toBe(start);
    await expect(globe).toHaveAttribute("aria-valuetext", /^Centred on/);
  });

  test("the hackathon ribbon steps through the hackathons with the arrow keys", async ({
    page,
  }) => {
    await page.goto("/hackathons");
    const ribbon = page.getByRole("slider", { name: "Hackathon timeline" });
    const index = async () =>
      Number(await ribbon.getAttribute("aria-valuenow"));

    await ribbon.focus();
    await expect(ribbon).toBeFocused();
    await page.keyboard.press("Home");
    await expect(ribbon).toHaveAttribute("aria-valuetext", /GPT-3 Makeathon/);
    await page.keyboard.press("ArrowRight");
    await expect.poll(index).toBe(1);
    // The last stop is the next hackathon: the league's Grand Finale at
    // MOCK_CMS_NOW.
    await page.keyboard.press("End");
    await expect
      .poll(index)
      .toBe(Number(await ribbon.getAttribute("aria-valuemax")));
    await expect(ribbon).toHaveAttribute("aria-valuetext", /Grand Finale/);
  });

  test("the events co-host reel steps with the arrow keys", async ({
    page,
  }) => {
    await page.goto("/events");
    // The reel is a named group only with motion allowed and scripts on;
    // under reduced motion the hero is a static list.
    const reel = page.getByRole("group", { name: /^Co-hosts:/ });
    await expect(reel).toBeVisible();
    // The panel beside the reel shows the events of the name in the slot.
    const panels = page.locator("[data-host-panel]");
    const count = await panels.count();
    expect(count).toBeGreaterThan(1);
    const shown = (index: number) =>
      page.locator(`[data-host-panel="${index}"]`);
    await expect(shown(0)).toHaveAttribute("data-active", "");

    await reel.focus();
    await page.keyboard.press("ArrowDown");
    await expect(shown(1)).toHaveAttribute("data-active", "");
    await expect(shown(0)).not.toHaveAttribute("data-active");

    // Back past the first name: the reel wraps to the last.
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(shown(count - 1)).toHaveAttribute("data-active", "");
  });

  test("a focused venture in the E-Lab field opens, and closes on blur", async ({
    page,
  }) => {
    await page.goto("/e-lab");
    const ventures = page.getByRole("link", { name: /, an E-Lab venture/ });
    const first = ventures.first();
    const second = ventures.nth(1);

    await first.focus();
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("data-expanded", "true");

    // The next Tab stop is the next venture: the first closes as it opens.
    await pressTab(page);
    await expect(second).toBeFocused();
    await expect(second).toHaveAttribute("data-expanded", "true");
    await expect(first).toHaveAttribute("data-expanded", "false");
  });
});

test.describe("deep links", { tag: "@keyboard" }, () => {
  test("/qanda#member-journey opens that answer", async ({ page }) => {
    await page.goto("/qanda#member-journey");
    const question = page
      .getByRole("main")
      .getByRole("button", { name: "What does the member journey look like?" });
    await expect(question).toHaveAttribute("aria-expanded", "true");
  });
});
