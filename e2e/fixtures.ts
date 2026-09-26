/**
 * Shared Playwright helpers for the end-to-end, accessibility and visual
 * suites (`e2e/*.spec.ts`). Every helper takes a Playwright `Page`, so ad-hoc
 * verification scripts (the `ui-verify` agent skill) can reuse them outside
 * the test runner.
 *
 * Specs import `test` and `expect` from here, not from `@playwright/test`, to
 * get the `consoleErrors` and `failedImages` fixtures.
 */
import AxeBuilder from "@axe-core/playwright";
import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import axeCore, { type Result } from "axe-core";

export { expect };

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** A public page of the site shell (`src/app/(site)`). */
export type SiteRoute = {
  /** URL path, e.g. `/events`. */
  path: string;
  /** Exact `<title>` from the page metadata (`src/config/seo.ts`). */
  title: string;
  /** Pages whose content comes from the CMS (served by the mock CMS in tests). */
  cms?: boolean;
};

/**
 * Every public route. Add new pages here (the `add-page` skill does); each
 * spec that loops over `siteRoutes` then covers it automatically.
 *
 * `/design-system` (404 in production), `/studio` (separate root layout) and
 * the API routes are covered by `routing.spec.ts` instead.
 */
export const siteRoutes: readonly SiteRoute[] = [
  {
    path: "/",
    title: "TUM.ai - AI Student Initiative at Technical University of Munich",
  },
  { path: "/apply", title: "Become a Member | TUM.ai" },
  { path: "/community", title: "Community | TUM.ai" },
  { path: "/events", title: "Events | TUM.ai", cms: true },
  { path: "/e-lab", title: "Entrepreneurship | TUM.ai" },
  { path: "/partners", title: "Partners | TUM.ai", cms: true },
  { path: "/projects", title: "Task Forces and Projects | TUM.ai" },
  { path: "/qanda", title: "FAQ - Frequently Asked Questions | TUM.ai" },
  { path: "/research", title: "Research | TUM.ai", cms: true },
  { path: "/imprint", title: "Imprint - Legal Information | TUM.ai" },
  { path: "/data-privacy", title: "Data Privacy Policy | TUM.ai" },
  { path: "/disclaimer", title: "Disclaimer | TUM.ai" },
];

/**
 * The instant the mock CMS treats as "now" (`MOCK_CMS_NOW`, set on the web
 * server in `playwright.config.ts`). Pin the browser clock to it with
 * `page.clock.setFixedTime(MOCK_CMS_NOW)` when a test needs server and
 * browser to agree on dates (e.g. the events upcoming/past split).
 */
export const MOCK_CMS_NOW = "2026-10-01T12:00:00Z";

// ---------------------------------------------------------------------------
// Console errors
// ---------------------------------------------------------------------------

/** A console message that is known noise, with the reason it is ignored. */
export type ConsoleAllowance = { pattern: RegExp; reason: string };

/**
 * Console errors that are not the site's fault. Keep this list short and give
 * every entry a reason; anything else fails `expectNoConsoleErrors`.
 */
export const consoleAllowlist: readonly ConsoleAllowance[] = [
  {
    // The booking dialog loads Cal.eu's embed from a third-party origin;
    // tests block it (see partners.spec.ts), and its own iframe logs.
    pattern: /cal\.(eu|com)/i,
    reason: "Cal.eu embed (third party, blocked or offline in tests)",
  },
];

/** Live list of console errors and uncaught page errors. */
export type ConsoleErrorLog = {
  /** Messages collected so far, allowlisted noise excluded. */
  readonly messages: string[];
};

/**
 * Starts collecting `console.error` output and uncaught exceptions (including
 * React hydration errors) from `page`. Call it before `page.goto`.
 */
export function collectConsoleErrors(
  page: Page,
  allowlist: readonly ConsoleAllowance[] = consoleAllowlist,
): ConsoleErrorLog {
  const messages: string[] = [];
  const allowed = (text: string) =>
    allowlist.some(({ pattern }) => pattern.test(text));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location().url;
    const text = location ? `${message.text()} (${location})` : message.text();
    if (!allowed(text)) messages.push(text);
  });
  page.on("pageerror", (error) => {
    const text = `Uncaught ${error.name}: ${error.message}`;
    if (!allowed(text)) messages.push(text);
  });
  return { messages };
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/** Live list of image requests that failed or returned an error status. */
export type FailedImageLog = { readonly urls: string[] };

