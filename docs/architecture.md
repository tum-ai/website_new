# Architecture

How the repository is laid out, which layer owns what, and how data reaches a page. The import
rules here are enforced by `src/architecture.test.ts`; when this document and the test disagree,
the test wins. Decisions behind the layout are recorded in [`docs/adr/`](adr/README.md).

## Top-level map

```text
.
├── src/                    the Next.js app and the embedded Sanity Studio
├── e2e/                    Playwright specs, fixtures and the Linux visual baselines
├── test/                   repo-wide fitness tests (content facts, assets, favicon, perf budget)
├── public/assets/          shipped images, logos, video and the Manrope font
├── docs/                   contributor docs, ADRs and brand source files
├── scripts/                dist-dir helpers; sanity/: backfill script, slice registry, TypeGen schema merge
├── .github/                CI workflows, the shared setup action, Dependabot, PR template
├── .agents/ .claude/       agent skills, rules, subagents and hooks (see AGENTS.md)
├── next.config.ts          Next.js config (mock-CMS inlining, global 404, dist dir)
├── playwright.config.ts    E2E, accessibility and visual projects
├── vitest.config.ts        unit and component tests (node and jsdom projects)
├── vitest.perf.config.ts   the homepage budget against the production build
├── vitest.aliases.ts       module aliases and stubs shared by both Vitest configs
├── biome.json              lint and format rules, including import layering
└── knip.json               unused files, exports and dependencies
```

## `src/` layout

```text
src/
├── app/
│   ├── (site)/layout.tsx          site root layout: font, CSS, skip link, header, footer, SanityLive
│   ├── (site)/<route>/page.tsx    thin route: metadata + JSON-LD + the feature's page module
│   ├── studio/[[...tool]]/        Sanity Studio, its own root layout (no site shell or CSS)
│   ├── global-not-found.tsx       404 for unmatched URLs (there is no shared root layout)
│   └── api/                       public JSON API and draft-mode routes
├── features/<domain>/             one folder per page domain (see below)
├── components/
│   ├── ds/                        design system, imported only through `@/components/ds`
│   ├── shell/                     header, footer, skip link, header scroll logic
│   └── json-ld.tsx                the JSON-LD script tag
├── config/                        site facts, navigation and SEO
├── lib/                           cn, Sanity config, fetch layers and queries, content source, mock CMS,
│                                  time, security, redirects
├── sanity/                        Studio config (live + content workspaces), CLI config, schemas
├── styles/index.css               tokens, tones, cascade layers, utilities
├── proxy.ts                       host redirects (Next 16's replacement for middleware)
└── architecture.test.ts           the import-rule fitness test
```

### Routes and features

Every public route is a thin file in `src/app/(site)/` that imports exactly one page module from
its feature folder:

| Route | Page module | Data |
| --- | --- | --- |
| `/` | `features/home/home-page.tsx` (+ `home.css`) | static |
| `/apply` | `features/apply/apply-page.tsx` | static + content slice (FAQ), ISR 1 h (render date) |
| `/community` | `features/community/community-page.tsx` | static |
| `/events` | `features/events/events-page.tsx` (+ `events.css`) | Sanity, ISR 5 min |
| `/e-lab` | `features/e-lab/e-lab-page.tsx` (+ `e-lab.css`) | static + content slice (FAQ), ISR 5 min (application phase) |
| `/partners` | `features/partners/partners-page.tsx` (+ `partners.css`) | Sanity, ISR 15 min |
| `/projects` | `features/projects/projects-page.tsx` (+ `projects.css`) | static |
| `/qanda` | `features/qanda/qanda-page.tsx` | static |
| `/research` | `features/research/research-page.tsx` (+ `research.css`) | Sanity, ISR 15 min |
| `/imprint`, `/data-privacy`, `/disclaimer` | `features/legal/*-page.tsx` | static |
| `/design-system` | `features/design-system/design-system-page.tsx` | dev and Vercel previews only; 404 in production |
| `/studio` | `app/studio/[[...tool]]/page.tsx` | the embedded Studio: `/studio/live`, `/studio/content` |

A feature folder holds everything that belongs to one page domain:

