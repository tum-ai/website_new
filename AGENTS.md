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

# Fast loop: run after every change (seconds)
pnpm lint                 # Biome check; `pnpm lint:apply` applies safe fixes and formatting
pnpm typecheck            # Next route typegen + tsc --noEmit
pnpm test                 # Vitest, node + jsdom projects; test:watch, test:coverage

# Full gate: before every PR
pnpm verify               # lint + typecheck + test + build + test:perf
pnpm test:e2e             # Playwright, chromium + webkit (specs coming in W1-E2E)
pnpm knip                 # unused files, exports and dependencies (advisory in CI)
```

`pnpm build` writes `.next-prod`; `pnpm start` serves it. `test:perf` reads that build, so run
`pnpm build` first. `pnpm sanity:typegen` (coming in W1-Data) regenerates the CMS types.

## Architecture

```
src/app/(site)/<route>/page.tsx   thin route: metadata + JsonLd + the feature's page component
src/app/(site)/layout.tsx         site root layout: skip link, header, #main-content, footer, SanityLive
src/app/studio/[[...tool]]/       Sanity Studio, a separate root layout with no site shell or CSS
src/app/global-not-found.tsx      404 for unmatched URLs (there are two root layouts)
src/app/api/                      getNotes | getPartners | getResearch (public JSON API), draft-mode
src/features/<domain>/            <domain>-page.tsx, sections, data/ (static copy), logic, tests,
                                  optional index.ts (the only entry for other features)