/**
 * Starts recording image requests that fail (network error) or return 4xx/5xx.
 * Catches images that a component swaps for a fallback `onError`, which the
 * DOM check in `expectNoBrokenImages` can no longer see. Call before `goto`.
 */
export function collectFailedImages(page: Page): FailedImageLog {
  const urls: string[] = [];
  page.on("response", (response) => {
    if (
      response.request().resourceType() === "image" &&
      response.status() >= 400
    ) {
      urls.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.resourceType() !== "image") return;
    const reason = request.failure()?.errorText ?? "failed";
    // Aborted loads (navigation, lazy images replaced mid-flight) are not broken images.
    if (/abort|cancel/i.test(reason)) return;
    urls.push(`${reason} ${request.url()}`);
  });
  return { urls };
}

/**
 * Scrolls through the whole page, one viewport at a time, so lazy images,
 * scroll reveals and deferred sections load; then waits for the network to
 * settle and returns to the top. Use it before full-page checks.
 */
export async function loadLazyContent(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.75, 200);
    // A frame, or 100 ms when a busy renderer (WebKit on CI) delays frames.
    const frame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => resolve(null));
        setTimeout(resolve, 100);
      });
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      // Two frames: IntersectionObserver callbacks run after layout.
      await frame();
      await frame();
    }
    window.scrollTo({ top: document.documentElement.scrollHeight });
    await frame();
  });
  // Link prefetching can keep the network busy; settle briefly, then move on.
  await page
    .waitForLoadState("networkidle", { timeout: 5000 })
    .catch(() => undefined);
  await page.evaluate(async () => {
    // Wait for every image that has started loading (lazy ones included).
    const pending = [...document.images].filter(
      (image) => image.currentSrc && !image.complete,
    );
    await Promise.race([
      Promise.all(
        pending.map(
          (image) =>
            new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
        ),
      ),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

/**
 * Asserts that no `<img>` on the page failed to decode: every image that has
 * finished loading has a non-zero `naturalWidth`. Images that never started
 * (lazy and off screen, or in hidden breakpoint variants) are skipped, so call
 * `loadLazyContent` first to cover the whole page. Pass the `failedImages`
 * fixture to also fail on image requests that errored.
 */
export async function expectNoBrokenImages(
  page: Page,
  failedImages?: FailedImageLog,
): Promise<void> {
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter(
        (image) => image.complete && image.currentSrc && !image.naturalWidth,
      )
      .map((image) => image.currentSrc),
  );
  expect(
    [...broken, ...(failedImages?.urls ?? [])],
    "broken images (naturalWidth 0 or failed request)",
  ).toEqual([]);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Asserts the page does not scroll horizontally (`scrollWidth <= clientWidth`
 * on the root element). On failure the message names the elements that reach
 * furthest past the right edge.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const viewport = root.clientWidth;
    const offenders = [...document.body.querySelectorAll<HTMLElement>("*")]
      .map((element) => ({
        element,
        right: element.getBoundingClientRect().right,
      }))
      .filter(({ right }) => right > viewport + 1)
      .sort((a, b) => b.right - a.right)
      .slice(0, 5)
      .map(({ element, right }) => {
        const id = element.id ? `#${element.id}` : "";
        const classes =
          typeof element.className === "string"
            ? `.${element.className.trim().split(/\s+/).slice(0, 4).join(".")}`
            : "";
        return `${element.tagName.toLowerCase()}${id}${classes} (right: ${Math.round(right)}px)`;
      });
    return { scrollWidth: root.scrollWidth, clientWidth: viewport, offenders };
  });
  expect(
    result.scrollWidth,
    `horizontal overflow: scrollWidth ${result.scrollWidth} > clientWidth ${result.clientWidth}. Widest elements:\n${result.offenders.join("\n")}`,
  ).toBeLessThanOrEqual(result.clientWidth);
}

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

/** WCAG 2.0, 2.1 and 2.2 level A and AA rules. */
export const wcagTags = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

/** Impacts that fail the suite; minor and moderate findings are reported only. */
export const blockingImpacts = ["serious", "critical"] as const;

/**
 * Decorative overlays hidden while axe runs. axe-core 4.13 wrongly flattens
 * `mix-blend-mode` layers: the 7%-opacity soft-light `.grain` noise that sits
 * *behind* a white button on an ink band made axe report the button's
 * background as #4f0088 (contrast 1.47) although it renders white. Hiding the
 * texture changes real contrast by well under 1%.
 */
export const axeHiddenOverlays = [".grain"] as const;

export type A11yOptions = {
  /** CSS selectors to exclude from the scan (e.g. third-party iframes). */
  exclude?: string[];
  /** Scan only these selectors (default: the whole document). */
  include?: string[];
  /** Rule ids to skip, e.g. known failures tracked as `test.fixme`. */
  disableRules?: string[];
  /** Run only these rule ids (used by the known-failure fixmes). */
  onlyRules?: string[];
};

/**
 * Runs axe-core with the WCAG 2 A/AA rule set and returns the serious and
 * critical violations. Finish animations first (`waitForAnimations`), or
 * colour-contrast may measure text mid-fade.
 */
export async function findA11yViolations(
  page: Page,
  options: A11yOptions = {},
): Promise<Result[]> {
  let builder = new AxeBuilder({ page }).withTags([...wcagTags]);
  if (options.onlyRules) builder = builder.withRules(options.onlyRules);
  for (const selector of options.include ?? []) {
    builder = builder.include(selector);
  }
  for (const selector of options.exclude ?? []) {
    builder = builder.exclude(selector);
  }
  if (options.disableRules?.length) {
    builder = builder.disableRules(options.disableRules);
  }
  const hide = axeHiddenOverlays.join(",");
  await page.evaluate((selector) => {
    for (const node of document.querySelectorAll<HTMLElement>(selector)) {
      node.dataset.axeHidden = node.style.display;
      node.style.display = "none";
    }
  }, hide);
  const { violations } = await builder.analyze().finally(() =>
    page.evaluate((selector) => {
      for (const node of document.querySelectorAll<HTMLElement>(selector)) {
        node.style.display = node.dataset.axeHidden ?? "";
        delete node.dataset.axeHidden;
      }
    }, hide),
  );
  return violations.filter((violation) =>
    (blockingImpacts as readonly string[]).includes(violation.impact ?? ""),
  );
}

/** One line per violation and node: rule, impact, help, target, HTML. */
export function formatViolations(violations: Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 8)
        .map(
          (node) =>
            `    ${node.target.join(" ")}\n      ${node.html.slice(0, 200)}`,
        )
        .join("\n");
      const more =
        violation.nodes.length > 8
          ? `\n    …and ${violation.nodes.length - 8} more`
          : "";
      return `${violation.id} (${violation.impact}): ${violation.help}\n  ${violation.helpUrl}\n${nodes}${more}`;
    })
    .join("\n\n");
}

