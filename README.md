# TUM.ai Website Monorepo

Incremental pnpm workspace for the TUM.ai website and shared Notion data utilities.

## Workspace Layout

```text
.
├── packages/notion-data   Shared typed Notion querying + mapping logic
├── src/                   Next.js website app source
└── test/                  Node test suite
```

## Install

```bash
pnpm install
```

## Local Development

Run the website:

```bash
pnpm dev
```

The website runs on `http://localhost:3000` by default and uses `.next-dev` so local dev output does not collide with production builds.

For repo-wide linting:

```bash
pnpm lint
```

For the full automated verification pass:

```bash
pnpm verify
```

Local `pnpm build` writes to `.next-prod`, and `pnpm typecheck` writes to `.next-typecheck`, so the workflows stay isolated without colliding with Vercel's default `.next` output.

## Environment

Pull Development envs from Vercel or fill in `.env.local` with:

- `NOTION_TOKEN`
- `NOTION_DB_ID`
- `NOTION_TOKEN_PARTNERS`
- `NOTION_DB_PARTNERS_ID`
- `NOTION_TOKEN_RESEARCH`
- `NOTION_DB_RESEARCH_ID`

Bootstrap with Vercel CLI:

```bash
pnpm exec vercel link --yes --project website --scope tum-ai
pnpm exec vercel env pull .env.local --yes --environment=development
```

The Next app reads the variables directly for server-side fetching.

## Notion Data Flow

The data path is now direct:

1. `packages/notion-data` talks to the Notion API with `@notionhq/client`.
2. That package normalizes raw Notion rows into the app shapes for events, partners, and research.
3. `src/lib/notion.ts` wraps those reads in `unstable_cache` so repeated requests do not hit Notion every time.
4. App Router pages such as `/events` and `/research` call those server helpers directly during render.
5. `src/app/api/getNotes`, `src/app/api/getPartners`, and `src/app/api/getResearch` expose the same cached data as JSON for compatibility and client-side consumers.

## Notion Endpoints

The website exposes route handlers for:

- `GET /api/getNotes`
- `GET /api/getPartners`
- `GET /api/getResearch`
