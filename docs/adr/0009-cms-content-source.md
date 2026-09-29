# 0009: Page content from a second dataset, behind a source gate

- **Status:** Accepted (foundation; content moves slice by slice)
- **Date:** 2026-09-29 (#286, on the redesign branch #287)

## Context

Everything on the site except events, partners and research is typed into the repository: FAQs,
campaigns and application windows, logos, people, page copy. Editors need a pull request to change
a sentence or swap a logo. Issue #286 moves that content into Sanity.

Three constraints shape how:

- **The old site shares the dataset.** The site on `main` embeds its own Studio at `/studio` and
  reads the `production` dataset, rendering every `event`, `partner` and `research` document it
  finds. The redesign must keep showing that live data, and nothing may add documents of those
  types or write to `production` before the switch.
- **The free plan** allows two public datasets and no cross-dataset references. The project
  (`o9uuv2sq`) has only `production` today.
- **Nothing may change for visitors** until the content is migrated and reviewed, and a CMS outage
  or an empty field must never break a page.

## Decision

### Two datasets

- `NEXT_PUBLIC_SANITY_DATASET` (`production`) stays the **live dataset**: `event`, `partner`,
  `research`, read by `lib/sanity.ts` with draft mode, Presentation and `<SanityLive>` as before.
- `NEXT_PUBLIC_SANITY_CONTENT_DATASET` (planned `redesign`) is the **content dataset** for the new
  types. It has **no default**: unset, blank or naming the live dataset, there is no content
  dataset, so the Studio has no `content` workspace and the `sanity` source renders the code
  content (`loadContent` logs this once per server process). Nothing ever falls back to the live
  dataset, which the old site renders and where a Publish in `/studio/content` would otherwise
  land. Both live in `lib/sanity-config.ts`.
- References between the datasets are plain strings (for example a campaign's featured event is
  the event's `_id`), because cross-dataset references need a paid plan.

### The source gate

`CMS_CONTENT_SOURCE` (server only, read at render time; `lib/cms-content.ts`):

- `code` (default): every slice returns its code fallback and makes no request. This is the site
  as it was, byte for byte.
- `sanity`: slices query the content dataset (published perspective, CDN, no token) and lay the
  result over the code fallback.
- Anything else throws, so a typo fails the build instead of silently serving code.

Pages are static or ISR, so a change takes effect with the next build or revalidation.

### The fallback merge

`mergeOverFallback(fallback, fetched)` (`lib/cms-content-model.ts`) decides per value:

- not set (`null`, missing, blank string, empty list): the code value;
- lists: replaced wholesale when the fetched list has items;
- plain objects (singletons, field groups): merged field by field, recursively; set fields the
  fallback lacks are added;
- images (`ContentImage`, objects with a `src`): atomic, never mixed with the code image;
- whole groups (`whole(group)` from a slice's `select`): fields that describe one thing (a quote
  and its person, the traced venture and its story, the booking page and its host) are taken
  complete or not at all, so a CMS quote is never attributed to the code person;
- primitives: the fetched value when its type matches.

So a failed request, an empty collection or a half-filled singleton renders the code content for
whatever is missing. The cost: the CMS cannot clear a value that code fills; remove it from the
fallback instead.

### Links, ids and scripts from the CMS

CMS values that become links, element ids or script sources are checked on the page, not only in
the Studio (a document can be written without the Studio's rules), with the helpers in
`lib/security.ts` and `lib/page-anchors.ts`; a value that fails keeps the code value or drops the
item:

- links inside the site (home programs, partner pillars, Q&A evidence) must resolve to the site's
  origin (`getSafeSitePath`: `//host`, backslashes and tabs are refused); links out
  (organisation websites, Q&A evidence, the traced venture's sources) must be `https:`
  (`isHttpsUrl`);
- the partnership booking page must be a Cal page on `cal.eu` or `cal.com` (`getCalBooking`),
  because the dialog loads the embed script from its origin;
- a Q&A anchor id must be well formed, unique and not an id the layout or /qanda renders
  (`reservedQandaIds`), because it is the question's element id.

### Content slices

Each domain owns a slice next to its data: `features/<x>/content.ts` (or
`config/<x>-content.ts` for facts), server only, exporting typed getters (`getApplyFaqs()`), and
`build<X>Backfill()`. Queries use `defineQuery` so TypeGen types them. Types shared by several
features (the `faq` type) keep their shared part in `lib` (`lib/faq-content.ts`), with the
fallback passed in. Schemas live in `src/sanity/schemas/content/`.

Facts that copy states (recruiting dates, deadlines, role emails) stay derived: the text holds a
`{{placeholder}}` (`lib/content-tokens.ts`), filled per render from `await getContentTokens()`
(`config/content-tokens.ts`, which reads the `siteSettings` singleton and the application
windows), in code and CMS text alike. The Studio validates the names; an unknown one drops that
entry. Facts a page renders outside copy come from `await getSiteFacts()`; client islands get
them as props. Server-only slices reach other features through a feature's `server.ts` entry,
never its isomorphic `index.ts` (`src/architecture.test.ts`).

### Mock and parity

With `USE_MOCK_CMS=1` and `CMS_CONTENT_SOURCE=sanity`, `fetchContent` evaluates the real GROQ
query with groq-js over the slice's backfill documents, their `_sanityAsset` images turned into
`sanity.imageAsset` documents whose `url` is the shipped `/assets/...` path and whose dimensions
are read from the file. The module and groq-js (a devDependency) load behind the same build-time
gate as `lib/mock-cms.ts`. Each slice has a **parity test**: under the mock, the `sanity` source
returns exactly the `code` source's value. That proves the schema, backfill, query and mapping
lose nothing, and keeps E2E and visual runs deterministic.

Image sizes in the mock come from the file header, as Sanity reports them, not from sizes typed in
code: a slice whose code image states another size fails its parity test, which is the mismatch
production would show.

### Backfill by NDJSON import

`pnpm sanity:backfill --dataset redesign` runs every builder registered in
`scripts/sanity/slices.ts` and writes `.sanity-backfill/<dataset>.ndjson` (gitignored) with a
count per type. Documents have deterministic, public `_id`s (`[a-z0-9-]`; a `.` would make them
private) from explicit keys in the code data (a FAQ's `id`, a milestone's, department's or
person's `key`), never from visible text, so a copy edit in code finds the same document instead
of adding a second one. Images use the import convention
`{"_type":"image","_sanityAsset":"image@file://<abs path>"}`, so `--apply` runs
`sanity dataset import` with the editor's CLI login and uploads the files: no write token in the
repository or CI.

- `--apply` imports with `--missing`: it creates the documents the dataset lacks and **never
  touches an existing one**, so running it again after editors started is safe (it only adds
  what code gained since).
- `--apply --overwrite` imports with `--replace`: **every existing document with a backfill id is
  replaced by the code content, and the editors' edits to it are lost.** It prints a warning and
  waits 10 seconds before it starts. Use it only on a dataset nobody has edited, or to reset one
  on purpose.

`--dataset` is required (no default), and the live dataset is always refused: `production` and
the configured `NEXT_PUBLIC_SANITY_DATASET` (`scripts/sanity/backfill-target.ts`; there is no
override). The script loads `.env.local` and `.env` like Next, because the Sanity CLI runs from
`src/sanity` and would not find them, and prints the project and dataset before it writes the file
and before it imports. `test/cms-backfill.test.ts` checks the registry (unique ids, registered
types, required fields, existing files) and the target guard.

### Studio workspaces

`src/sanity/sanity.config.ts` has two workspaces, served by the one catch-all route
`src/app/studio/[[...tool]]`:

- `live` at `/studio/live`: the live dataset, the three existing types, Presentation.
- `content` at `/studio/content`: the content dataset, the content types, a structure that pins
  singletons (fixed `_id`, no create, duplicate or delete) and groups FAQs by page.

Sanity requires workspace base paths of equal depth, so `/studio` itself now redirects to the
first workspace, and stega's `studioUrl` points at `/studio/live`. TypeGen extracts both
workspaces and merges them (`scripts/sanity/merge-schemas.mjs`), so one generated file covers both
datasets; a type name used in both workspaces with different fields fails the merge.

## Consequences

- The `code` source is the default everywhere, so this change and every slice that follows ship
  without a visible difference until the environment flips.
- Drafts, Presentation and live updates cover the live dataset only; content edits appear when a
  page revalidates, which the Sanity webhook on `/api/revalidate` triggers on publish by
  expiring the changed type's `content:<type>` tag (static routes included). As a safety net
  for a missed delivery, the site layout sets `revalidate = 3600`: every route renders again at
  least hourly (the ISR routes keep their shorter windows), and pages stay prerendered at build.
- **Clock islands act on the window they were rendered with.** The header CTA, the membership
  and E-Lab phase switches and the apply buttons receive the application windows and campaigns
  as instants in their props and switch in the browser at those instants. If an editor moves a
  deadline, a page that has not regenerated yet still switches at the old instant, in the
  browser too; the webhook (or at the latest the hourly timer) regenerates it with the new one.
- Code fallbacks remain the source of truth for shape and the safety net for content, so they are
  kept up to date until the CMS content is reviewed; after launch they can shrink to minimal
  defaults, slice by slice.
- `test/content-facts.test.ts` guards literals in source files. Content that moves to the CMS is
  guarded instead by placeholders and parity tests; the fact patterns stay for code.
- Nothing here changes `main`'s Studio: until launch, editors keep using the old site's Studio for
  events, partners and research.

### Risks

- **Legal text stays in code.** Imprint, privacy and disclaimer, and `legalEntity`, are not moved:
  their wording needs the board, and a CMS edit would bypass review.
- **Editor permissions.** Both workspaces use the project's roles; the free plan has no
  per-dataset roles, so anyone who can edit events can edit page content. Review who has access
  before launch.
- **Placeholders are a contract.** Renaming one breaks CMS text that uses it (the entry is
  dropped and logged); names are append-only.
- **A second dataset doubles what editors must keep in sync** until the live types move too.

## Launch runbook

The Studio is at `/studio/content` (content dataset) and `/studio/live` (live dataset); `/studio`
redirects to `/studio/live`.

1. Create the content dataset: `sanity dataset create redesign --visibility public` (from
   `src/sanity`, logged in with `sanity login`).
2. `pnpm sanity:backfill --dataset redesign` (a dry run; in the Claude sandbox, unsandboxed),
   review `.sanity-backfill/redesign.ndjson` and the per-type counts, then
   `pnpm sanity:backfill --dataset redesign --apply`. It imports every slice in one file, so the
   references between them (logo lists, testimonials, the traced venture, the homepage quotes,
   the journey evidence) resolve; asset files upload with the import. It creates missing
   documents only (`--missing`); never add `--overwrite` once editors have started, because it
   replaces their documents with the code content.
3. Editors review and correct the content in `/studio/content` (locally with
   `NEXT_PUBLIC_SANITY_CONTENT_DATASET=redesign` in `.env.local`, or on a preview deployment with
   the env below; without it the workspace does not exist): the Site settings and both Application windows first (the
   open `TODO(content)` facts: the E-Lab window's open switch and next window, the membership
   round's placeholder dates, the selection funnel), then Campaigns, the page singletons, the
   lists and Logos and people. Open the Studio in a real browser once: the pinned documents, the
   references' pickers and the date fields have only been checked by schema extraction.
4. Vercel **Preview**: `NEXT_PUBLIC_SANITY_CONTENT_DATASET=redesign` and
   `CMS_CONTENT_SOURCE=sanity`, then redeploy (the source is read on the server at render, and
   static routes render at build); check the preview. At launch, set both on **Production** and
   redeploy.
5. Add the Vercel preview and production domains as Sanity CORS origins with credentials allowed
   (sanity.io/manage, API, CORS origins) if they are missing; the embedded Studio needs them.
6. Create the revalidation webhooks (the free plan allows two), so edits show on the next
   request instead of within the pages' `revalidate` windows (up to an hour):
   1. Generate a secret (`openssl rand -hex 32`) and set it as `SANITY_REVALIDATE_SECRET` on
      Vercel **Preview** and **Production**; redeploy. Until it is set, `/api/revalidate`
      answers 503.
   2. In sanity.io/manage, project, API, Webhooks, create a GROQ webhook for the content
      dataset: name "Revalidate site (redesign)", URL
      `https://<production domain>/api/revalidate`, dataset `redesign`, trigger on create,
      update and delete, filter empty (every type), projection `{_type}`, HTTP method POST, API
      version `v2025-02-19` or later, drafts and versions **off**, and the secret from step 1.
   3. Create the same webhook for the live dataset `production` (name "Revalidate site
      (production)"), so event, partner and research edits also refresh the static caches.
   4. Publish a small edit and check the webhook's attempt log in sanity.io/manage: 200 with
      the tags it expired. 401 means the secret differs; 503 means the env var is missing on
      that deployment.

   Preview deployments are not covered (one webhook per dataset, pointed at production); they
   refresh on their `revalidate` timers or a redeploy. Without the webhooks, a content edit
   shows within 5 minutes on `/e-lab` and `/events`, 15 minutes on `/partners` and
   `/research`, and within an hour everywhere else (the layout's `revalidate = 3600`).
7. After launch, fill `hosts` on the live events in `production` with the new Studio
   (`/studio/live`; see the `TODO(content)` in `lib/mock-cms.ts`).

## Sources

- #286 (move hard-coded content to Sanity), #287 (redesign)
- `lib/sanity-config.ts`, `lib/cms-content.ts`, `lib/cms-content-model.ts`,
  `lib/cms-content-mock.ts`, `lib/cms-backfill.ts`, `lib/content-tokens.ts`,
  `lib/faq-content.ts`, `src/sanity/sanity.config.ts`, `scripts/sanity/`
- [cms-content-inventory.md](../cms-content-inventory.md): what moves, when and by whom