/**
 * Links that open a new tab (`target="_blank"`) but whose accessible name
 * and description never say so (WCAG G201; not an axe rule). Links hidden
 * from assistive tech (inert or `aria-hidden` copies) are skipped. Returns
 * one `"name" -> href` line per offender.
 */
export async function findUnannouncedNewTabLinks(
  page: Page,
): Promise<string[]> {
  await page.addScriptTag({ content: axeCore.source });
  return page.evaluate(() => {
    const { axe } = window as unknown as {
      axe: {
        setup: (root: Document) => void;
        teardown: () => void;
        commons: { text: { accessibleText: (element: Element) => string } };
      };
    };
    axe.setup(document);
    try {
      return [
        ...document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
      ]
        .filter((link) => !link.closest('[aria-hidden="true"], [inert]'))
        .map((link) => {
          const name = axe.commons.text.accessibleText(link);
          const description = (link.getAttribute("aria-describedby") ?? "")
            .split(/\s+/)
            .map((id) => (id ? document.getElementById(id)?.textContent : ""))
            .join(" ");
          return { link, name, text: `${name} ${description}` };
        })
        .filter(({ text }) => !/new (tab|window)/i.test(text))
        .map(({ link, name }) => `"${name.trim()}" -> ${link.href}`);
    } finally {
      axe.teardown();
    }
  });
}

