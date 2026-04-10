# Contributor Guide

Use this document when you want the shortest path from "I need to change X" to the right files.

## First Principles

- `src/app/` owns routes
- `src/views/` owns page composition
- `src/components/` owns sections and reusable UI
- `src/data/` owns static content in Git
- `packages/notion-data/` owns direct Notion access and field mapping
- `src/styles/index.css` owns the shared visual system

If you are unsure where to edit, start from the rendered route in `src/app/`, then trace into its view and section components.

## Local Workflow

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm verify
pnpm typecheck:all
```

Use `pnpm verify` before handoff for the normal repo gate. Use `pnpm typecheck:all` when you changed TypeScript shapes or cross-package contracts.

## Common Changes

### Add a new page

1. Create a new route at `src/app/<route>/page.tsx`
2. Add or reuse a page composition component in `src/views/`
3. Build metadata and JSON-LD in `src/config/seo.ts`
4. Add navigation only if the page should appear in the header or footer
5. Run `pnpm verify` and `pnpm typecheck:all`

Pattern to copy:

- thin route file in `src/app/`
- actual page assembly in `src/views/`

### Change global navigation or footer

Edit:

- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/app/layout.tsx` if the global shell itself changes

### Change static copy or curated content

Check `src/data/` first.

Examples:

- FAQs: `src/data/qanda.tsx`, `src/data/apply/faq.tsx`, `src/data/e-lab/FAQ.tsx`
- homepage copy/images: `src/data/homepage.tsx`
- partner groupings: `src/data/partners.tsx`
- community copy: `src/data/community.tsx`

If copy is hard-coded inside a section component, move it into `src/data/` only if that makes the code easier to maintain. Do not shuffle content across files without a payoff.

### Change events, research, or partners data shape

Start in `packages/notion-data/src/index.ts`.

Typical flow:

1. update the mapper or type
2. update `src/lib/notion.ts` consumers if needed
3. update views/components that render the changed fields
4. update `test/notion-data.test.ts`
5. run `pnpm test` and `pnpm typecheck:all`

Important:

- `/events` and `/research` render from server-side calls to `src/lib/notion.ts`
- the API routes mirror that data, but they are not the primary rendering path

### Add or change a JSON endpoint

Route handlers live in `src/app/api/<name>/route.ts`.

Keep them thin:

- read shared data from `src/lib/`
- return `NextResponse.json(...)`
- do not duplicate Notion querying logic inside the route handler

### Change styling or theming

Start in `src/styles/index.css`.

That file contains:

- Tailwind imports
- theme tokens
- gradients
- shared brand classes

Use `src/components/ui/` for reusable UI building blocks. Use page-specific component styles only when the styling is truly local to that page.

### Add or replace assets

Put shipped files under `public/assets/` in the closest existing subfolder.

Examples:

- route-specific photos in `public/assets/homepage/`, `public/assets/apply/`, `public/assets/e-lab/`
- logos in partner- or sponsor-specific folders

Use brand source files in `docs/brand/source/` as reference material, not as runtime assets.

### Change SEO

Edit `src/config/seo.ts`.

For a new page, update both:

- the route under `src/app/`
- the matching SEO entry in `src/config/seo.ts`

## Known Footguns

- `src/data/routes.tsx` is legacy and not used for runtime routing
- `/api/getNotes` returns events despite the name
- `src/app/globals.css` only re-imports `src/styles/index.css`
- changing only an API route will not affect a page that fetches directly from `src/lib/notion.ts`

## Suggested Review Checklist

Before shipping a change, check:

- correct ownership layer touched
- no duplicated content or data-fetching logic introduced
- `src/config/seo.ts` updated if a route changed
- tests updated if types or mapping changed
- `pnpm verify` passed
- `pnpm typecheck:all` passed when TypeScript contracts changed
