# Repo Structure

This document explains how the repository is organized today and which layer owns what.

## Top-Level Map

```text
.
├── docs/
│   ├── brand/source/         original brand references
│   └── *.md                  contributor-facing docs
├── packages/
│   └── notion-data/          shared Notion fetchers and row mappers
├── public/
│   └── assets/               static images, logos, video, fonts
├── scripts/                  small Node helpers for repo workflows
├── src/                      Next.js application source
├── test/                     Node regression tests
├── package.json              root scripts and app dependencies
├── next.config.ts            Next.js config
├── pnpm-workspace.yaml       workspace definition
└── vercel.json               deployment framework config
```

## Workspace Model

This repo is a small pnpm workspace, not an `apps/web` monorepo:

- `@tumai/web` lives at the repository root
- `@tumai/notion-data` lives in `packages/notion-data`

The root app consumes `@tumai/notion-data` through `workspace:*`, and `next.config.ts` transpiles that package for the app build.

## Application Layers

```text
src/
├── app/         route entrypoints, API handlers, root layout
├── components/  shared UI and page sections
├── config/      SEO and metadata configuration
├── data/        static copy, FAQs, partner/logo datasets
├── lib/         helpers, types, security, redirects, Notion cache wrapper
├── styles/      global Tailwind/CSS token layer
├── views/       page composition outside App Router files
└── proxy.ts     host-based redirect logic
```

### `src/app/`

`src/app/` owns runtime routing. Most `page.tsx` files are intentionally thin:

1. set `metadata` via `src/config/seo.ts`
2. render JSON-LD with `src/components/JsonLd.tsx`
3. hand off to a page view in `src/views/`

Current routes:

- `/` -> `src/app/page.tsx` -> `src/views/Homepage.tsx`
- `/apply` -> `src/app/apply/page.tsx` -> `src/views/apply/Apply.tsx`
- `/community` -> `src/app/community/page.tsx` -> `src/views/headerPages/Community.tsx`
- `/events` -> `src/app/events/page.tsx` -> `src/views/headerPages/Events.tsx`
- `/e-lab` -> `src/app/e-lab/page.tsx` -> `src/views/headerPages/e-lab/ELab.tsx`
- `/partners` -> `src/app/partners/page.tsx` -> `src/views/headerPages/Partners.tsx`
- `/projects` -> `src/app/projects/page.tsx` -> `src/views/headerPages/Projects.tsx`
- `/qanda` -> `src/app/qanda/page.tsx` -> `src/views/headerPages/QandA.tsx`
- `/research` -> `src/app/research/page.tsx` -> `src/views/headerPages/Research.tsx`
- legal pages live under `src/app/imprint`, `src/app/data-privacy`, and `src/app/disclaimer`

API handlers also live here:

- `src/app/api/getNotes/route.ts`
- `src/app/api/getPartners/route.ts`
- `src/app/api/getResearch/route.ts`

`src/app/layout.tsx` is the global shell. It loads the Manrope font, imports global CSS, and wraps every page with the shared header and footer.

### `src/views/`

`src/views/` is the page composition layer. Use it when the App Router file should stay small and declarative.

Subfolders:

- `src/views/apply/` for the apply flow
- `src/views/footer/` for legal/footer pages
- `src/views/headerPages/` for main navigation pages

Rule of thumb: if a page is made of several sections and needs orchestration, that orchestration belongs in `src/views/`, not directly in `src/app/`.

### `src/components/`

`src/components/` is organized mostly by page domain:

- `apply/`
- `community/`
- `e-lab/`
- `events/`
- `home/`
- `innovation/`
- `research/`
- `ui/`

Cross-page building blocks live at the top level:

- `Header.tsx`
- `Footer.tsx`
- `Layout.tsx`
- `JsonLd.tsx`
- `Logos.tsx`

`src/components/ui/` contains the closest thing to a shared design-system layer. Some pieces are shadcn/Radix-style primitives, but the site still relies heavily on custom brand classes defined in CSS.

### `src/data/`

`src/data/` is the source of truth for content that is versioned in Git instead of coming from Notion.

Examples:

- `src/data/homepage.tsx` for homepage copy and image arrays
- `src/data/apply/` for apply content and FAQs
- `src/data/e-lab/` for E-Lab content and startup lists
- `src/data/community.tsx` for community copy
- `src/data/partners.tsx` for partner/logo groupings
- `src/data/qanda.tsx` for FAQ content

