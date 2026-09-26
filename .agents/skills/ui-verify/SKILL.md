---
name: ui-verify
description: Verify a visible UI change on the TUM.ai website in real browsers before calling it done. Use after any change to a page, section, ds component, token, header, footer, dialog or animation, and whenever someone asks to check, test or screenshot the UI, compare mobile and desktop, or get PR screenshots. It runs a production build with the mock CMS, Playwright at 320/390/768/1024/1440 px in chromium and webkit, a reduced-motion and keyboard pass, and hands over a manual iPhone Safari checklist.
---

# UI verify

Type checks and unit tests don't show layout, motion or Safari chrome. Verify on a production build
(dev mode hydrates and animates differently) with deterministic CMS data, then report what you
saw, with screenshots.

## 1. Production build with mock CMS

```bash
USE_MOCK_CMS=1 pnpm build     # the mock CMS must be on at build time (prerendered pages)
USE_MOCK_CMS=1 pnpm start     # serves .next-prod on http://localhost:3000
```

Run `start` in the background and wait until `/` responds. `MOCK_CMS_NOW=<ISO date>` pins the
event dates once W1-Data lands. First run only: `pnpm exec playwright install chromium webkit`.

## 2. Automated pass

Once the E2E harness exists (coming in W1-E2E), prefer it:

```bash
pnpm test:e2e --grep "<route or feature>"   # every project: chromium widths, webkit, iPhone,
                                            # reduced motion, no-JS; axe; visual snapshots
```

Reuse the helpers in `e2e/fixtures.ts` (coming in W1-E2E) for anything ad hoc. Until then, run
the sweep in `references/sweep.md`: it screenshots each route at 320, 390, 768, 1024 and 1440 px
in chromium and webkit, with and without reduced motion, and reports horizontal overflow and
console errors.

Look at the screenshots, don't just count them. Check the changed area at every width: wrapping,
equal-width stacked actions, nested corners, alignment, contrast on each band, nothing hidden
behind the fixed header.

## 3. Reduced motion

With `reducedMotion: "reduce"` everything is visible without scrolling, marquees are static rows,
nothing loops, and no content waits for an animation.

## 4. Keyboard pass

On the changed pages, from the top of the document:

- The first Tab shows the skip link; Enter moves focus to the main content.
- Tab order follows the visual order; every stop has a visible focus ring.
- Dialogs and the mobile menu (below 1280 px) trap focus, close on Escape and return focus to the
  trigger. Accordions, tabs and filter chips work with Enter, Space and the arrow keys.
- No focus lands on hidden or off-screen content.

## 5. Report

For the PR: screenshots of the changed area at 390 and 1440 px (before and after if it's a
change), the widths and browsers you checked, and anything that differed between chromium and
webkit. Upload images to the PR; don't commit them.

## 6. Real iPhone

WebKit on Linux or macOS doesn't reproduce Safari 26's tinted status bar and toolbar. For changes
to the header, footer, dialogs, page tops or bottoms, the root background or full-height layouts,
hand the maintainer the checklist in `references/iphone-safari.md` (filled in with the routes to
check) instead of claiming it passed.