```text
src/features/<domain>/
├── <domain>-page.tsx      the page component the route renders (one <main>)
├── *.tsx | sections/      sections and small "use client" islands
├── data/                  static copy for this domain (.ts, no JSX); the code fallback of a slice
├── content.ts             optional content slice: CMS or code content for this page (server only)
├── *.ts                   domain logic (for example partners/partnerships.ts)
├── *.test.ts(x)           colocated unit and component tests
├── <domain>.css           page CSS, only when unavoidable; imported by the route
└── index.ts               optional: what other features may use; never a page
```

Feature indexes exist today for `community` (`departments`, `memberJourney`, `memberStories`,
`MembershipApplyButton`), `e-lab` (`testimonialCards`, `getTestimonialCards`), `partners`
(`marqueeLogos`, `partnerPitch`, `symbolOnlyLogos`, the directory helpers
`getHighlightedPartners`, `getPartnerDirectory`, `getPartnerKey`, the organisation table's
`organizationByKey` and `buildOrganizationBackfill`, and the content getters
`getPartnerCaseStudies`, `getPartnersCopy`, `getPartnerLogos`), `qanda` (`faqs`) and
`research` (`rexInstitutions`). The `e-lab` and `partners` indexes export server-only getters,
so only server modules may import them; the `community` and `research` indexes are reachable
from a homepage client island and export no getters.

## Import rules

| Module | May import |
| --- | --- |
| `app`, `src/*.ts` | `features/<x>/<name>-page.tsx` and page `.css`, components, config, lib, sanity, styles, app |
| `app/studio` | sanity, lib (no site shell, CSS or features) |
| `features/<x>` | its own files except `.css`, `features/<y>` through its `index.ts`, `components/{ds,shell}`, `components/json-ld`, config, lib |
| `features/<x>/index.ts` | its own feature's files except pages |
| `components/ds` | its own files and `lib/cn` |
| `components/shell` | its own files, ds, config, lib |
| `components/*.tsx` | ds, config, lib |
| `config` | config, lib |
| `lib` | lib |
| `sanity` | sanity, lib |

Why routes import page modules and indexes never re-export pages: Turbopack keeps every
re-exported module that has client islands or a CSS import, even when the importer uses none of
its exports. When pages were exported from feature indexes, the homepage shipped the partners
page's islands (a 54 KB chunk) and `partners.css`, and the legal routes shipped the privacy table
of contents. See [ADR 0003](adr/0003-feature-folders.md).

Biome's `noRestrictedImports` repeats the rules it can express, so most violations show up in the
editor before the test runs.

## Two root layouts

The site and the Studio are separate root layouts:

- `app/(site)/layout.tsx` owns `<html>`, `<body>`, the Manrope font, `styles/index.css`, the skip
  link, `#app-root` (the isolated root that modals make inert), `#main-content`, the header,
  footer, `MotionProvider`, and `<SanityLive>` / `<VisualEditing>` when draft mode is on.
- `app/studio/[[...tool]]/layout.tsx` is the Studio's own document with next-sanity's metadata.
  It must never import the site shell or site CSS.
- With no shared root, Next would render unmatched URLs in a bare document, so
  `app/global-not-found.tsx` (behind `experimental.globalNotFound`) renders the 404 inside the
  site shell.

## Data flow

Events, research projects and partners come from Sanity's live dataset. Page content is moving
from Git to a second, content dataset, one content slice at a time (below and
[ADR 0009](adr/0009-cms-content-source.md)); until a slice exists and the source is switched, it
is static in Git: facts in `src/config/`, copy in `src/features/<domain>/data/`.

### The live dataset (events, research, partners)

1. **Schemas** in `src/sanity/schemas/` define the documents.
2. **Queries** in `src/lib/sanity-queries.ts` are wrapped in `defineQuery`. `pnpm sanity:typegen`
   writes `src/lib/sanity.types.generated.ts`, and `src/lib/types.ts` derives the app types from
   it ([ADR 0006](adr/0006-sanity-typegen.md)).
3. **The fetch layer** in `src/lib/sanity.ts` (`server-only`) exposes `getSanityEvents`,
   `getSanityResearchProjects`, `getSanityPartners` and friends. A failed fetch is logged and
   returns `[]`, so a CMS outage renders empty states instead of an error page. Without a project
   ID the getters return `[]` and make no request.