src/components/ds/                design system (Base UI + tone tokens), barrel `@/components/ds`
src/components/shell/             header, footer, skip link
src/components/json-ld.tsx        JSON-LD script tag
src/config/                       site facts and SEO (site.ts, navigation.ts coming in W1-Data)
src/lib/                          cn, sanity client/queries/fetch, mock-cms, munich-time, security, redirects
src/sanity/                       Studio config and schemas (TypeGen writes to src/lib, coming in W1-Data)
src/styles/index.css              tokens, tones, cascade layers, utilities
src/proxy.ts                      host redirects (join.tum-ai.com to /apply)
test/                             repo-wide fitness tests (content facts, assets, perf budget)
e2e/                              Playwright specs and fixtures (coming in W1-E2E)
```

Import rules. `src/architecture.test.ts` is authoritative; Biome `noRestrictedImports` repeats
the rules it can express.

| Module | May import |
|---|---|
| `app` | `features/<x>/<x>-page.tsx` and page CSS only, plus components, config, lib, sanity, styles |
| `app/studio` | sanity, lib |
| `features/<x>` | own files, `features/<y>` via its `index.ts`, ds, shell, `components/json-ld`, config, lib |
| `components/ds` | own files, `lib/cn` |
| `components/shell` | own files, ds, config, lib |
| `components/*.tsx` | ds, config, lib |
| `config` / `lib` / `sanity` | config and lib / lib / sanity and lib |

Every feature folder has a `<name>-page.tsx`, and routes import exactly that module. A feature
`index.ts` never re-exports a page, and features never import CSS (the route imports page CSS).
Reason: Turbopack keeps every re-exported module that has client islands or CSS, so a page in an
index ships its islands and styles to every page importing that index.

## Conventions

- kebab-case file names (Biome `useFilenamingConvention`). Named exports, except where Next.js
  requires a default (page, layout, global-not-found) and in `sanity.config.ts`.
- Server components by default. `"use client"` only on leaf islands; shape data on the server and
  pass plain props. No `new Date()` during render in client code (hydration mismatch).
- Styling uses tokens only: no raw hex or `rgb()` and no stock Tailwind palette (`gray-*`,
  `slate-*`, `purple-*`) outside `src/styles/`. Use the type-scale utilities, not arbitrary sizes.
  Biome sorts classes inside `className`, `cn()` and `cva()`.
- Site facts (dates, counts, emails, links, URLs) come from `src/config`, never from page code
  (`test/content-facts.test.ts` enforces this).
- TSDoc on exported APIs and non-obvious contracts; no comments that restate the code.
- Tests live next to the code (`x.test.ts`, `x.test.tsx`); `test/` is for repo-wide checks only.
- Don't add Biome warnings. Rules with existing violations start at `warn` and become errors later.

## Where to change X

| Task | Where | Skill |
|---|---|---|
| Add a page | route + feature folder + `config/seo.ts` + nav + E2E route list | `add-page` |
| Change a site fact | the matching file in `src/config/` | `site-facts` |
| Change static copy | `src/features/<domain>/data/` | |
| Change a CMS type or field | `src/sanity/schemas/` then query, types, mock, UI | `cms-content-model` |
| Add or change a ds component | `src/components/ds/` + showcase + docs table | `ds-component` |
| Change navigation | `src/config/navigation.ts` (coming in W1-Data; today the arrays in `components/shell/header.tsx` and `footer.tsx`) | |
| Change SEO or JSON-LD | `src/config/seo.ts` | |
| Tokens, brand, logos, imagery | `src/styles/index.css`, ds components, `public/assets/` | `tumai-ci` |
| Host redirects | `src/lib/redirects.ts`, `src/proxy.ts` | |

## Tests per change

| Change | Required test |
|---|---|
| Logic in `lib/`, `config/`, `features/**/*.ts` | unit test next to it (`*.test.ts`, node) |
| Interactive UI (islands, ds behaviour) | component test (`*.test.tsx`: Testing Library, user-event, `axe()` from `@test/axe`) |
| Site facts | `content-facts` and `e-lab-content` tests stay green; derive expectations from config |
| New route or user flow | E2E spec and the E2E route list (coming in W1-E2E); axe runs on every route |
| Visible UI change | E2E visual baselines updated through CI (coming in W1-E2E), and screenshots at 390 and 1440 px in the PR |
| Homepage markup or images | `pnpm build && pnpm test:perf` (preload and SSR budget) |
| New folder or import path | `src/architecture.test.ts` passes without new exceptions |

Test behaviour, not source text: no grepping source files and no change-detector literals.

## Design and content rules

Read `docs/design-system.md` before UI work. The ds API conventions (cva variants, `as` vs
`headingAs`, `tone` vs `emphasis`, ref as prop, TSDoc) are in the header of
`src/components/ds/index.ts` (coming in W1-DS). Hard rules:

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
  runs Lint, Typecheck, Unit tests, Build (+ perf), E2E and Knip (advisory); `Verify` aggregates
  them. Other workflows: `docs/github-actions.md`.
- Never hand-edit `pnpm-lock.yaml` or `*.generated.ts`: run pnpm or the generator.

## Gotchas

- **Dist dirs.** `pnpm dev` uses `.next-dev`, build/start/typecheck use `.next-prod`, Vercel uses its
  default. Don't run bare `next build`; `pnpm build` never deletes a running dev server's output.
- **Mock CMS.** `USE_MOCK_CMS=1` serves `src/lib/mock-cms.ts` fixtures and is ignored on Vercel.
  Set it for both build and start. Without Sanity env vars, CMS pages render empty lists.
  `MOCK_CMS_NOW` for deterministic dates is coming in W1-Data.
- **Draft mode and Studio.** Presentation in `/studio` enables drafts via `/api/draft-mode/enable`,
  which needs `SANITY_API_READ_TOKEN` (server only; never expose it to the browser). A disable
  route is coming in W1-Data. `/studio` must never import the site shell or site CSS.
- **Public API.** `/api/getNotes` returns events (legacy name). Keep all three response shapes stable.
- **`/design-system`** renders only in development and on Vercel previews; production returns 404.
- **Safari 26.** The root canvas is brand black because Safari tints its status bar and toolbar from
  it; the header and dialogs have Safari-specific workarounds. See the comments tagged Safari
  (`rg -n Safari src`) until `docs/browser-quirks.md` exists. Verify on a real iPhone (`ui-verify`).
- **`server-only`** modules (`lib/sanity.ts`) are stubbed in Vitest; mock `next/headers` in tests.

## Agent setup

- Skills (`.agents/skills/<name>/SKILL.md`, seen by Claude through `.claude/skills/` symlinks):
  `add-page`, `ds-component`, `site-facts`, `cms-content-model`, `ui-verify`, `pr-ready`, `tumai-ci`.
- Subagents (`.claude/agents/`): `design-reviewer` (diff vs design rules), `a11y-reviewer` (diff and
  axe), `docs-sync` (stale docs). Other harnesses: read the file and follow its procedure.
- Scoped rules (`.claude/rules/`) load automatically in Claude; other agents read the matching file
  before editing: `design-system.md` (`src/components/ds/**`), `features.md` (`src/features/**`),
  `app-router.md` (`src/app/**`), `styles.md` (`src/styles/**`, `**/*.css`),
  `content-and-config.md` (`src/config/**`, `src/features/**/data/**`), `sanity.md`
  (`src/sanity/**`, `src/lib/sanity*`, `src/lib/mock-cms*`, `src/app/api/**`), `testing.md`
  (`**/*.test.ts`, `**/*.test.tsx`, `e2e/**`; the `e2e/` folder is coming in W1-E2E).
- Sync contract: this file and `.agents/skills/` own the prose. `CLAUDE.md` only imports this file
  and adds Claude-specific notes; `.claude/skills/<name>` are relative symlinks, never copies. When
  paths, commands or conventions change, update this file, the rules and the skills in the same PR
  (`docs-sync` checks).
