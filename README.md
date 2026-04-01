# TUM.ai Website

Public website for TUM.ai, built with React, TypeScript, and Vite.

This repo contains:

- the client-side website
- shared page content and route configuration
- Vercel serverless endpoints that proxy selected Notion databases
- brand assets and brand reference material

For the detailed folder map, see [docs/repo-structure.md](docs/repo-structure.md).

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Radix UI primitives
- Framer Motion + GSAP
- Vercel serverless functions
- Notion as a content source for selected dynamic sections

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Other useful commands:

```bash
npm run typecheck
npm run lint
npm run preview
```

## Environment

The frontend expects a backend base URL:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

The serverless Notion endpoints use these environment variables:

```bash
NOTION_TOKEN=
NOTION_DB_ID=

NOTION_TOKEN_PARTNERS=
NOTION_DB_PARTNERS_ID=

NOTION_TOKEN_RESEARCH=
NOTION_DB_RESEARCH_ID=
```

## How The App Is Wired

- [src/main.tsx](src/main.tsx) mounts the app, router, title manager, header, and footer.
- [src/App.tsx](src/App.tsx) renders routes.
- [src/data/routes.tsx](src/data/routes.tsx) is the single route registry.
- `src/pages/` contains route-level page entry points.
- `src/components/` contains reusable and page-specific UI building blocks.
- `src/data/` holds static content and route metadata.
- `src/api/` contains Vercel serverless handlers for dynamic Notion-backed data.

## Content Model

This repo uses two content patterns:

- Static content lives in `src/data/` and is imported directly into pages/components.
- Dynamic content is fetched from Notion through the handlers in `src/api/`.

Current Notion-backed areas:

- events via [src/api/getNotes.ts](src/api/getNotes.ts)
- partners via [src/api/getPartners.ts](src/api/getPartners.ts)
- research via [src/api/getResearches.ts](src/api/getResearches.ts)

## Styling And Brand

- Global styles and design tokens live in [src/styles/index.css](src/styles/index.css).
- Shared UI primitives live in `src/components/ui/`.
- Brand source material lives in `docs/brand/source/`.
- The canonical button treatment lives in [src/components/ui/button.tsx](src/components/ui/button.tsx).

When changing visual UI, keep the implementation aligned with the TUM.ai brand tokens and source assets already in the repo.

## Common Changes

Add a new page:

1. Create the page entry file in `src/pages/`.
2. Add supporting components under the matching `src/components/` area if needed.
3. Register the route in [src/data/routes.tsx](src/data/routes.tsx).
4. Add SEO metadata in [src/config/seo.ts](src/config/seo.ts).

Add a static content section:

1. Add or extend a data module in `src/data/`.
2. Keep the page component thin and let it compose the content.

Add a new Notion-backed endpoint:

1. Add a handler in `src/api/`.
2. Define the required environment variables.
3. Fetch it from the relevant page/component using `VITE_BACKEND_URL`.
4. Document the new endpoint in this README and in [docs/repo-structure.md](docs/repo-structure.md).

## Deployment Notes

- Vercel rewrites all non-asset routes to `/` for SPA routing in [vercel.json](vercel.json).
- `join.tum-ai.com` is redirected to `/apply`.
- The frontend uses the `@` alias for `src/`, configured in [vite.config.ts](vite.config.ts).
