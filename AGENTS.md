# AGENTS.md

Canonical guide for coding agents (Claude Code, Codex and others) and a fast orientation for humans.
`CLAUDE.md` imports this file. Shared guidance lives here and in `.agents/skills/`; harness folders
hold only adapters (see "Agent setup").

## Project

The public website of TUM.ai, the AI student initiative at TUM (tum-ai.com): landing page, events,
research, projects, E-Lab (startup incubator), partners, community, apply, Q&A and legal pages.
Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (CSS-first tokens), a Base UI
design system in `src/components/ds`, Sanity CMS embedded at `/studio`, Vercel. pnpm 10, Node 24.
Biome lints and formats; Vitest runs unit and component tests; Playwright runs E2E, axe and visual.

## Commands

```bash
pnpm install              # also installs the lefthook git hooks (skipped when CI is set)
pnpm dev                  # dev server, output in .next-dev
USE_MOCK_CMS=1 pnpm dev   # local CMS fixtures, no Sanity credentials needed

# Local loop for agents: run after every change (seconds)
pnpm lint                 # Biome check, warnings fail; `pnpm lint:apply` applies safe fixes
pnpm typecheck            # Next route typegen + tsc --noEmit
pnpm exec vitest run <files>   # only the tests you wrote or touched

# CI runs the rest on every PR push (people may run them locally)
pnpm test                 # Vitest, node + jsdom; test:watch; test:coverage (thresholds)
pnpm verify               # lint + typecheck + test + build + test:perf
pnpm test:e2e             # Playwright E2E in chromium + webkit
pnpm test:e2e:visual      # visual regression against the Linux baselines
pnpm knip                 # unused files, exports and dependencies (a CI gate)
```

**Where tests run.** Agents run only `pnpm lint`, `pnpm typecheck` and targeted
`pnpm exec vitest run <files>` locally. The full unit suite, `pnpm build`, E2E and Visual run
remotely in the PR's CI: push rarely, read failures with `gh run view --job <id> --log-failed`,
batch the fixes into one push. Never close and reopen a PR to re-run CI. Details:
`docs/testing.md`.

