# Repo Structure

This document explains how the TUM.ai website repo is organized and where to make changes.

## Top Level

```text
.
├── docs/               brand source material and internal repo docs
├── public/             static assets served as-is
├── src/                application code
├── index.html          Vite entry HTML
├── package.json        scripts and dependencies
├── tailwind.config.js  legacy Tailwind config still present in repo
├── vite.config.ts      Vite config and `@` path alias
└── vercel.json         SPA rewrites and host redirects
```

## `src/` Overview

```text
src/
├── api/         Vercel serverless functions
├── components/  reusable UI and page-specific sections
├── config/      SEO and site configuration
├── data/        static content and route definitions
├── lib/         types and small utilities
├── pages/       route-level page entry points
└── styles/      global CSS and supporting stylesheet modules
```

## Runtime Composition

The app boots in [src/main.tsx](../src/main.tsx):

- wraps everything in `BrowserRouter`
- mounts `TitleManager`
- renders the global header
- renders the route tree
- renders the global footer

The route tree itself is intentionally centralized:

- [src/App.tsx](../src/App.tsx) maps over [src/data/routes.tsx](../src/data/routes.tsx)
- `src/data/routes.tsx` is the single source of truth for public routes

## Page Layer

`src/pages/` contains route entry points only. These files should stay relatively thin and compose section components from `src/components/`.

Current pages:

- `/` -> [src/pages/Homepage.tsx](../src/pages/Homepage.tsx)
- `/apply` -> [src/pages/apply/Apply.tsx](../src/pages/apply/Apply.tsx)
- `/events` -> [src/pages/headerPages/Events.tsx](../src/pages/headerPages/Events.tsx)
- `/research` -> [src/pages/headerPages/Research.tsx](../src/pages/headerPages/Research.tsx)
- `/projects` -> [src/pages/headerPages/Projects.tsx](../src/pages/headerPages/Projects.tsx)
- `/e-lab` -> [src/pages/headerPages/e-lab/ELab.tsx](../src/pages/headerPages/e-lab/ELab.tsx)
- `/community` -> [src/pages/headerPages/Community.tsx](../src/pages/headerPages/Community.tsx)
- `/partners` -> [src/pages/headerPages/Partners.tsx](../src/pages/headerPages/Partners.tsx)
- `/qanda` -> [src/pages/headerPages/QandA.tsx](../src/pages/headerPages/QandA.tsx)
- footer/legal routes under `src/pages/footer/`

## Component Layer

`src/components/` is split by domain:

- `apply/` -> sections for the application page
- `community/` -> community-specific sections
- `e-lab/` -> E-Lab sections and supporting visuals
- `events/` -> event cards, lists, filters
- `home/` -> homepage sections
- `innovation/` -> project cards
- `research/` -> research cards
- `ui/` -> shared UI primitives such as buttons, cards, FAQ, dialog, carousel

Root-level shared layout components:

- [src/components/Header.tsx](../src/components/Header.tsx)
- [src/components/Footer.tsx](../src/components/Footer.tsx)
- [src/components/Layout.tsx](../src/components/Layout.tsx)
- [src/components/SEO.tsx](../src/components/SEO.tsx)
- [src/components/ScrollToTop.tsx](../src/components/ScrollToTop.tsx)

## Data Layer

`src/data/` contains static content and route config.

Examples:

- [src/data/routes.tsx](../src/data/routes.tsx) -> route registry
- `src/data/apply/` -> apply page copy and FAQ content
- `src/data/e-lab/` -> E-Lab content, FAQ, startup data
- [src/data/community.tsx](../src/data/community.tsx) -> community steps and department copy
- [src/data/homepage.tsx](../src/data/homepage.tsx) -> homepage visuals/content
- [src/data/partners.tsx](../src/data/partners.tsx) -> partner logo groups
- [src/data/qanda.tsx](../src/data/qanda.tsx) -> Q&A page content

Rule of thumb:

- If content is edited directly in git and ships with the frontend, put it in `src/data/`.
- If content should be editable in Notion, expose it through `src/api/`.

## API Layer

`src/api/` contains Vercel serverless functions used by the frontend.

Current handlers:

- [src/api/getNotes.ts](../src/api/getNotes.ts) -> events
- [src/api/getPartners.ts](../src/api/getPartners.ts) -> partners
- [src/api/getResearches.ts](../src/api/getResearches.ts) -> research projects

Characteristics:

- all handlers query Notion
- all handlers cache responses in memory for 5 minutes
- each handler maps Notion properties into the frontend shape expected by the consuming page

Frontend consumers currently use `import.meta.env.VITE_BACKEND_URL` to call these endpoints.

## Styling

Global styling lives in [src/styles/index.css](../src/styles/index.css).

Important styling conventions:

- global brand tokens live in `:root`
- shared brand utility classes also live in `src/styles/index.css`
- reusable UI treatments belong in `src/components/ui/`
- page-specific visuals should reuse the token layer instead of hard-coding colors inline

Other style files:

- [src/styles/Grid.css](../src/styles/Grid.css) -> homepage grid animation
- [src/styles/elab-font.css](../src/styles/elab-font.css) -> E-Lab typography overrides

## SEO

SEO metadata is centralized in [src/config/seo.ts](../src/config/seo.ts).

If you add a route:

1. add the page component
2. add the route in `src/data/routes.tsx`
3. add SEO config in `src/config/seo.ts`

## Assets And Brand Material

- `public/assets/` contains logos, photos, and other shipped assets
- `docs/brand/source/` contains the original brand guideline source material

When changing visual UI, use the repo-local assets and token system first.

## Deployment

[vercel.json](../vercel.json) currently does two important things:

- rewrites all non-file routes to `/` so client-side routing works
- redirects `join.tum-ai.com` to `https://tum-ai.com/apply`

## Practical Edit Guide

If you need to:

- change nav/footer/global shell: start in `src/main.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- add or remove routes: update `src/data/routes.tsx`
- edit copy for a static page section: check `src/data/` first, then the matching page/component
- adjust shared look and feel: update `src/styles/index.css` and `src/components/ui/`
- change Notion-backed fields: update the handler in `src/api/` and the consumer page/component together
