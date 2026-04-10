# Next.js / Vercel Architecture Notes

## Current State

This repo is now a Next.js App Router application with a pnpm workspace around it.

Active workspace units:

- `@tumai/web` at the repo root
- `@tumai/notion-data` in `packages/notion-data`

The website uses:

- App Router pages in `src/app`
- shared view/components in `src/views` and `src/components`
- server-only Notion access through `src/lib/notion.ts`
- route handlers in `src/app/api/*`
- a tested Tailwind v4 setup from `src/styles/index.css`

## Best-Practice Decisions Applied

### Routing

- Route ownership lives in `src/app`.
- Non-route implementation details stay outside `src/app` unless colocation is useful.
- Host redirect logic is handled in `src/middleware.ts` so it is versioned and testable.

### Data fetching

- Notion reads are centralized in `packages/notion-data`.
- The Next app consumes shared data functions through `src/lib/notion.ts`.
- Route handlers only wrap shared server data and return JSON.
- ISR-style caching is currently done with `unstable_cache`.

### Notion data flow

The current runtime path is:

1. `packages/notion-data/src/index.ts`
   Reads env from `process.env`, `.env.local`, and `.env` when needed.
   Talks to Notion with `@notionhq/client`.
   Maps raw database rows into the app-level `Event`, `Partner`, and `Research` types.

2. `src/lib/notion.ts`
   Imports the shared fetchers.
   Wraps them in `unstable_cache`.
   Uses the active database ids as part of the cache key so cache entries stay aligned with the current Notion source.

3. Server-rendered pages
   `/events` calls `getEvents()`.
   `/research` calls `getResearchProjects()`.
   `/partners` calls `getPartners()`.
   These pages render from server data directly, without a separate backend hop.

4. Route handlers in `src/app/api/*`
   `/api/getNotes`, `/api/getPartners`, and `/api/getResearch` return the same cached server data as JSON.
   These exist for client-side consumers and compatibility inside the app, not as a separate service boundary.

5. Client-side consumers
   Components that still fetch in the browser, such as the homepage events section, call the Next route handlers rather than calling Notion or an external backend directly.

### Workspace layout

- Shared code is published only inside the workspace via `workspace:*`.
- Root `pnpm lint` covers the repo instead of only the Next app package.
- `transpilePackages` is enabled for `@tumai/notion-data`.
- pnpm is the package manager of record.

### Environment handling

- Secrets stay server-side.
- The Next app reads env vars directly.
- The required Notion envs are pulled from Vercel into `.env.local` for local development.
- No external Notion proxy is part of the runtime anymore.
- No browser-exposed Notion env variables remain.

### Styling

- Tailwind v4 uses CSS-first configuration in `src/styles/index.css`.
- `components.json` is aligned with Tailwind v4 / shadcn expectations.
- Fonts load through `next/font`.

## Current Gaps

### Cache model

`unstable_cache` works, but the next cleanup pass should evaluate:

- `revalidateTag` for explicit invalidation
- webhook-driven cache busting
- whether Vercel Runtime Cache or newer Next cache APIs are worth adopting later

### Repo structure

The repo is a workspace, but not yet a full `apps/web` style layout. That is fine for now because it avoids high-churn path moves during migration.

## Recommended Next Steps

1. Evaluate `revalidateTag` plus webhook-driven invalidation for Notion-backed data.
2. Move the remaining browser fetches for homepage sections to server-rendered data where it reduces client work.
3. Consider a later root-to-`apps/web` move only if workspace ergonomics actually suffer.
