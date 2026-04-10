# TUM.ai Website

Next.js App Router website for TUM.ai, plus a small workspace package for typed Notion data access.

## What Is In This Repo

```text
.
├── src/                   website app
├── packages/notion-data/  shared Notion client + row mappers
├── public/assets/         shipped logos, photos, and media
├── docs/                  contributor docs + brand source files
├── scripts/               small build helpers
└── test/                  Node-based regression tests
```

This is a pnpm workspace with two packages:

- `@tumai/web` at the repo root
- `@tumai/notion-data` in `packages/notion-data`

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Biome for linting/formatting
- pnpm workspaces
- Vercel for deployment
- Notion as the source for events, partners, and research data

## Quick Start

Install dependencies:

```bash
pnpm install
```

Pull local env vars from Vercel:

```bash
pnpm exec vercel link --yes --project website --scope tum-ai
pnpm exec vercel env pull .env.local --yes --environment=development
```

Run the app:

```bash
pnpm dev
```

Local dev uses `.next-dev`. Local builds use isolated dist dirs too, so `dev`, `build`, and `typecheck` do not fight over `.next`.

## Commands

```bash
pnpm dev            # start local dev server
pnpm build          # production build into .next-prod
pnpm start          # serve the .next-prod build
pnpm lint           # biome + workspace lint
pnpm test           # Node test runner via tsx
pnpm verify         # lint + test + build
pnpm typecheck      # Next build-based typecheck into .next-typecheck
pnpm typecheck:all  # root typecheck + packages/notion-data typecheck
```

CI currently runs `pnpm verify` on pull requests to `main`.

## Environment

The app reads these server-side environment variables:

- `NOTION_TOKEN`
- `NOTION_DB_ID`
- `NOTION_TOKEN_PARTNERS`
- `NOTION_DB_PARTNERS_ID`
- `NOTION_TOKEN_RESEARCH`
- `NOTION_DB_RESEARCH_ID`

`packages/notion-data` reads `process.env` directly. It does not load `.env` files on its own, so local development should use `.env.local` or Vercel env pull. If the values are missing, the Notion fetchers return empty arrays instead of crashing.

## How The App Is Structured

- `src/app/` owns routing, route handlers, metadata wiring, and the root layout.
- `src/views/` holds page-level composition.
- `src/components/` holds reusable sections and shared UI primitives.
- `src/data/` holds static copy and curated data arrays.
- `src/lib/` holds utilities, redirects, security helpers, shared types, and cached Notion access.
- `packages/notion-data/` is the only place that talks directly to Notion.

Two pages currently fetch live Notion data on the server:

- `/events`
- `/research`

Three API routes mirror the same cached data as JSON:

- `/api/getNotes` (legacy name, returns events)
- `/api/getPartners`
- `/api/getResearch`

## Editing Guide

If you need to:

- add or change a route: start in `src/app/`, then connect it to a view in `src/views/`
- update static page copy: check `src/data/` first, then the matching component
- change events or research rendering: update both the page view and the Notion-backed types/data path
- change global nav, footer, or font setup: edit `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- change shared styling or tokens: edit `src/styles/index.css`
- change SEO or JSON-LD: edit `src/config/seo.ts`
- change Notion field mapping: edit `packages/notion-data/src/index.ts`, then verify `src/lib/notion.ts` consumers still match

One important legacy file remains:

- `src/data/routes.tsx` is not runtime routing anymore. App Router files in `src/app/` are the source of truth.

## Contributor Docs

- [docs/repo-structure.md](docs/repo-structure.md): architecture and directory map
- [docs/contributor-guide.md](docs/contributor-guide.md): practical recipes for common changes

Brand source material is kept under `docs/brand/source/`.