4. **Routes** fetch on the server, set `revalidate`, and pass plain props to the page module.
   Client islands only filter or animate what they receive.
5. **Live updates:** `<SanityLive>` in the site layout refreshes rendered pages when content
   changes.

### The content dataset (content slices)

1. **Config:** `lib/sanity-config.ts` names both datasets: `NEXT_PUBLIC_SANITY_DATASET` (live)
   and `NEXT_PUBLIC_SANITY_CONTENT_DATASET` (content, defaults to the live one).
2. **Schemas** in `src/sanity/schemas/content/`, registered only in the Studio's `content`
   workspace (`/studio/content`).
3. **Slices:** `features/<x>/content.ts` (server only) exports getters such as `getApplyFaqs()`
   and a `build<X>Backfill()`. A getter calls `loadContent` (`lib/cms-content.ts`): with
   `CMS_CONTENT_SOURCE=code` (the default) it returns the code fallback and makes no request;
   with `sanity` it runs the slice's `defineQuery` against the content dataset (published, CDN)
   and merges the result over the fallback (`mergeOverFallback` in `lib/cms-content-model.ts`),
   so a missing or empty value renders the code content. Facts inside copy are
   `{{placeholders}}` (`lib/content-tokens.ts`) filled from `config/content-tokens.ts`.
4. **Pages** await the getters in their server page component and pass plain props down.
5. **Backfill:** `pnpm sanity:backfill` turns every registered slice
   (`scripts/sanity/slices.ts`) into NDJSON for `sanity dataset import`; images point at the
   shipped files (`_sanityAsset`).
6. **Mock:** under `USE_MOCK_CMS=1` the `sanity` source queries the backfill documents with
   groq-js (`lib/cms-content-mock.ts`), and each slice's parity test checks that this renders
   exactly the code content.

No drafts, Presentation or `<SanityLive>` for this dataset yet: edits show when a page
revalidates.

### Mock CMS and previews

**Mock CMS.** With `USE_MOCK_CMS=1` at build time the getters serve fixtures from
`src/lib/mock-cms.ts`, dated relative to `MOCK_CMS_NOW` when it is set. `next.config.ts` inlines
the flag into server code, so a build without it contains no fixture code, and the gate is off on
Vercel regardless ([ADR 0005](adr/0005-mock-cms.md)).

**Draft preview.** Presentation in `/studio/live` calls `/api/draft-mode/enable`, which needs
`SANITY_API_READ_TOKEN` on the server (503 without it). The token never reaches the browser; an
optional, separate `SANITY_API_BROWSER_TOKEN` can enable live draft updates outside Presentation.
`/api/draft-mode/disable` leaves draft mode and redirects to same-origin paths only.

**Public API.** `/api/getNotes` (events; legacy name), `/api/getPartners` and `/api/getResearch`
are consumed outside this repo. They always serve the published perspective with their own frozen
queries, and successful responses are CDN-cacheable for five minutes. Pages don't call them.

## Configuration and facts

Facts that change per semester, cohort or year live once in `src/config/`
([ADR 0007](adr/0007-facts-in-config.md)):

| File | Holds |
| --- | --- |
| `site.ts` | site URL, name, tagline, `absoluteUrl()` |
| `organization.ts` | founding year, member figures, `brandMission`, legal entity, register number, representatives, office |
| `contact.ts` | role emails, `partnershipContact` (finder CC and booking page), social links |
| `community.ts` | community figures quoted in copy (Makeathon size), `yearsSinceFounding()` |
| `impact.ts` | research and hackathon record: publications, venues, hackathon participants |
| `e-lab.ts` | cohort, application URL, deadline (Munich time), program length, funding, the `selection` funnel, phase copy |
| `membership.ts` | recruiting: open flag, form URL and the current `round` (Munich dates), plus the schedule helpers (`roundSchedule`, `isMembershipApplicationOpen`, `applicationProgress`, `recruitingTimeline`) |
| `navigation.ts` | header, footer and legal links, `headerCtaSetting`, per-route header options |
| `seo.ts` | per-page metadata and JSON-LD, `rootMetadata` |
| `content-tokens.ts` | the values of the `{{placeholders}}` in editable copy, from the facts above |

