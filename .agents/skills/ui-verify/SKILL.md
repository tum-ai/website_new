---
name: ui-verify
description: Verify a visible UI change on the TUM.ai website before calling it done. Use after any change to a page, section, ds component, token, header, footer, dialog or animation, and whenever someone asks to check, test or screenshot the UI, compare mobile and desktop, or get PR screenshots. It reads the PR's CI results (E2E in chromium and webkit, reduced motion, no-JS, axe, visual baselines), accepts intended visual diffs through the update-snapshots label, and hands over a manual iPhone Safari checklist.
---

# UI verify

Type checks and unit tests don't show layout, motion or Safari chrome. The PR's CI renders every
route in real browsers on a production build with the mock CMS; read what it found, accept the
intended diffs, and report what you saw.

## 1. Where it runs

Agents run only `pnpm lint`, `pnpm typecheck` and targeted `pnpm exec vitest run <files>` locally.
Builds, E2E and the visual comparison run in the PR's CI. People may also run them locally (see
section 5).

After pushing, poll `gh pr checks <number>` every 30 to 60 seconds (never block on `--watch`).
The relevant jobs:

- **E2E (1/3, 2/3, 3/3):** every route at 1440, 1024, 768, 390 and 320 px in Chromium, WebKit at
  1440, reduced motion and no-JS: one `h1` and `main`, no console errors, overflow or broken
  images, axe (WCAG 2 A/AA), keyboard (skip link, menu, dialogs, accordion, chips).
  The merged HTML report with traces is the `playwright-report` artifact of **E2E report**.
- **Visual:** full-page screenshots of every route at 390 and 1440 px in Chromium and WebKit,
  compared with the Linux baselines in `e2e/__screenshots__/linux/`.

Read a failure with `gh run view --job <job id> --log-failed`.

## 2. Visual diffs

1. Look at the diffs, don't just count them. Either compare baseline PNG files from git
   (`git show "origin/<base>:e2e/__screenshots__/linux/visual-webkit/<route>-390.png" > before.png`)
   or download the `visual-report-1`/`-2` artifacts, one per shard (large; they can stall).
2. Every diff must be intended: wrapping, stacked actions, nested corners, alignment, contrast on
   each band, nothing hidden behind the fixed header. Layout breaks, lost content or unlisted copy
   changes are regressions; fix them.
3. Accept intended diffs: `gh pr edit <number> --add-label update-snapshots`. The workflow
   captures in the Playwright container with `--update-snapshots=changed`, commits only the
   changed PNG files as `github-actions[bot]`, and removes the label. Never commit screenshots taken
   on your machine.
4. The bot's commit starts no CI. The next regular push runs it against the new baselines.
5. Check the bot touched only your routes; restore any other PNG from the base branch in a
   `[skip ci]` commit.
6. List each diff in the PR's Visual changes table: route, what changed, cause.

Screenshots hide photos, video and film grain (`e2e/visual-screenshot.css`) and mask moving
regions, so they show layout, not image content. Known flakes are listed in `docs/testing.md`.

## 3. Reduced motion and keyboard

CI's `reduced-motion`, `no-js` and `@keyboard` projects cover the shared behaviour. For a new
interaction, add to `e2e/keyboard.spec.ts` or `e2e/motion.spec.ts` rather than checking by hand.
What they must hold:

- Under reduced motion everything is visible without scrolling, the partner marquee is a static row,
  nothing loops, and no content waits for an animation.
- The first Tab shows the skip link; Enter moves focus to the main content.
- Tab order follows the visual order; every stop has a visible focus ring.
- Dialogs and the mobile menu (below 1280 px) trap focus, close on Escape and return focus to the
  trigger. Accordions and filter chips work with Enter, Space and the arrow keys.

## 4. Report

For the PR: the CI jobs and their state, the Visual changes table, and screenshots of the changed
area at 390 and 1440 px (before and after for a change; upload them to the PR, don't commit them).
The Vercel preview of the PR is the easiest place to take them.

## 5. Running it locally (people, or when asked)

```bash
USE_MOCK_CMS=1 pnpm build     # the mock CMS is read at build time
USE_MOCK_CMS=1 pnpm start     # serves .next-prod on http://localhost:3000
pnpm test:e2e --grep "<route or feature>"   # reuses the running server
```

First run only: `pnpm exec playwright install chromium webkit`. Playwright pins
`MOCK_CMS_NOW=2026-10-01T12:00:00Z` when it starts the server itself; set it on `build` too when
you start the server by hand. For ad hoc screenshots at more widths, `references/sweep.md` has a
standalone script. macOS screenshots differ from the Linux baselines; don't commit them.

## 6. Real iPhone

WebKit on Linux or macOS doesn't reproduce Safari 26's tinted status bar and toolbar. For changes
to the header, footer, dialogs, page tops or bottoms, the root background or full-height layouts,
hand the maintainer the checklist in `references/iphone-safari.md` (filled in with the routes to
check) instead of claiming it passed. The workarounds it checks are in `docs/browser-quirks.md`.
