# TUM.ai Website

Next.js App Router website for TUM.ai, powered by an embedded Sanity CMS.

## What Is In This Repo

```text
.
├── src/                 website app and embedded Sanity Studio
├── public/assets/       shipped logos, photos, and media
├── docs/                contributor docs + brand source files
├── scripts/             small build helpers
└── test/                Node-based regression tests
```

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Biome for linting/formatting
- pnpm workspaces
- Vercel for deployment
- Sanity as the headless CMS for events, partners, and research data

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
pnpm lint           # biome lint
pnpm test           # Node test runner via tsx
pnpm verify         # lint + test + build
pnpm typecheck      # Next build-based typecheck into .next-typecheck
```

CI currently runs `pnpm verify` on pull requests to `main`.

## Environment

The app reads these environment variables to connect to the CMS:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

If the values are missing, the Sanity fetchers may fail to return data.

## How The App Is Structured

- `src/app/` owns routing, route handlers, metadata wiring, and the root layout. It also contains `src/app/studio/` for the embedded CMS.
- `src/views/` holds page-level composition.
- `src/components/` holds reusable sections and shared UI primitives.
- `src/data/` holds static copy and curated data arrays.
- `src/sanity/` holds the CMS configuration and TypeScript schema definitions.
- `src/lib/` holds utilities, redirects, security helpers, shared types, and cached Sanity GROQ fetchers.

Three pages currently fetch live Sanity data on the server:

- `/events`
- `/research`
- `/partners`

Three API routes mirror the same cached data as JSON:

- `/api/getNotes` (legacy name, returns events)
- `/api/getPartners`
- `/api/getResearch`

## Editing Guide

If you need to:

- add or change a route: start in `src/app/`, then connect it to a view in `src/views/`
- update static page copy: check `src/data/` first, then the matching component
- change events, partners, or research data: visit `/studio` locally or in production
- change global nav, footer, or font setup: edit `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- change shared styling or tokens: edit `src/styles/index.css`
- change SEO or JSON-LD: edit `src/config/seo.ts`
- change CMS field mapping or add tables: edit schemas in `src/sanity/schemas/`, then update the GROQ queries in `src/lib/sanity.ts`

One important legacy file remains:

- `src/data/routes.tsx` is not runtime routing anymore. App Router files in `src/app/` are the source of truth.

## Contributor Docs

- [docs/repo-structure.md](docs/repo-structure.md): architecture and directory map
- [docs/contributor-guide.md](docs/contributor-guide.md): practical recipes for common changes
- [docs/github-actions.md](docs/github-actions.md): CI, Dependabot, and code-scanning workflow reference

Brand source material is kept under `docs/brand/source/`.