`pnpm build` writes `.next-prod`; `pnpm start` serves it. `test:perf` reads that build.
`pnpm sanity:typegen` regenerates `src/lib/sanity.types.generated.ts` after a schema or query
change (CI fails when it's stale; `pnpm sanity:typegen:check` shows it locally).
`pnpm sanity:backfill --dataset redesign` (required; never the live dataset) writes the content slices' documents to
`.sanity-backfill/<dataset>.ndjson` (a dry run); its `--apply` imports them into Sanity and is a
maintainer's launch step, never part of a change (docs/adr/0009-cms-content-source.md). In the
Claude sandbox, run `sanity:typegen` and `sanity:backfill` unsandboxed (tsx and the Sanity CLI
fail with EPERM there).

## Architecture

Full description, data flow and rationale: `docs/architecture.md` and `docs/adr/`.

```
src/app/(site)/<route>/page.tsx   thin route: metadata + JsonLd + the feature's page component
src/app/(site)/layout.tsx         site root layout: skip link, header, #main-content, footer, SanityLive
src/app/studio/[[...tool]]/       Sanity Studio (workspaces /studio/live, /studio/content), own root layout
src/app/global-not-found.tsx      404 for unmatched URLs (there are two root layouts)
src/app/api/                      getNotes | getPartners | getResearch (public JSON API), draft-mode,
                                  revalidate (Sanity webhook → revalidateTag)
src/features/<domain>/            <domain>-page.tsx, sections, data/ (static copy), logic, tests,
                                  content.ts and <topic>-content.ts (CMS content slices, server
                                  only), optional index.ts (isomorphic) and server.ts (server
                                  only): the only entries for other features
src/components/ds/                design system (Base UI + tone tokens), barrel `@/components/ds`
src/components/shell/             header, footer, skip link
src/components/json-ld.tsx        JSON-LD script tag
src/config/                       site facts and their slices (site-settings-content,
                                  schedule-content), content-tokens, navigation (incl. header CTA),
                                  calls-to-action (CTA labels), campaigns and SEO
src/lib/                          cn, sanity-config, sanity client/queries/fetch, mock-cms, cms-content
                                  (+ -model, -mock), cms-backfill, content-tokens, content-copy,
                                  content-backfill, faq-content, community-model/-content,
                                  people-and-logos, organization-content, person-content,
                                  passage-spans, clock-window, munich-time, words, use-clock-switch,
                                  use-media-query, security, redirects
src/sanity/                       Studio config (live + content workspaces) and schemas (TypeGen
                                  writes src/lib/sanity.types.generated.ts)
scripts/sanity/                   backfill script and slice registry, schema merge for TypeGen
src/styles/index.css              tokens, tones, cascade layers, utilities
src/proxy.ts                      host redirects (join.tum-ai.com to /apply)
test/                             repo-wide fitness tests (content facts, assets, perf budget)
e2e/                              Playwright specs, fixtures (siteRoutes) and Linux visual baselines
```

Import rules. `src/architecture.test.ts` is authoritative; Biome `noRestrictedImports` repeats
the rules it can express.

| Module | May import |
|---|---|
| `app` | one `features/<x>/<x>-page.tsx` and that feature's CSS only, plus components, config, lib, styles |
| `app/studio` | sanity, lib |
| `features/<x>` | own files, `features/<y>` via its `index.ts` (isomorphic) or `server.ts` (server only), ds, shell, `components/json-ld`, config, lib |
| `components/ds` | own files, `lib/cn` |
| `components/shell` | own files, ds, config, lib |
| `components/*.tsx` | ds, config, lib |
| `config` / `lib` / `sanity` | config and lib / lib / sanity and lib |
| `src/proxy.ts` | config, lib |

Outside the design system, import it through its barrel `@/components/ds`. The test has no
exceptions.

Every feature folder has a `<name>-page.tsx`, and routes import exactly that module. A feature
`index.ts` or `server.ts` never re-exports a page, and features never import CSS (the route
imports page CSS). Reason: Turbopack keeps every re-exported module that has client islands or
CSS, so a page in an index ships its islands and styles to every page importing that index.
A feature `index.ts` reaches no `server-only` module, so client islands may import it; what reads
the CMS (content getters, async server components) goes in `server.ts`. The architecture test
also fails when any `"use client"` module reaches a `server-only` module or a Node built-in.

## Conventions

- kebab-case file names (Biome `useFilenamingConvention`). Named exports, except where Next.js
  requires a default (page, layout, global-not-found) and in `sanity.config.ts`.
- Server components by default. `"use client"` only on leaf islands; shape data on the server and
  pass plain props. No `new Date()` during render in client code (hydration mismatch).
- Styling uses tokens only: no raw hex or `rgb()` and no stock Tailwind palette (`gray-*`,
  `slate-*`, `purple-*`) outside `src/styles/`. Use the type-scale utilities, not arbitrary sizes.
  Biome sorts classes inside `className`, `cn()` and `cva()`.
- Site facts (dates, counts, emails, links, URLs) come from `src/config`, never from page code
  (`test/content-facts.test.ts` enforces this). Pages read them per render: `await
  getSiteFacts()`, the windows (`getMembershipWindow()`, `getELabWindow()`), and
  `await getContentTokens()` for `{{placeholders}}` in copy; the config constants are only the
  code fallback. Client islands get them as props.
- TSDoc on exported APIs and non-obvious contracts; no comments that restate the code.
- Tests live next to the code (`x.test.ts`, `x.test.tsx`); `test/` is for repo-wide checks only.
- Every Biome rule is an error (`--error-on-warnings`); a `biome-ignore` needs a reason.

## Where to change X

| Task | Where | Skill |
|---|---|---|
| Add a page | route + feature folder + `config/seo.ts` + nav + `siteRoutes` in `e2e/fixtures.ts` | `add-page` |
| Change a site fact | after launch: the Studio (`/studio/content`, Site settings or an application window); in code, the matching file in `src/config/` (`e-lab`, `membership`, `organization`, `contact`, `community`, `impact`, `site`), the fallback | `site-facts` |
| Change static copy | after launch: the page's singleton in `/studio/content`; in code, `src/features/<domain>/data/` (the fallback a slice serves) | |
| Change a standing CTA label | `src/config/calls-to-action.ts` | |
| Change a CMS type or field | `src/sanity/schemas/` then query, types, mock, UI | `cms-content-model` |
| Move hard-coded content to the CMS | a content slice: schema in `src/sanity/schemas/content/`, `features/<x>/content.ts`, `scripts/sanity/slices.ts`, parity test; owners in `docs/cms-content-inventory.md` | `cms-content-model` |
| Add or change a ds component | `src/components/ds/` + showcase + docs table | `ds-component` |
| Change navigation or the header CTA | `src/config/navigation.ts` (links, `headerCtaSetting`, `getHeaderOptions`) | |
| Change SEO or JSON-LD | `src/config/seo.ts` | |
| Tokens, brand, logos, imagery | `src/styles/index.css`, ds components, `public/assets/` | `tumai-ci` |
| Host redirects | `src/lib/redirects.ts`, `src/proxy.ts` | |
| A Safari workaround | the code tagged Safari + `docs/browser-quirks.md` | `ui-verify` |

## Tests per change

| Change | Required test |
|---|---|
| Logic in `lib/`, `config/`, `features/**/*.ts` | unit test next to it (`*.test.ts`, node) |
| Interactive UI (islands, ds behaviour) | component test (`*.test.tsx`: Testing Library, user-event, `axe()` from `@test/axe`) |
| Site facts | `content-facts` and `e-lab-content` tests stay green; derive expectations from config |
| New route or user flow | the route in `siteRoutes` (`e2e/fixtures.ts`) and a spec for the flow; axe runs on every route |
| Visible UI change | Visual baselines regenerated in CI: add the `update-snapshots` label to the PR. The bot commits only the changed PNG files and starts no CI; the next push runs it. Restore foreign PNG files in a `[skip ci]` commit, and list each intended diff in the PR's Visual changes table |
| Homepage markup or images | the homepage budget (`test:perf`, CI's Build job) |
| New folder or import path | `src/architecture.test.ts` passes without new exceptions |

Test behaviour, not source text: no grepping source files and no change-detector literals.
Layers, the visual baseline workflow and known flakes: `docs/testing.md`.

## Design and content rules

Read `docs/design-system.md` before UI work. The ds API conventions (cva variants, `as` vs
`headingAs`, `tone` vs `emphasis`, ref as prop, TSDoc) are in the header of
`src/components/ds/index.ts` and in `docs/design-system.md`, with the props of every component.
Hard rules:

- Pages are `PageHero` (the `h1`) followed by full-bleed `<Section tone>` bands; the last band is
  light or ink because the footer is night. Compose ds components before hand-rolling markup.
- Brand colours only, through tone tokens (`bg-canvas`, `text-fg`, `text-highlight`, ...). Primary
  actions are violet-600 for AA contrast, with dark purple on hover.
- Motion: only `transform` and `opacity`, never `filter` on text; `motion-safe:` on every entrance
  or loop; `ease-brand`; 300 ms to 1.2 s. No `Reveal` above the fold. framer-motion runs in
  `LazyMotion strict`: import `m`, not `motion`.
- Group actions in `Actions`; a button and a badge side by side share one size step. No meta rows,
  respect nested-corner radii, no `hyphens-auto` on `SplitWords` headlines.
- Accessibility: one `main`, ordered headings, Base UI for anything interactive, meaningful `alt`,
  new-tab links announce themselves, focus rings stay.
- Copy: no em dashes (or en dashes) in visible text. Fix unambiguous typos. Never invent or change
  facts or legal wording: flag them for a maintainer. German legal prose is excluded from `typos`.

## Git and PRs

- Conventional Commits; PR titles are checked by the `Verify PR-Title` workflow. Fill in
  `.github/pull_request_template.md` (layer, tests, docs, screenshots, keyboard and reduced motion).
- Normal flow: feature branch from `main`, PR into `main`.
- Redesign cleanup (temporary, until #262 merges): `chore/redesign-<stream>` branches open draft PRs
  into `chore/redesign-cleanup` (#264), which is stacked on `feat/site-redesign` (#262). Nothing
  merges into `feat/site-redesign` without the maintainer's OK.
- lefthook pre-commit runs `biome check --write --staged` and `typos`. CI (`.github/workflows/ci.yml`)
  runs Lint, Typecheck (+ TypeGen freshness), Unit tests (+ coverage thresholds), Build (+ perf),
  E2E (4 shards, merged report), Visual (2 shards) and Knip; `Verify` aggregates them. `[skip ci]`
  in a commit message is only for screenshot restores and pure sync merges. Other workflows:
  `docs/github-actions.md`.
- Never hand-edit `pnpm-lock.yaml` or `*.generated.ts`: run pnpm or the generator.

## Gotchas

- **Dist dirs.** `pnpm dev` uses `.next-dev`, build/start/typecheck use `.next-prod`, Vercel uses its
  default. Don't run bare `next build`; `pnpm build` never deletes a running dev server's output.
- **Mock CMS.** `USE_MOCK_CMS=1` serves `src/lib/mock-cms.ts` fixtures and is ignored on Vercel.
  It is read at **build** time (`next.config.ts` inlines it), so `USE_MOCK_CMS=1 pnpm build`;
  setting it only for `pnpm start` does nothing. `MOCK_CMS_NOW` (ISO date, or date-time with an
  offset) fixes the "now" the fixtures and the `/events` and `/apply` render dates use; E2E sets
  `2026-10-01T12:00:00Z`. Without Sanity env vars, CMS pages render empty lists.
- **CMS content source.** `CMS_CONTENT_SOURCE` (server only) is `code` by default: content slices
  return their code fallbacks and make no request. `sanity` reads the content dataset
  (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`; no default: unset, or naming the live dataset, the Studio
  has no `content` workspace and `sanity` renders the code content, logged once) and merges it
  over the fallbacks; with `USE_MOCK_CMS=1` it queries the backfill documents locally. Drafts and
  `SanityLive` cover the live dataset only. A slice tags its query `content:<type>` for every
  type it reads (`lib/cache-tags.ts`): the Sanity webhook at `/api/revalidate`
  (`SANITY_REVALIDATE_SECRET`) expires those tags on publish.
- **Draft mode and Studio.** Presentation in `/studio/live` enables drafts via `/api/draft-mode/enable`,
  which needs `SANITY_API_READ_TOKEN` (server only; never expose it to the browser; 503 without
  it). `/api/draft-mode/disable` leaves draft mode. `SANITY_API_BROWSER_TOKEN` is a separate,
  optional token for live drafts outside Presentation. `/studio` must never import the site shell
  or site CSS.
- **Public API.** `/api/getNotes` returns events (legacy name). Keep all three response shapes stable.
- **`/design-system`** renders only in development and on Vercel previews; production returns 404.
- **Safari 26.** The root canvas is brand black because Safari tints its status bar and toolbar from
  it; the header and dialogs have Safari-specific workarounds. `docs/browser-quirks.md` lists
  them and the code comments tagged Safari (`rg -n Safari src`). Verify on a real iPhone
  (`ui-verify`).
- **`server-only`** modules (`lib/sanity.ts`) are stubbed in Vitest; mock `next/headers` in tests.
  Vitest resolves only the first of several concurrent dynamic imports of a `vi.mock`ed module
  to the mock: a test that mocks `lib/cms-content-mock` calls one getter at a time
  (`docs/testing.md`).

## Agent setup

- Skills (`.agents/skills/<name>/SKILL.md`, seen by Claude through `.claude/skills/` symlinks):
  `add-page`, `ds-component`, `site-facts`, `cms-content-model`, `ui-verify`, `pr-ready`, `tumai-ci`.
- Subagents (`.claude/agents/`): `design-reviewer` (diff vs design rules), `a11y-reviewer` (diff and
  axe), `docs-sync` (stale docs). Other harnesses: read the file and follow its procedure.
- Scoped rules (`.claude/rules/`) load automatically in Claude; other agents read the matching file
  before editing: `design-system.md` (`src/components/ds/**`), `features.md` (`src/features/**`),
  `app-router.md` (`src/app/**`), `styles.md` (`src/styles/**`, `**/*.css`),
  `content-and-config.md` (`src/config/**`, `src/features/**/data/**`), `sanity.md`
  (`src/sanity/**`, `src/lib/sanity*`, `src/lib/mock-cms*`, `src/lib/cms-*`, content slices,
  `scripts/sanity/**`, `src/app/api/**`), `testing.md`
  (`**/*.test.ts`, `**/*.test.tsx`, `e2e/**`).
- Code intelligence (Claude Code): `.claude/settings.json` enables the official
  `typescript-lsp@claude-plugins-official` plugin, which gives the LSP tool go-to-definition,
  find-references, hover and diagnostics. It runs `typescript-language-server` from `PATH`, which
  is not a project dependency: install it once per machine with
  `npm install -g typescript-language-server typescript`. If the LSP tool still reports no
  server for `.ts` files, run `/plugin install typescript-lsp@claude-plugins-official` and start
  a new session. OMP has a
  built-in LSP tool (user setting `lsp.enabled`) that needs the same server on `PATH`. Codex has
  no LSP tool; use `rg` and `pnpm typecheck` there.
- Sync contract: this file and `.agents/skills/` own the prose. `CLAUDE.md` only imports this file
  and adds Claude-specific notes; `.claude/skills/<name>` are relative symlinks, never copies. When
  paths, commands or conventions change, update this file, the rules and the skills in the same PR
  (`docs-sync` checks).
