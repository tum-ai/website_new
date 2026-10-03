# Testing

The test layers, what each kind of change needs, where tests run, and how visual baselines are
updated. The CI jobs themselves are described in [github-actions.md](github-actions.md); why the
runners were chosen is in [ADR 0004](adr/0004-vitest-and-playwright.md).

## Where tests run

**CI on the pull request is the gate.** Every push to a PR runs lint, typecheck, unit tests with
coverage thresholds, the production build with the homepage budget, four E2E shards, the visual
comparison (two shards) and knip (see [github-actions.md](github-actions.md)).

**Coding agents run only `pnpm lint`, `pnpm typecheck` and targeted Vitest locally**: while
writing tests, `pnpm exec vitest run <files you touched>`. The full unit suite, `pnpm build`,
`pnpm verify`, E2E and visual checks run remotely in the PR's CI. To fix a failure, read the
failed job's log (`gh run view --job <id> --log-failed`), batch the fixes, and push once. Never
close and reopen a PR to re-run CI.

People can run any suite locally when it helps; the commands are below.

**Knip locally:** run `CI=1 pnpm knip`. Knip's lefthook plugin counts the `lefthook` dependency as
used only when `CI` is set or it finds installed git hooks, so a plain `pnpm knip` in a git
worktree (or a clone whose hooks aren't installed) reports `lefthook` as unused. CI sets `CI`.

## Layers

| Layer | Files | Command | Environment |
| --- | --- | --- | --- |
| Unit | `src/**/*.test.ts`, `test/*.test.ts` | `pnpm test` | Vitest `node` project |
| Component | `src/**/*.test.tsx`, `test/*.test.tsx` | `pnpm test` | Vitest `jsdom` project: Testing Library, user-event, jest-dom, axe |
| Architecture | `src/architecture.test.ts` | `pnpm test` | parses the import graph |
| Repo fitness | `test/content-facts.test.ts`, `public-assets`, `favicon`, `next-config`, `sanity-preview`, `workspace-scripts` | `pnpm test` | node |
| Homepage budget | `test/perf/homepage.perf.ts` | `pnpm build && pnpm test:perf` | reads `.next-prod` |
| E2E | `e2e/*.spec.ts` except `visual` | `pnpm test:e2e` | Playwright, chromium and webkit |
| Visual | `e2e/visual.spec.ts` | `pnpm test:e2e:visual` | Playwright `visual-chromium`, `visual-webkit` |

Coverage: `pnpm test:coverage` writes `coverage/` (v8; `src/**` without tests, `src/sanity/**` and
`src/app/studio/**`). CI uploads it as an artifact. The run fails below these line-coverage
thresholds (`vitest.config.ts`): `src/lib/**` and `src/features/**/*.ts` 90 %.
Shared primitive coverage is owned by the UI kit.

### Vitest

`vitest.config.ts` defines two projects. `*.test.ts` runs in node, `*.test.tsx` in jsdom with
`vitest.setup.ts` (jest-dom matchers and the axe matcher). The `@/` and `@test/` aliases work in
both, and `server-only` is replaced by a stub (`vitest.aliases.ts`, shared with
`vitest.perf.config.ts`), so `lib/sanity.ts` can be imported; mock
`next/headers`, `next/navigation` and `next-sanity` with `vi.mock`.

```tsx
import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
const { container } = render(<Thing />);
await user.click(screen.getByRole("button", { name: "Open" }));
expect(await axe(container)).toHaveNoViolations();
```

`@test/axe` wraps axe-core with a typed matcher (`vitest-axe` doesn't type-check with Vitest 5).
jsdom can't compute contrast or regions, so `color-contrast` and `region` are off there;
Playwright's axe run covers them on real pages.

`pnpm test` never builds the app. Anything that needs build output goes in `test/perf/` and runs
with `pnpm test:perf` after `pnpm build`.

**Content slices under the mock CMS.** A slice's tests stub `CMS_CONTENT_SOURCE` and
`USE_MOCK_CMS=1`; `fetchContent` then imports `lib/cms-content-mock` dynamically and queries the
backfill documents with groq-js. A test that edits those documents with
`vi.mock("@/lib/cms-content-mock", ...)` must call one getter at a time, never several loads
concurrently (`Promise.all`, or a getter that runs several `loadContent` calls at once): Vitest
resolves only the first of several concurrent dynamic imports of a mocked module to the mock,
and the others to the real module, so their edits silently don't apply (checked with Vitest
5.0.2: two concurrent `fetchContent` calls return the mock's value and the real module's). This
is a Vitest artefact, not a bug in the loader: without `vi.mock` every concurrent import gets the
same module, as in Node and Next, and whole pages render identically in both sources
(`lib/community-content.test.ts` and the Q&A slice's tests show the pattern).

### Playwright

`playwright.config.ts` builds and starts the production app with `USE_MOCK_CMS=1` and
`MOCK_CMS_NOW=2026-10-01T12:00:00Z`, so CMS pages show the same fixtures and dates on every run.
Locally it reuses a server already running on `PORT` (default 3000).

| Project | Browser and viewport | Specs |
| --- | --- | --- |
| `chromium-desktop` | Chromium 1440×900 | routes, a11y, keyboard, partners, routing |
| `chromium-laptop`, `chromium-tablet` | Chromium 1024×768, 768×1024 | layout and mobile-menu tags |
| `chromium-small` | Chromium 320×640 | routes |
| `chromium-phone` | Chromium 390×844, touch | routes, a11y, keyboard, partners |
| `webkit-desktop` | WebKit 1440×900 | layout and keyboard tags |
| `webkit-iphone` | WebKit iPhone 15 | local only; CI needs `E2E_WEBKIT_MOBILE=1` (see known flakes) |
| `reduced-motion` | Chromium, reduced motion | motion |
| `no-js` | Chromium, JavaScript off | no-js |
| `visual-chromium`, `visual-webkit` | reduced motion, 390 and 1440 wide | visual (only with `E2E_VISUAL=1`) |

What the specs check:

- `routes`: one `h1` and one `main`, the title, no console errors, no horizontal overflow, no
  broken images; `@layout` runs the overflow check at every width.
- `a11y`: axe (WCAG 2 A/AA, serious and critical fail), new-tab links announce themselves, and
  accessible names contain the visible label.
- `keyboard`: skip link, mobile menu focus trap, Escape and focus return, dialogs, accordion,
  filter chips, header CTA, header navigation.
- `motion`: under reduced motion every section is visible and nothing is pending or looping.
- `no-js`: content is visible without JavaScript.
- `partners`: anchors land below the header, the finder flow, the booking fallback.
- `routing`: `/design-system` and unknown paths return 404 in production; `/studio` has no site
  shell.
- `visual`: a full-page screenshot per route at 390 and 1440 px.

Use the helpers in `e2e/fixtures.ts` (route list, console and image collectors, lazy-content
scrolling, axe, animation waits, visual masks) instead of writing new ones. `siteRoutes` there is
the route list every spec loops over; a new page is added to it.

Known failures are marked `test.fixme` with the owner in a comment, never deleted. `a11y.spec.ts`
keeps them in `knownIssues`; the list is empty today.

## What to test per change

| Change | Test |
| --- | --- |
| Logic in `lib/`, `config/`, `features/**/*.ts` | unit test next to the file (`*.test.ts`) |
| Interactive UI: islands, app adapters | component test (`*.test.tsx`) with role queries, user-event and `axe()` |
| UI kit upgrade or app adapter change | app integration test, showcase coverage against installed exports, versioned API links; primitive tests stay upstream |
| Site facts | `content-facts` and `e-lab-content` stay green without editing them; expectations derive from config |
| CMS schema or query | a groq-js case in `src/lib/sanity-queries.test.ts`, fixtures in `mock-cms.ts` |
| New route or user flow | the route in `siteRoutes` (`e2e/fixtures.ts`), a spec for the flow, and a visual baseline |
| Visible UI change | intended visual diffs accepted with the `update-snapshots` label (below) and listed in the PR |
| Homepage markup or images | the homepage budget (`test:perf`) in CI's Build job |
| New folder or import path | `src/architecture.test.ts` passes without new exceptions |
| A content slice or a page reading one | the slice's parity test (code and mock `sanity` sources equal); `test/cms-backfill.test.ts`; `src/architecture.test.ts` (no client island reaches `server-only`) |

Test behaviour, not source text: no reading source files to grep for strings, and no
change-detector assertions on literals. A documented config edit (a new deadline, a new cohort)
must keep every test green.

## Visual baselines

Baselines are Linux screenshots in `e2e/__screenshots__/linux/visual-{chromium,webkit}/`, one
per route at 390 and 1440 px (48 PNG files). They are captured and compared only in the official
Playwright image `mcr.microsoft.com/playwright:v1.63.0-noble`, so fonts and rendering match.
Screenshots taken on macOS differ and are never committed (`e2e/.gitignore`).

While capturing, `e2e/visual-screenshot.css` hides photos, video and the film grain but keeps
their boxes, and the spec masks moving regions (rotating partner grids, count-ups).
The screenshots test layout, not image content. A screenshot may differ from its baseline in at
most 100 pixels (`maxDiffPixels`); a pixel counts only when it differs beyond Playwright's
per-pixel `threshold` (0.2), so anti-aliasing noise doesn't. An absolute budget replaced
`maxDiffPixelRatio: 0.001`, which let a whole header change through on long pages.

### Accepting an intended change

1. Push the change. The Visual job fails on the routes whose layout moved.
2. Check the diffs: download the `visual-report-1` or `visual-report-2` artifact (one per
   Visual shard), or compare the baseline PNG files from git
   (`git show "<ref>:e2e/__screenshots__/linux/<project>/<route>-<width>.png"`); the artifact is
   large and can stall.
3. Add the label: `gh pr edit <number> --add-label update-snapshots`. The `E2E snapshots`
   workflow captures with `--update-snapshots=changed` (only failing baselines are rewritten),
   commits them to the PR branch as `github-actions[bot]`, and removes the label. Adding the label
   again runs it again.
4. The bot's push doesn't start CI (pushes made with `GITHUB_TOKEN` never trigger workflows).
   The next regular push runs CI against the new baselines.
5. Check that the bot touched only the routes the PR changes. Restore any other PNG from the base
   branch in a commit marked `[skip ci]`.
6. List every intended diff in the PR's "Visual changes" table (route, what changed, cause).

`workflow_dispatch` works only once `e2e-snapshots.yml` is on the default branch; until then the
label is the only trigger.

## Known flakes

- **`webkit-iphone` in CI:** WebKit's iPhone emulation froze the page process on GitHub's Linux
  runners, so the project runs only locally (or with `E2E_WEBKIT_MOBILE=1`). Phone widths are
  covered in CI by `chromium-phone`; WebKit by `webkit-desktop` and `visual-webkit`.
- **Chromium `home-1440`:** faint anti-aliasing noise (about 128 pixels, at most 2/255) stays
  under the per-pixel threshold, so it doesn't count against `maxDiffPixels`. Leave it.
- **Fixed:** on WebKit `data-privacy-1440` the table of contents' scroll spy could still mark
  the last section as current after `loadLazyContent` scrolled back to the top, so the first
  capture failed "two consecutive stable screenshots" and only the retry passed. The visual
  spec now waits until no TOC entry is current before it captures.
- **Fixed:** the E-Lab and Apply timeline markers used to depend on scroll timing; that
  timeline is static under reduced motion now (#280). The partner rotation property test
  collects failures and asserts once per run, so it no longer times out (#278).

## Real Safari

WebKit on Linux doesn't reproduce Safari 26's tinted status bar and toolbar. Changes to the
header, footer, dialogs, page tops and bottoms, or the root background need the manual iPhone
checklist in `.agents/skills/ui-verify/references/iphone-safari.md`. The workarounds are listed in
[browser-quirks.md](browser-quirks.md).