Use `src/data/` when content is:

- static
- reviewed in code
- deployed with the app
- not expected to be edited from Notion

### `src/lib/`

`src/lib/` contains shared runtime helpers:

- `notion.ts` wraps Notion fetchers in `unstable_cache`
- `types.ts` re-exports shared data types and local UI types
- `utils.ts` contains event filtering/grouping helpers and class merging
- `security.ts` sanitizes URLs and JSON-LD output
- `redirects.ts` contains join-host redirect logic

### `src/styles/`

The main style entrypoint is `src/styles/index.css`.

Important details:

- `src/app/globals.css` only re-imports `src/styles/index.css`
- Tailwind v4 is configured CSS-first in `src/styles/index.css`
- brand tokens, gradients, and utility classes live there
- page-specific support styles live in files like `src/styles/Grid.css` and `src/styles/elab-font.css`

If a contributor only edits `src/app/globals.css`, they will miss most of the actual styling system.

### `src/proxy.ts`

`src/proxy.ts` handles host-level redirects before route execution. Right now it exists mainly to redirect `join.tum-ai.com/*` to `/apply`, except when the request is already for `/apply`.

## Live Data Flow

Notion-backed data currently follows this path:

1. `packages/notion-data/src/index.ts` talks to the Notion API and maps raw database rows into `Event`, `Partner`, and `Research`.
2. `src/lib/notion.ts` wraps those fetchers in `unstable_cache`, with the current database IDs included in the cache key.
3. server routes consume those helpers directly:
   - `/events` uses `getEvents()`
   - `/research` uses `getResearchProjects()`
4. API handlers return the same cached data as JSON for compatibility:
   - `/api/getNotes`
   - `/api/getPartners`
   - `/api/getResearch`

Important contributor note:

- the page routes fetch from `src/lib/notion.ts` directly
- changing an API handler alone will not change page behavior unless the page actually consumes that handler
- `packages/notion-data` reads `process.env` only; it does not load dotenv files itself

## Tests

The test suite is intentionally small and regression-focused:

- `test/next-migration.test.ts` verifies host redirects
- `test/notion-data.test.ts` verifies Notion row normalization
- `test/security.test.ts` verifies URL and JSON-LD safety helpers
- `test/tailwind-build.test.ts` verifies a build emits expected CSS utilities
- `test/workspace-scripts.test.ts` verifies script and dist-dir invariants

Tests run with Node's built-in test runner and `tsx`.

## Scripts And Build Behavior

Root scripts are in `package.json`.

Notable behavior:

- `pnpm dev` runs Next with `NEXT_DIST_DIR=.next-dev`
- `pnpm build` uses `scripts/run-next-command.mjs` to build into `.next-prod`
- `pnpm typecheck` uses a separate `.next-typecheck`
- on Vercel, the helper leaves `NEXT_DIST_DIR` unset so the platform can use its default behavior

This repo intentionally isolates local Next output directories so different workflows do not collide.

## CI

GitHub Actions runs several repository workflows. The main PR gate is:

- install with pnpm 10.18.2 and Node 20
- run `pnpm verify`

Additional workflow notes live in [docs/github-actions.md](github-actions.md).

## Deployment

Deployment is configured for Vercel:

- `vercel.json` pins the framework to `nextjs`
- the app is structured as a single Next.js deployment at the repo root

## Known Legacy Or Confusing Areas

- `src/data/routes.tsx` is a leftover React Router-style route table. It is not the runtime source of truth anymore.
- `/api/getNotes` is legacy naming. It returns events, not notes.
- some components use `next/image`, many still use plain `<img>` tags
- route metadata lives in `src/config/seo.ts`; adding a page usually means updating both `src/app/` and `src/config/seo.ts`

## Practical Ownership Guide

If you need to change:

- routing: `src/app/`
- page composition: `src/views/`
- reusable sections: `src/components/`
- static copy: `src/data/`
- live Notion fields or mapping: `packages/notion-data/` plus `src/lib/notion.ts`
- SEO: `src/config/seo.ts`
- global shell: `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- global styles/tokens: `src/styles/index.css`
- static media: `public/assets/`
