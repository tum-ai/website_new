# TUM.ai website

The public website of TUM.ai, the AI student initiative at the Technical University of Munich
([tum-ai.com](https://www.tum-ai.com)): landing page, events, research, projects, the E-Lab
startup incubator, partners, community, apply, Q&A and the legal pages.

## Stack

- Next.js 16 (App Router) and React 19, TypeScript
- Tailwind CSS v4, configured in CSS, with the Base UI design system from `@tum.ai/ui-kit` (pinned to 0.2.0)
- Sanity CMS for events, research projects and partners (and, step by step, page content), with
  the Studio embedded at `/studio` (one dataset, `NEXT_PUBLIC_SANITY_DATASET`: `redesign` for
  the new site)
- Biome (lint and format), Vitest and Testing Library, Playwright with axe
- pnpm 10, Node 24, deployed on Vercel

## Quick start

```bash
pnpm install        # dependencies and the lefthook pre-commit hook
pnpm dev            # http://localhost:3000
```

The CMS-backed pages need Sanity credentials. Either pull them from Vercel:

```bash
pnpm exec vercel link --yes --project website --scope tum-ai
pnpm exec vercel env pull .env.local --yes --environment=development
```

or work with local fixtures, no credentials needed:

```bash
USE_MOCK_CMS=1 pnpm dev
```

`USE_MOCK_CMS` is read at build time, so set it for `pnpm build` as well as `pnpm dev`. It never
runs on Vercel. Every variable is documented in [`.env.example`](.env.example).

## Commands

```bash
pnpm dev                  # dev server, output in .next-dev
pnpm build                # production build into .next-prod
pnpm start                # serve the .next-prod build

pnpm lint                 # Biome; pnpm lint:apply applies safe fixes and formatting
pnpm typecheck            # Next route typegen + tsc --noEmit
pnpm test                 # Vitest (node and jsdom projects); test:watch, test:coverage
pnpm test:perf            # homepage budget against the last pnpm build
pnpm test:e2e             # Playwright E2E, accessibility, keyboard, motion, no-JS
pnpm test:e2e:visual      # visual regression (baselines come from CI)
pnpm knip                 # unused files, exports and dependencies
pnpm sanity:typegen       # regenerate the CMS types after a schema or query change
pnpm verify               # lint + typecheck + test + build + test:perf
```

Pull requests run all of these in CI (see [docs/github-actions.md](docs/github-actions.md)).
Locally, `pnpm lint`, `pnpm typecheck` and the tests next to your change are usually enough.

## Layout

```text
src/
├── app/(site)/<route>/page.tsx   thin routes: metadata, JSON-LD, the feature's page module
├── app/studio/                   the embedded Sanity Studio (its own root layout)
├── app/api/                      public JSON API and draft-mode routes
├── features/<domain>/            everything a page owns: page module, sections, data, logic, tests
├── components/shell/             site adapters for @tum.ai/ui-kit/shell
├── config/                       CMS fact readers/derivation, navigation and SEO
├── lib/                          Sanity fetch layer and queries, mock CMS, time, security
├── sanity/                       Studio config and schemas
└── styles/index.css              kit styles and app-owned partner rotation
e2e/                              Playwright specs, fixtures and visual baselines
test/                             repo-wide fitness tests
docs/                             contributor docs, ADRs, brand sources
```

The import rules between these layers are enforced by `src/architecture.test.ts`.

## Common tasks

| To change | Edit |
| --- | --- |
| A deadline, cohort, recruiting round, member count or role contact | Site settings/application windows in `/studio`; code contracts in `src/config/` ([contributor guide](docs/contributor-guide.md#updating-site-facts)) |
| Page copy | The page's singleton in `/studio`; schema/query/parser in its feature ([CMS inventory](docs/cms-content-inventory.md)) |
| Events, research or partners content | `/studio` (locally or on a preview deployment) |
| Navigation or the header call to action | `src/config/navigation.ts` |
| SEO or JSON-LD | `src/config/seo.ts` |
| A shared component or token | [UI kit 0.2.0](https://github.com/tum-ai/ui-kit/tree/v0.2.0); release upstream, then update the exact package pin |

## Draft preview

Vercel preview deployments are the staging environment for CMS changes. With
`SANITY_API_READ_TOKEN` set there, open `/studio` on the preview, use the Presentation tool, and
the page shows drafts live. The token stays on the server. Details:
[docs/architecture.md](docs/architecture.md#data-flow).

## Documentation

- [docs/architecture.md](docs/architecture.md): layout, import rules, data flow
- [docs/contributor-guide.md](docs/contributor-guide.md): recipes for common changes
- [docs/design-system.md](docs/design-system.md): site composition, integration and versioned kit API links
- [docs/testing.md](docs/testing.md): test layers, what to test, visual baselines
- [docs/github-actions.md](docs/github-actions.md): CI, the snapshot workflow, Dependabot
- [docs/browser-quirks.md](docs/browser-quirks.md): Safari 26 workarounds
- [docs/adr/](docs/adr/README.md): architecture decision records
- [AGENTS.md](AGENTS.md): the guide for coding agents, also a fast orientation for people

Brand source material is in `docs/brand/source/`.