/** Asserts axe finds no serious or critical WCAG 2 A/AA violations. */
export async function expectNoA11yViolations(
  page: Page,
  options: A11yOptions = {},
): Promise<void> {
  const violations = await findA11yViolations(page, options);
  const summary = violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}) on ${violation.nodes.length} node(s)`,
  );
  expect(summary, formatViolations(violations)).toEqual([]);
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/**
 * Emulates `prefers-reduced-motion: reduce` for the rest of the test. The
 * `reduced-motion` project sets it for the whole context instead.
 */
export async function emulateReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

/**
 * Waits until every finite CSS animation and transition on the page has
 * finished (infinite ones, like marquees, are ignored). Capped at `timeout`.
 */
export async function waitForAnimations(
  page: Page,
  timeout = 5000,
): Promise<void> {
  await page.evaluate(async (limit) => {
    const finite = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().iterations !== Infinity,
      );
    await Promise.race([
      Promise.all(
        finite.map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, limit)),
    ]);
  }, timeout);
}

/** A running Web Animation (CSS animation or transition) and its target. */
export type RunningAnimation = {
  name: string;
  target: string;
  infinite: boolean;
};

/**
 * Lists the animations and transitions currently running inside `scope`
 * (default: the whole document). Under reduced motion, marquees and other
 * infinite loops must not appear here.
 */
export async function getRunningAnimations(
  page: Page,
  scope: Locator = page.locator(":root"),
): Promise<RunningAnimation[]> {
  return scope.evaluate((root) =>
    root
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running")
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        const name =
          "animationName" in animation
            ? String(animation.animationName)
            : "transitionProperty" in animation
              ? `transition:${String(animation.transitionProperty)}`
              : animation.id || "animation";
        const classes =
          target && typeof target.className === "string" && target.className
            ? `.${target.className.trim().split(/\s+/).slice(0, 3).join(".")}`
            : "";
        return {
          name,
          target: target
            ? `${target.tagName.toLowerCase()}${classes}`
            : "unknown",
          infinite:
            animation.effect?.getComputedTiming().iterations === Infinity,
        };
      }),
  );
}

/**
 * Asserts that the page's content renders visibly without scripts or motion:
 * no scroll reveal is still pending, and every `h1`/`h2` inside `main` is
 * laid out with an effective opacity (its own times every ancestor's) of at
 * least 0.9. On failure the message lists the hidden headings.
 */
export async function expectContentVisible(page: Page): Promise<void> {
  const result = await page.evaluate(() => {
    const effectiveOpacity = (element: Element) => {
      let opacity = 1;
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        const style = getComputedStyle(node);
        if (style.visibility === "hidden" || style.display === "none") return 0;
        opacity *= Number(style.opacity);
      }
      return opacity;
    };
    const hidden = [
      ...document.querySelectorAll<HTMLElement>("main h1, main h2"),
    ]
      .filter((heading) => !heading.closest("[hidden], .sr-only, [inert]"))
      .filter((heading) => {
        const box = heading.getBoundingClientRect();
        return !box.width || !box.height || effectiveOpacity(heading) < 0.9;
      })
      .map((heading) => heading.textContent?.trim().slice(0, 60) ?? "");
    const pending = document.querySelectorAll('[data-reveal="pending"]').length;
    return { hidden, pending };
  });
  expect(result.hidden, "hidden headings in main").toEqual([]);
  expect(result.pending, "scroll reveals still hidden").toBe(0);
}

// ---------------------------------------------------------------------------
// Visual regression
// ---------------------------------------------------------------------------

/**
 * Regions whose pixels change between runs even with animations disabled:
 * marquee rails (scroll position), the home hero photo mosaic, the rotating
 * partner logo grids, and count-up figures. `toHaveScreenshot` paints them
 * over with a solid box.
 */
export const visualMaskSelectors = [
  '[class~="group/marquee"]',
  ".home-mosaic",
  "[data-rotating]",
  ".tabular:has(> [aria-hidden] + .sr-only)",
] as const;

/** Locators for `toHaveScreenshot({ mask })`, see `visualMaskSelectors`. */
export function visualMasks(page: Page): Locator[] {
  return visualMaskSelectors.map((selector) => page.locator(selector));
}

/** File-name slug for a route path: `/` → `home`, `/e-lab` → `e-lab`. */
export function routeSlug(path: string): string {
  return path === "/" ? "home" : path.replace(/^\//, "").replaceAll("/", "-");
}

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

/**
 * `test` with two opt-in collectors, attached before the test body runs:
 *
 * - `consoleErrors`: `console.error` output and uncaught page errors.
 * - `failedImages`: image requests that errored or returned 4xx/5xx.
 */
export const test = base.extend<{
  consoleErrors: ConsoleErrorLog;
  failedImages: FailedImageLog;
}>({
  consoleErrors: async ({ page }, use) => {
    await use(collectConsoleErrors(page));
  },
  failedImages: async ({ page }, use) => {
    await use(collectFailedImages(page));
  },
});

/** Asserts that the collector saw no console or page errors. */
export function expectNoConsoleErrors(log: ConsoleErrorLog): void {
  expect(log.messages, "console errors").toEqual([]);
}
