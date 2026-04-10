# Repo Structure

This document explains how the TUM.ai website repo is organized and where to make changes.

## Top Level

```text
.
├── docs/               brand source material and internal repo docs
├── packages/           workspace packages such as shared Notion data access
├── public/             static assets served as-is
├── scripts/            small repo utilities and build helpers
├── src/                Next.js website app source
├── test/               node-based regression tests
├── package.json        workspace root scripts and dependencies
├── next.config.ts      Next.js config and distDir handling
└── vercel.json         Vercel framework override
```

## `src/` Overview

```text
src/
├── app/         App Router routes, layouts, and route handlers
├── components/  reusable UI and page-specific sections
├── config/      SEO and site configuration
├── data/        static content and route definitions
├── lib/         types and small utilities
├── views/       non-route page implementations used by App Router pages
├── proxy.ts     host redirects and request guards
└── styles/      global CSS and supporting stylesheet modules
```

## Runtime Composition

The app boots through App Router:

- [src/app/layout.tsx](../src/app/layout.tsx) loads global CSS, fonts, header, and footer
- `src/app/*/page.tsx` files own route registration
- shared page implementations live in `src/views/`
- [src/proxy.ts](../src/proxy.ts) handles host redirects before route execution

## Page Layer

`src/app/` contains the route entry points. These files stay thin and compose sections from `src/views/` and `src/components/`.

Current pages:

- `/` -> [src/app/page.tsx](../src/app/page.tsx) -> [src/views/Homepage.tsx](../src/views/Homepage.tsx)
- `/apply` -> [src/app/apply/page.tsx](../src/app/apply/page.tsx) -> [src/views/apply/Apply.tsx](../src/views/apply/Apply.tsx)
- `/events` -> [src/app/events/page.tsx](../src/app/events/page.tsx) -> [src/views/headerPages/Events.tsx](../src/views/headerPages/Events.tsx)
- `/research` -> [src/app/research/page.tsx](../src/app/research/page.tsx) -> [src/views/headerPages/Research.tsx](../src/views/headerPages/Research.tsx)
- `/projects` -> [src/app/projects/page.tsx](../src/app/projects/page.tsx) -> [src/views/headerPages/Projects.tsx](../src/views/headerPages/Projects.tsx)
- `/e-lab` -> [src/app/e-lab/page.tsx](../src/app/e-lab/page.tsx) -> [src/views/headerPages/e-lab/ELab.tsx](../src/views/headerPages/e-lab/ELab.tsx)
- `/community` -> [src/app/community/page.tsx](../src/app/community/page.tsx) -> [src/views/headerPages/Community.tsx](../src/views/headerPages/Community.tsx)
- `/partners` -> [src/app/partners/page.tsx](../src/app/partners/page.tsx) -> [src/views/headerPages/Partners.tsx](../src/views/headerPages/Partners.tsx)
- `/qanda` -> [src/app/qanda/page.tsx](../src/app/qanda/page.tsx) -> [src/views/headerPages/QandA.tsx](../src/views/headerPages/QandA.tsx)
- legal routes under `src/app/`

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
- [src/components/JsonLd.tsx](../src/components/JsonLd.tsx)

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
- If content should be editable in Notion, expose it through `packages/notion-data`, `src/lib/notion.ts`, and `src/app/api/`.

## API Layer

`src/app/api/` contains Next.js route handlers used by the frontend.

Current handlers:

- [src/app/api/getNotes/route.ts](../src/app/api/getNotes/route.ts) -> events
- [src/app/api/getPartners/route.ts](../src/app/api/getPartners/route.ts) -> partners
- [src/app/api/getResearch/route.ts](../src/app/api/getResearch/route.ts) -> research projects

Characteristics:

- all handlers call shared fetchers from `packages/notion-data`
- server reads are wrapped in `src/lib/notion.ts`
- route handlers provide JSON compatibility for client-side consumers

Frontend consumers call the Next route handlers directly.

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

1. add the App Router page file under `src/app/`
2. add or reuse the matching `src/views/` implementation
3. add SEO config in `src/config/seo.ts`

## Assets And Brand Material

- `public/assets/` contains logos, photos, and other shipped assets
- `docs/brand/source/` contains the original brand guideline source material

When changing visual UI, use the repo-local assets and token system first.

## Deployment

[vercel.json](../vercel.json) currently does two important things:

- overrides the project framework to `nextjs`
- keeps deployment behavior versioned in-repo

## Practical Edit Guide

If you need to:

- change nav/footer/global shell: start in `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- add or remove routes: update `src/app/`
- edit copy for a static page section: check `src/data/` first, then the matching page/component
- adjust shared look and feel: update `src/styles/index.css` and `src/components/ui/`
- change Notion-backed fields: update `packages/notion-data`, `src/lib/notion.ts`, and the consumer page/component together