`test/content-facts.test.ts` fails when page code types one of these facts in directly.

## Library modules

`src/lib` is the bottom layer (it imports only `lib`):

| Module | Holds |
| --- | --- |
| `cn.ts` | class-name merging for Tailwind |
| `sanity-config.ts` | project, live and content dataset, API version, Studio paths (browser-safe) |
| `sanity.ts`, `sanity-queries.ts`, `types.ts`, `omit-nulls.ts` | the live dataset: client, Sanity Live, page and public-API getters, queries, app types |
| `sanity.types.generated.ts` | TypeGen output for both workspaces (never edit) |
| `mock-cms.ts`, `mock-cms-env.ts` | live-dataset fixtures and the mock clock (`getCmsNow`) |
| `cms-content.ts` | the content source gate, content-dataset client, `fetchContent`, `loadContent` (server only) |
| `cms-content-model.ts` | `ContentImage`, the image projection, `toContentImage`, `mergeOverFallback` |
| `cms-content-mock.ts` | the content dataset under the mock CMS (groq-js over backfill documents) |
| `cms-backfill.ts` | backfill document ids and `_sanityAsset` images (Node only) |
| `content-tokens.ts` | `{{placeholder}}` names and filling |
| `faq-content.ts` | the `faq` type shared by several pages: query, getter, backfill |
| `people-and-logos.ts` | `Organization`, `LogoArtwork`, logo-list sections and person placements (isomorphic) |
| `organization-content.ts`, `person-content.ts` | the `organization`/`logoList` and `person` types shared by several pages: queries, getters, backfill builders (server only) |
| `munich-time.ts`, `words.ts` | Munich wall-clock parsing, lists and small numbers in running copy |
| `use-clock-switch.ts`, `use-media-query.ts` | client hooks |
| `security.ts`, `redirects.ts`, `public-api.ts` | safe external URLs, host redirects, public API responses |

## Styling

`src/styles/index.css` is the only global stylesheet: Tailwind v4 configured in CSS (`@theme`),
the brand scales, type scale, motion tokens and the `data-tone` surfaces. Every rule lives in a
cascade layer or an `@utility`, so utilities always win without `!important`
([ADR 0002](adr/0002-tone-tokens-and-cascade-layers.md)). Usage rules are in
[design-system.md](design-system.md).

## Build output and scripts

`scripts/sanity/` holds the CMS tooling: `backfill.ts` (`pnpm sanity:backfill`, run with tsx and
a tsconfig that stubs `server-only`), `slices.ts` (the backfill registry) and `merge-schemas.mjs`
(joins the two workspaces' schema extracts for TypeGen).

`pnpm dev` writes `.next-dev`; `pnpm build`, `pnpm start` and `pnpm typecheck` use `.next-prod`
through `scripts/run-next-command.mjs`, which leaves `NEXT_DIST_DIR` unset on Vercel. Before a
build, `scripts/next-artifacts.mjs` removes legacy dist dirs but never a running dev server's
output ([ADR 0008](adr/0008-dist-dir-isolation.md)).

## Deployment

Vercel deploys the repository root as one Next.js app (`vercel.json`). Preview deployments act as
staging for CMS changes and draft preview, and they render `/design-system`. `src/proxy.ts`
redirects every path on `join.tum-ai.com` to `/apply`.

## Tests

| Layer | Where | Runner |
| --- | --- | --- |
| Unit | `src/**/*.test.ts`, `test/*.test.ts` | Vitest `node` project |
| Component | `src/**/*.test.tsx`, `test/*.test.tsx` | Vitest `jsdom` project (Testing Library, axe) |
| Import rules | `src/architecture.test.ts` | Vitest |
| Homepage budget | `test/perf/homepage.perf.ts` | `pnpm test:perf`, after `pnpm build` |
| E2E, a11y, keyboard, motion, no-JS | `e2e/*.spec.ts` | Playwright |
| Visual | `e2e/visual.spec.ts`, baselines in `e2e/__screenshots__/linux/` | Playwright (`E2E_VISUAL=1`) |

Details, including what to test for each kind of change: [testing.md](testing.md).

## Known legacy names

- `/api/getNotes` returns events. The name is part of the public API and stays.
- `/assets/innovation/*` holds the project images; the feature is `projects`.
