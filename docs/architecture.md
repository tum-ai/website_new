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
├── scripts/                dist-dir helpers; sanity/: production copy, targeted migrations, readiness and asset repair
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
│   └── api/                       public JSON API, draft-mode and revalidation routes
├── features/<domain>/             one folder per page domain (see below)
├── components/
│   ├── shell/                     site data adapters for @tum.ai/ui-kit/shell
│   └── json-ld.tsx                the JSON-LD script tag
├── config/                        site facts and their content slices, navigation, CTA labels, SEO
├── lib/                           cn, Sanity config, fetch layers and queries, content source and its
│                                  shared slices (FAQ, people and logos, community), copy filling,
│                                  mock CMS, time, security, redirects
├── sanity/                        Studio config (one workspace), desk structure, CLI config, schemas
├── styles/index.css               kit stylesheet imports and app-owned partner rotation
├── proxy.ts                       host redirects (Next 16's replacement for middleware)
└── architecture.test.ts           the import-rule fitness test
```

### Routes and features

Every public route is a thin file in `src/app/(site)/` that imports exactly one page module from
its feature folder:

| Route | Page module | Data |
| --- | --- | --- |
| `/` | `features/home/home-page.tsx` (+ `home.css`) | CMS content slices, ISR 1 h (layout) |
| `/apply` | `features/apply/apply-page.tsx` | CMS content slices, ISR 1 h (render date) |
| `/community` | `features/community/community-page.tsx` | CMS content slices, ISR 1 h (layout) |
| `/events` | `features/events/events-page.tsx` (+ `events.css`) | Sanity + content slices, ISR 5 min |
| `/hackathons` | `features/hackathons/hackathons-page.tsx` (+ `hackathons.css`) | Sanity events + content slice, ISR 5 min |
| `/e-lab` | `features/e-lab/e-lab-page.tsx` (+ `e-lab.css`) | CMS content slices, ISR 5 min (application phase) |
| `/partners` | `features/partners/partners-page.tsx` (+ `partners.css`) | content slices (partners are organisations), ISR 15 min |
| `/projects` | `features/projects/projects-page.tsx` (+ `projects.css`) | CMS content slice, ISR 1 h (layout) |
| `/qanda` | `features/qanda/qanda-page.tsx` | CMS content slices, ISR 1 h (layout) |
| `/research` | `features/research/research-page.tsx` (+ `research.css`) | Sanity + content slices, ISR 15 min |
| `/imprint`, `/data-privacy`, `/disclaimer` | `features/legal/*-page.tsx` | static, ISR 1 h (layout) |
| `/design-system` | `features/design-system/design-system-page.tsx` | dev and Vercel previews only; 404 in production |
| `/studio` | `app/studio/[[...tool]]/page.tsx` | the embedded Studio (one workspace on `NEXT_PUBLIC_SANITY_DATASET`) |

Every page also renders the site layout, whose header and footer read the site facts, the
membership window and the campaigns (`config/*-content.ts`).

A feature folder holds everything that belongs to one page domain:

```text
src/features/<domain>/
├── <domain>-page.tsx      the page component the route renders (one <main>)
├── *.tsx | sections/      sections and small "use client" islands
├── data/                  types and pure logic for this domain (.ts, no JSX)
├── content.ts             optional content slice: validated CMS content for this page (server only);
│                          more slices as <topic>-content.ts (people-content.ts, rex-content.ts)
├── *.ts                   domain logic (for example partners/partnerships.ts)
├── *.test.ts(x)           colocated unit and component tests
├── <domain>.css           page CSS, only when unavoidable; imported by the route
├── index.ts               optional: what other features may use, isomorphic; never a page
└── server.ts              optional: what other features may use on the server only; never a page
```

A feature has two optional entries for other features. `index.ts` is isomorphic: nothing it
reaches imports `server-only`, so any module, client islands included, may import it.
`server.ts` starts with `import "server-only"` and holds what reads the CMS content source: the
content getters and async server components. `src/architecture.test.ts`
enforces both, and fails when any `"use client"` module reaches a server-only module or a Node
built-in through any chain of imports (Turbopack would fail the production build on it).

| Feature | `index.ts` | `server.ts` |
| --- | --- | --- |
| `community` | `MembershipPhase` (the recruiting-window switch), types `JourneyStep`, `MemberStory` | `getMemberStories`, `getJourneyStages`, `memberStoryKey`, `MembershipApplyButton` |
| `e-lab` | | `getTestimonialCards` |
| `events` | `Lockup`, `SignUpAction`, `formatEventLocation`, `hostsBeyondTitle` (how /hackathons sets its events) | |
| `partners` | the directory helpers `getHighlightedPartners`, `getPartnerKey`; `PartnerRotationGrid` (the rotating partner wall, a client island without CSS: its styles are global, `styles/partner-rotation.css`) | `getPartners`, `getResearchPartners`, `getPartnersCopy` (the pitch), `getPartnerCaseStudies`, `getPartnerLogos` |
| `qanda` | | `faqs` (the design-system showcase) |
| `research` | | `getRexInstitutions` |

## Import rules

| Module | May import |
| --- | --- |
| `app` | `features/<x>/<name>-page.tsx` and page `.css`, components, config, lib, styles, app (not sanity or the studio) |
| `src/*.ts` (`proxy.ts`) | config, lib |
| `app/studio` | sanity, lib (no site shell, CSS or features) |
| `features/<x>` | its own files except `.css`, `features/<y>` through its `index.ts` or `server.ts`, `components/shell`, `@tum.ai/ui-kit`, `components/json-ld`, config, lib |
| `features/<x>/index.ts`, `server.ts` | its own feature's files except pages; an index reaches no server-only module |
| `components/shell` | its own files, `@tum.ai/ui-kit` and `/shell`, config, lib |
| `components/*.tsx` | `@tum.ai/ui-kit`, config, lib |
| `config` | config, lib |
| `lib` | lib |
| `sanity` | sanity, lib |
| `styles` | styles |

The design system is the exact dependency `@tum.ai/ui-kit@0.2.0`. Import primitives and public
types from its root and generic shell components from `@tum.ai/ui-kit/shell`. Kit internals are
private; shared primitive and token changes ship upstream before the app upgrades. Site-specific
content, CMS queries, routing, imagery and shell adapters stay here. See
[design-system.md](design-system.md) for the versioned public API and consumer contract.

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

Editable content comes from the explicitly selected page-content Sanity dataset,
`NEXT_PUBLIC_SANITY_DATASET=redesign` (`lib/sanity-config.ts`). Required page readers reject missing
configuration or the legacy `production` dataset. The shared legacy config still defaults to
production for existing consumers, but it does not supply page content. Production copy and
targeted maintainer tools are described in [ADR 0009](adr/0009-cms-content-source.md).
No source selector, local editable payloads, slice builders or backfill registry remain.

### Events and research projects

(Partners are organisations with a partner tier, read through the organisation content slice:
`getPartners()` through `features/partners/server.ts`; see ADR 0009, "Legacy CMS compatibility
and public APIs". The `partner` documents remain only for the old site, the migration and the
public API's fallback.)

1. **Schemas** in `src/sanity/schemas/` define the documents.
2. **Queries** in `src/lib/sanity-queries.ts` are wrapped in `defineQuery`. `pnpm sanity:typegen`
   writes `src/lib/sanity.types.generated.ts`, and `src/lib/types.ts` derives the app types from
   it ([ADR 0006](adr/0006-sanity-typegen.md)).
3. **The fetch layer** in `src/lib/sanity.ts` (`server-only`) exposes `getSanityEvents`,
   `getSanityResearchProjects` and the public-API getters. A failed fetch is logged and
   returns `[]`, so a CMS outage renders empty states instead of an error page. Without a project
   ID the getters return `[]` and make no request.
4. **Routes** fetch on the server, set `revalidate`, and pass plain props to the page module.
   Client islands only filter or animate what they receive.
5. **Live updates:** `<SanityLive>` in the site layout refreshes rendered pages when content
   changes.

### Page content (content slices)

Content schemas live under `sanity/schemas/content/` and register on page-content datasets.
Server-only slices call `loadContent` / `fetchContent` (`lib/cms-content.ts`) with the real GROQ,
params, tags, label and a runtime parser. Required singletons, site facts, application windows
and structural invariants fail visibly if missing or malformed. Optional lists can be empty;
optional text/images intentionally cleared by an editor stay empty. Arrays replace wholesale.
There is no local content merge and no per-item resurrection.

The owning server page or section awaits its reader and passes serializable props to islands.
Facts inside copy are `{{placeholders}}`, filled per render from `getContentTokens()`; page counts
use page tokens and `fillPageTokens`. Pages and editable fact-dependent metadata read the same
CMS facts rather than importing a stale constant.

Published page content updates through revalidation. Existing event/research draft and live
preview behavior remains; this architecture does not add drafts or live editing to page slices.
Mock readers evaluate the actual GROQ with groq-js over independent synthetic documents in
`lib/cms-fixtures/`. Mock CI is distinct from the real read-only readiness check.

### On-demand revalidation (`/api/revalidate`)

A Sanity GROQ webhook on the site's dataset (projection `{_type}`) posts every published change
to `POST /api/revalidate`. The route checks the `sanity-webhook-signature` header against
`SANITY_REVALIDATE_SECRET` with `parseBody` (`next-sanity/webhook`; 401 on a missing or wrong
signature, 503 while the secret is unset), waits about 3 seconds for the API CDN, and calls
`revalidateTag(tag, { expire: 0 })` for the type's tags (`lib/cache-tags.ts`): the event,
partner and research getter tags (`event` → `events`, `partner` → `partners`, `research` → `research-projects`), and
`content:<type>` for everything else. Every slice tags its query with `content:<type>` for each
type it reads, dereferenced ones included, and the event, partner and research getters use
`liveCacheTags`
(`test/cache-tags.test.ts` checks that every Studio type maps).

This reaches static routes too, without a route `revalidate` or fetch cache setting: Next
16.2 without Cache Components collects each fetch's `next.tags` onto the prerender it runs in
(`patch-fetch`), stores them with the prerendered page, and treats the page as expired once one
of its tags is revalidated, so the next request renders it again. The Sanity client passes
`next.tags` to Next's `fetch`. The layout's site-settings, window and campaign reads tag every
route, so a Site settings edit refreshes every page. Mock readers make no CMS request and
therefore attach no content fetch tags. Timer-stale ISR may keep an older render on a failed
refresh; cold, hard-expired and on-demand reads may propagate required-content errors.

**Hourly safety net.** The site layout exports `revalidate = 3600`, so every route renders again
at least hourly (shorter route values win). The webhook stays the mechanism; the timer bounds
the damage of a missed delivery and how long server-rendered, time-dependent parts (the header
CTA, the apply buttons) lag the clock.

**Clock islands.** The islands that switch at a date (the header CTA, `MembershipPhase`,
`ELabPhase`) get the window's instants as props and act on the window the page was rendered
with. An edited deadline reaches them only when the page regenerates (webhook, timer or deploy);
until then the browser switches at the old instant.

### Mock CMS and previews

**Mock CMS.** The literal gate `USE_MOCK_CMS=1 && !VERCEL` selects small synthetic CMS-shaped
fixtures in `lib/cms-fixtures/` plus event/research mocks in `lib/mock-cms.ts`. `next.config.ts`
inlines the gate at build time, and Vercel ignores it. The actual GROQ is evaluated with groq-js,
including references and image metadata. Set the flag for `pnpm build` or `pnpm dev`, not only
`pnpm start`. CI Build/perf and Playwright use `MOCK_CMS_NOW=2026-10-01T12:00:00Z`.
Fixture documents may use erased type-only imports from domain/config/lib types solely for
shape checks. Runtime fixture imports are limited to fixture modules, tests and
`lib/cms-content-mock.ts` / `lib/mock-cms.ts`. Production readers import these mock entrypoints
with `import()` only in the exact `if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL)`
true branch: `cms-content.ts` loads `cms-content-mock.ts`, and `sanity.ts` loads `mock-cms.ts`.
The architecture test rejects static production paths to either entrypoint or fixture documents.

**Draft preview.** Presentation in `/studio` calls `/api/draft-mode/enable`, which needs
`SANITY_API_READ_TOKEN` on the server (503 without it). The token never reaches the browser; an
optional, separate `SANITY_API_BROWSER_TOKEN` can enable live draft updates outside Presentation.
`/api/draft-mode/disable` leaves draft mode and redirects to same-origin paths only.

**Revalidation.** `/api/revalidate` takes the Sanity webhook (see "On-demand revalidation"
above).

**Public API.** `/api/getNotes` (events; legacy name), `/api/getPartners` and `/api/getResearch`
are consumed outside this repo. They always serve the published perspective with their own frozen
queries, and successful responses are CDN-cacheable for five minutes. Pages don't call them.

## Configuration and facts

Editable facts have one CMS owner: `siteSettings`, the membership and E-Lab application
windows, or campaigns. `config/site-facts.ts` and domain config modules hold types and derivation;
`site-settings-content.ts`, `schedule-content.ts` and `content-tokens.ts` read the render's values.
League facts/references are in `siteSettings.hackathons`. Required facts are validated at runtime.

Legal wording/identity/addresses, canonical URLs, SEO structure, navigation, standing CTA labels,
private partnership CC addresses and interface/date grammar remain reviewed code concerns.
Fact-dependent page copy and metadata use CMS facts. See `site-facts` and
[cms-content-inventory.md](cms-content-inventory.md) for ownership.

## Library modules

`src/lib` is the bottom layer (runtime imports stay in `lib`; fixtures have the type-only exception below):

| Module | Holds |
| --- | --- |
| `cn.ts` | class-name merging for Tailwind |
| `sanity-config.ts` | project, the one dataset, the shared client config, whether it holds page content, API version, Studio path (browser-safe) |
| `sanity.ts`, `sanity-queries.ts`, `types.ts`, `omit-nulls.ts` | events and research: client, Sanity Live, page and public-API getters (the partners' too), queries, app types (`Partner` included) |
| `sanity.types.generated.ts` | TypeGen output for the Studio's schema (never edit) |
| `mock-cms.ts`, `mock-cms-env.ts` | event and research synthetic fixtures, the mock clock (`getCmsNow`) |
| `cms-content.ts` | the published CMS client and literal mock gate, `fetchContent`, `loadContent` (server only) |
| `cms-content-model.ts` | `ContentImage`, the image projection, `toContentImage`, runtime content errors/validation |
| `cms-content-mock.ts` | actual GROQ evaluation over independent CMS-shaped synthetic fixtures |
| `cms-fixtures/` | synthetic local-only settings, organizations, community, programmes and hackathon documents |
| `content-tokens.ts` | `{{placeholder}}` names and filling |
| `cache-tags.ts` | the Next cache tags per Sanity type (`liveCacheTags`, `content:<type>`), for the getters and `/api/revalidate` |
| `content-copy.ts` | filling whole copy objects: `fillCmsCopy`, page tokens (`fillPageTokens`) |
| `faq-content.ts` | the `faq` type shared by several pages: query and validated getter |
| `community-model.ts`, `community-content.ts` | the member journey and departments, shared by /community, /apply and the homepage: types (isomorphic), queries and validated getters (server only) |
| `passage-spans.ts` | the /qanda mission passage's answer spans, shared by the page and the Studio |
| `people-and-logos.ts` | `Organization`, `LogoArtwork`, logo-list sections and person placements (isomorphic) |
| `organization-content.ts`, `person-content.ts` | the `organization`/`logoList` and `person` types shared by several pages: queries and validated getters (server only) |
| `munich-time.ts`, `words.ts` | Munich wall-clock parsing and CMS date conversion, lists and small numbers in running copy |
| `clock-window.ts` | `ClockWindow`: a dated on/off window as epoch milliseconds, the props shape for phase islands |
| `use-clock-switch.ts`, `use-media-query.ts` | client hooks (`useClockState`, `useClockSwitch`, `useClockWindow`) |
| `security.ts`, `redirects.ts`, `public-api.ts` | safe external URLs, host redirects, public API responses |

## Styling

`src/styles/index.css` imports Tailwind v4, the pinned kit `tailwind.css` and `shell.css`,
and app-owned `partner-rotation.css`. The kit owns brand scales, type scale, motion tokens,
`data-tone` surfaces and shared utilities. The site keeps its Next.js Manrope font loader.
App and route CSS lives in cascade layers or `@utility`, so utilities win without `!important`
([ADR 0002](adr/0002-tone-tokens-and-cascade-layers.md)). Usage rules are in
[design-system.md](design-system.md).

## Build output and scripts

`scripts/sanity/` holds create-only production copy, targeted partner/reference/dedup/single-source
migrations, real read-only readiness and independent asset repair. Ledger and migration helpers
live here, outside runtime imports. Production is rejected as a target. Commands default to dry
run/read-only; `--apply` is a separately authorized maintainer launch action. Preserve pending
asset sources and the matching upload cache/repair ledger until authorized links are confirmed.
Focused migration uses `single-source-assets.json` for source-path/digest upload retries; historical
`pending-assets.json` belongs only to asset repair. CMS completion receipts atomically accompany
focused target mutations and preserve later editor deletion/unset. Draft visibility is unknown
without authenticated raw preflight; projected readiness does not certify draft safety.
The runbook and evidence boundaries are in ADR 0009.

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
