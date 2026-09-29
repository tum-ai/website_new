# 0009: Page content in the site's one dataset, behind a source gate

- **Status:** Accepted (foundation; content moves slice by slice)
- **Date:** 2026-09-29 (#286, on the redesign branch #287); revised the same day from two datasets
  to one

## Context

Everything on the site except events, partners and research is typed into the repository: FAQs,
campaigns and application windows, logos, people, page copy. Editors need a pull request to change
a sentence or swap a logo. Issue #286 moves that content into Sanity.

Three constraints shape how:

- **The old site owns `production`.** The site on `main` embeds its own Studio at `/studio` and
  reads the `production` dataset, rendering every `event`, `partner` and `research` document it
  finds. Nothing may add documents or types there, or write to it at all, before the switch.
- **The free plan** allows two public datasets and no cross-dataset references. The project
  (`o9uuv2sq`) has `production` and `redesign`.
- **Nothing may change for visitors** until the content is migrated and reviewed, and a CMS outage
  or an empty field must never break a page.

A first version split the new site over two datasets (the live types in `production`, the page
content in a second one, with two Studio workspaces). It was replaced before launch by the model
below: one dataset is simpler for editors, needs no cross-dataset ids, and lets Presentation and
the Studio see everything in one place.

## Decision

### One dataset: `redesign`

**The new site reads one dataset, `redesign`, which holds everything it needs:**

- copies of the old site's content: every published `event`, `partner` and `research` document
  from `production`, with the same `_id`s (so the public API and links keep their ids) and their
  images, and the events' `hosts` filled from the co-host data in the repository;
- every page content type (FAQs, campaigns, application windows, logos, people, copy).

`NEXT_PUBLIC_SANITY_DATASET` names it (`lib/sanity-config.ts`), for the events, partners and
research (`lib/sanity.ts`), the page content (`lib/cms-content.ts`; both share
`sanityClientConfig`) and the Studio alike. The default when it is unset stays `production`,
because `main`'s deployments and the existing environments rely on it. The old site keeps reading
`production`, and nothing ever writes to it. At launch the new site's Vercel environment switches
to `redesign`.

**Page content never goes to `production`.** `datasetHoldsPageContent(dataset)` is false for
`production` only, and while the site runs on it (the default, or `main`):

- the Studio does not register the page content types, so nobody can create page content there;
- the `sanity` content source renders the code content (`loadContent` logs this once per server
  process) and makes no request;
- `pnpm sanity:backfill` refuses it as a target.

A campaign's featured event is a weak reference to the event, so the campaign never blocks
deleting the event (a deleted one leaves a dangling reference, which the site ignores: /events
pins the featured event only while it is among the upcoming events).

### The source gate

`CMS_CONTENT_SOURCE` (server only, read at render time; `lib/cms-content.ts`):

- `code` (default): every slice returns its code fallback and makes no request. This is the site
  as it was, byte for byte.
- `sanity`: slices query the site's dataset (published perspective, CDN, no token) and lay the
  result over the code fallback; on `production` they render the code content (above).
- Anything else throws, so a typo fails the build instead of silently serving code.

Pages are static or ISR, so a change takes effect with the next build or revalidation.

### The fallback merge

`mergeOverFallback(fallback, fetched)` (`lib/cms-content-model.ts`) decides per value:

- not set (`null`, missing, blank string, empty list): the code value;
- lists: replaced wholesale when the fetched list has items;
- plain objects (singletons, field groups): merged field by field, recursively; set fields the
  fallback lacks are added;
- images (`ContentImage`, objects with a `src`): atomic, never mixed with the code image. The
  Studio's image fields have `options.hotspot`, which also offers the crop tool; the crop is
  honoured, not ignored: `toContentImage` requests the cropped area from the CDN (`rect=`), states
  the cropped size, and measures the hotspot (`objectPosition`) within it;
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

### Partners are organisations

On every dataset but `production`, a partner is an `organization` with a `partnerTier`, not a
`partner` document. The organisation already held one company's name, link and logos for every
surface; the `partner` type repeated them, and its tiers lived only in code (`featuredPartners`),
so a tier set in the Studio never reached the homepage. The organisation's "Partnership" group
holds `partnerTier` (gold, silver, bronze, supporter; set means "is a partner"),
`partnerFeatured` ("lead its tier"), `partnerCategory` (the old site's five categories, for
/research and the API) and a hidden `legacyPartnerId`.

- **Code fallback:** `features/partners/data/organizations.ts` holds every partner: the 18
  highlighted ones with their tiers and the old site's 56 `partner` documents (54 companies) as
  supporters with their category, link and logo (`docs/asset-sources/partners.md`). MIT, a
  research partner, moved there from the REX list, which picks it by key.
- **Readers:** the organisation slice's `getPartners()` (`features/partners/server.ts`, tag
  `content:organization`) feeds /partners, the homepage hero and partner wall, and /research
  (the "Research Partners" category). The directory sorts by tier, "lead its tier", the launch
  brief's order (`partnerLaunchOrder`), then name.
- **Public API:** `/api/getPartners` keeps its frozen shape. On a dataset with page content it
  answers from the partner organisations (`PUBLIC_PARTNER_ORGANIZATIONS_QUERY`) with
  `id` = `legacyPartnerId`, the `_id` of the old `partner` document the organisation replaced,
  so consumers keep the ids they know; an organisation without one (a highlighted partner the old
  site never had, or a partner added since) answers with its own `_id`. While no organisation
  has a tier (before the migration) it answers from the copied `partner` documents, and on
  `production` it always does. IBM and CDTM had two `partner` documents each (one per category);
  each is one organisation now, so the API lists 54 partners instead of 56, and the merged
  documents' ids and categories are gone (IBM keeps "Research Partners", CDTM "Initiatives").
- **Studio:** `partner` stays registered on every dataset (the old site reads it on
  `production`; the migration and the API's fallback read the copies), but on the new site's
  dataset the desk hides it and offers no way to create one; "Partners" lists the organisations
  with a tier instead.
- **Migration:** `pnpm sanity:migrate-partners --dataset redesign` (`scripts/sanity/`; same
  target guard as the backfill, `production` refused) moves the copied `partner` documents onto
  organisations: per company it finds the organisation by key and sets only the fields it lacks
  (tier, category, featured, `legacyPartnerId`, and a website and light logo when missing), or
  creates the organisation from its code document (from the `partner` document when the code
  has none). Values an editor set on the `partner` document (tier, featured, category, link) win
  over the code's. An organisation that already has a `legacyPartnerId` gets no partnership
  fields again, so a tier an editor cleared stays cleared (a highlighted partner the old site
  never had has no such marker: a re-run gives it its code tier back). It is a dry run by default
  (public API, no token; the plan goes to `.sanity-backfill/<dataset>.partner-migration.json`);
  `--apply` carries that plan out through `sanity exec --with-user-token` with
  `createIfNotExists` and `setIfMissing` on the published document and its draft, uploading the
  code's logo files.

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

### Backfill by NDJSON import: the one migration command

`pnpm sanity:backfill --dataset redesign` fills the new dataset and writes
`.sanity-backfill/<dataset>.ndjson` (gitignored) with a count per type:

- **The code content.** Every builder registered in `scripts/sanity/slices.ts`. Documents have
  deterministic, public `_id`s (`[a-z0-9-]`; a `.` would make them private) from explicit keys in
  the code data (a FAQ's `id`, a milestone's, department's or person's `key`), never from visible
  text, so a copy edit in code finds the same document instead of adding a second one. Images use
  the import convention `{"_type":"image","_sanityAsset":"image@file://<abs path>"}`.
- **The copy from production** (`scripts/sanity/production-copy.ts`). Every published `event`,
  `partner` and `research` document, read from `production` over the public HTTP API (no token,
  read only; drafts and release versions are skipped), with the same `_id`s. Each image asset
  reference becomes `{"_type":"image","_sanityAsset":"image@<asset CDN URL>", ...}`, keeping
  hotspot and crop, so the import uploads the file into `redesign`. The events get `hosts` from
  `liveEventHosts` (`lib/mock-cms.ts`, derived from each event's CMS text), matched by title and
  start; an entry that matches no single event fails the run, and an event that already has its
  own `hosts` keeps them.

`--apply` runs `sanity dataset import` with the editor's CLI login, which uploads the files: no
write token in the repository or CI.

- `--apply` imports with `--missing`: it creates the documents the dataset lacks and **never
  touches an existing one**, so running it again after editors started is safe. A re-run before
  launch adds what code gained since and the events, partners and research projects added to
  `production` since; **edits in `production` to documents already copied are not copied again**
  (without `--overwrite`). That is intended: from the first import on, `redesign` is the source of
  truth, and an edit made on the old site after it has to be repeated in the new Studio.
- `--apply --overwrite` imports with `--replace`: **every existing document with an id in the file
  is replaced by the code content or the copy from `production`, and the editors' edits to it are
  lost.** It prints a warning and waits 10 seconds before it starts. Use it only on a dataset
  nobody has edited, or to reset one on purpose.
- Around either import, a recovery step (`scripts/sanity/repair-assets.ts`, through
  `sanity exec --with-user-token`) attaches the images an import left without a file. The import
  creates each document before it uploads its images, so a failed upload or an interrupted import
  leaves `{_type: "image"}`, and `--missing` would skip that document on every re-run. The
  dataset cannot tell that from an editor's Remove in the Studio (which keeps `alt`), so before
  the import the step records the images of the documents the import creates (every document
  with `--overwrite`) in a per-machine ledger, `.sanity-backfill/<dataset>.pending-assets.json`
  (gitignored); if that fails, nothing is imported. After the import, even a failed one, it
  uploads only the ledger's images that still lack a file and sets those `asset` references on
  the document and its draft, guarded by the revision. Entries drop once the image has its file
  or is gone; failed ones stay, so running the backfill again recovers without `--overwrite`,
  keeps the editors' edits and never restores an image an editor removed. Images an import left
  without a file before the ledger existed, or on another machine, are not repaired: attach them
  in the Studio.

**Content migrations.** `--missing` never updates a document that already exists, so a model
change that reshapes existing content ships a migration script instead:
`pnpm sanity:migrate-content-dedup --dataset redesign` (the content-dedup changes of #287: phase
durations, the partner figures' placeholders, the Q&A journey points, the campaigns' featured
event) prints each planned change as before and after; `--apply` writes it with the editor's CLI
login (`sanity exec --with-user-token`), drafts included, patching only fields that still hold
the value the backfill wrote and only at the revision it read. Like `--apply` above, it is a
maintainer's step, never part of a change.

`pnpm sanity:migrate-org-references --dataset redesign` (same pattern) gives the documents already
in the dataset the references to organisations that replaced names (#287): research
`institutions` from the names before the title's colon, event `coHosts` from `hosts`, the lab
sites' `organizations` from their alias strings, a person's `organization` and position from a
role's "@ Company" (`roleAtOrganization`), the task force's `work.partner` from its name, and it
deletes the `event-hosts` logo list, which nothing reads any more. Names match organisations by
`getPartnerKey` (with its aliases). It only fills empty fields; a document whose names don't all
find an organisation is left alone and listed (it never invents one), and it creates only the
logo-less institutions the change added to the code (TUM, TUM CAMP, LMU Klinikum, Helmholtz
Munich, IBM Almaden, IBM Research). On `production` nothing changes: the old site's types there
keep their string fields, and the Studio registers the reference fields only where the
`organization` type exists.

`--dataset` is required (no default), and `production` is always refused
(`scripts/sanity/backfill-target.ts`; there is no override). The script loads `.env.local` and
`.env` like Next, because the Sanity CLI runs from `src/sanity` and would not find them, needs
`NEXT_PUBLIC_SANITY_PROJECT_ID` (it reads `production` of that project), and prints the project
and dataset before it writes the file and before it imports. `test/cms-backfill.test.ts` checks
the registry (unique ids, registered types, required fields, existing files), the target guard,
and the copy on a trimmed snapshot of `production` (`test/fixtures/production-documents.json`):
assets converted, drafts skipped, hosts matched, `_id`s kept.

### The Studio

`src/sanity/sanity.config.ts` has one workspace at `/studio` (the catch-all route
`src/app/studio/[[...tool]]`) on `NEXT_PUBLIC_SANITY_DATASET`, with Presentation for draft
previews. On every dataset but `production` it registers the page content types too, with one desk
structure (`siteStructure` in `src/sanity/content-structure.ts`): Events (latest first), Partners
(the organisations with a partner tier; the `partner` type is hidden there) and Research projects,
then the pinned singletons (fixed `_id`, no create, duplicate or delete),
the application windows and campaigns, FAQs by page, logos and people, and every other type.
Stega's `studioUrl` is `/studio`. TypeGen extracts that one workspace (with a placeholder dataset
name, so the content types are included); there is nothing to merge.

## Consequences

- The `code` source is the default everywhere, so this change and every slice that follows ship
  without a visible difference until the environment flips.
- Drafts, Presentation's click-to-edit and live updates cover events and research only
  (`lib/sanity.ts`); the page content, partners included (they are organisations), is read without draft mode or `<SanityLive>` (follow-up:
  route `fetchContent` through `sanityFetch`, with stega kept off the values the pages validate).
  Content edits appear when a page revalidates, which the Sanity webhook on `/api/revalidate`
  triggers on publish by expiring the changed type's `content:<type>` tag (static routes
  included). As a safety net for a missed delivery, the site layout sets `revalidate = 3600`: every route renders again at
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
- Nothing here changes `main`'s Studio or `production`: until launch, editors keep using the old
  site's Studio for events, partners and research, and the backfill's re-run before launch copies
  what they added.

### Risks

- **Legal text stays in code.** Imprint, privacy and disclaimer, and `legalEntity`, are not moved:
  their wording needs the board, and a CMS edit would bypass review.
- **Editor permissions.** The Studio uses the project's roles; the free plan has no per-dataset
  roles, so anyone who can edit in the project can edit page content and both datasets. Review
  who has access before launch.
- **Placeholders are a contract.** Renaming one breaks CMS text that uses it (the entry is
  dropped and logged); names are append-only.
- **Two copies of the old site's content until launch.** Edits made in `production` after the
  first import do not reach `redesign` (only new documents do, on a re-run). Ask editors to hold
  event, partner and research edits between the last re-run and the switch, or to repeat them in
  the new Studio. For partners the migration adds only what an organisation lacks, so a tier or
  category changed in `production` after it ran has to be changed on the organisation.

## Launch runbook

The Studio is at `/studio`; it edits whatever `NEXT_PUBLIC_SANITY_DATASET` names. `redesign`
exists (public) and already holds the page content from the first backfill.

1. **Backfill.** `pnpm sanity:backfill --dataset redesign` (a dry run; needs
   `NEXT_PUBLIC_SANITY_PROJECT_ID`; in the Claude sandbox, unsandboxed), review
   `.sanity-backfill/redesign.ndjson` and the per-type counts (the code content plus `event`,
   `partner` and `research` copied from `production`), then
   `pnpm sanity:backfill --dataset redesign --apply`. It imports everything in one file, so the
   references between documents (logo lists, testimonials, the traced venture, the homepage
   quotes, the journey evidence) resolve; asset files upload with the import (a re-run on the
   same machine attaches any whose upload failed; keep `.sanity-backfill/` between runs). It creates missing
   documents only (`--missing`); never add `--overwrite` once editors have started, because it
   replaces their documents. **Re-run it right before launch** to copy the events, partners and
   research projects added to `production` since (edits to copied ones are not re-copied).
   Then move the partners onto organisations: `pnpm sanity:migrate-partners --dataset redesign`
   (a dry run; review the plan it prints), then the same with `--apply`. Run it again after the
   re-run before launch, for partners added since; it only fills what is missing.
   `redesign` was filled before the content-dedup changes: run
   `pnpm sanity:migrate-content-dedup --dataset redesign` (dry run), then with `--apply`, once
   (see "Content migrations"). Then, after the partner migration,
   `pnpm sanity:migrate-org-references --dataset redesign` (dry run; check the unmatched names it
   lists), then with `--apply`; run it again after the re-run before launch, for events and
   research copied since.
2. **Review.** Editors review and correct the content at `/studio` on a preview deployment with
   `NEXT_PUBLIC_SANITY_DATASET=redesign` (or locally with it in `.env.local`): the Site settings
   and both Application windows first (the open `TODO(content)` facts: the E-Lab window's open
   switch and next window, the membership round's placeholder dates, the selection funnel), then
   Campaigns, the page singletons, the lists, Logos and people, and the events' co-hosts. Open the
   Studio in a real browser once: the pinned documents, the references' pickers and the date
   fields have only been checked by schema extraction.
3. **Vercel env.** On **Preview**: `NEXT_PUBLIC_SANITY_DATASET=redesign` and
   `CMS_CONTENT_SOURCE=sanity`, then redeploy (the dataset is inlined at build, the source is read
   on the server at render, and static routes render at build); check the preview. At launch, set
   both on **Production** and redeploy.
4. **Webhook.** So edits show on the next request instead of within the pages' `revalidate`
   windows (up to an hour):
   1. Generate a secret (`openssl rand -hex 32`) and set it as `SANITY_REVALIDATE_SECRET` on
      Vercel **Preview** and **Production**; redeploy. Until it is set, `/api/revalidate`
      answers 503.
   2. In sanity.io/manage, project, API, Webhooks, create a GROQ webhook: name "Revalidate site
      (redesign)", URL `https://<production domain>/api/revalidate`, dataset `redesign`, trigger
      on create, update and delete, filter empty (every type), projection `{_type}`, HTTP method
      POST, API version `v2025-02-19` or later, drafts and versions **off**, and the secret from
      step 1.
   3. Publish a small edit and check the webhook's attempt log in sanity.io/manage: 200 with the
      tags it expired. 401 means the secret differs; 503 means the env var is missing on that
      deployment.

   Preview deployments are not covered (the webhook points at production); they refresh on their
   `revalidate` timers or a redeploy. Without the webhook, a content edit shows within 5 minutes
   on `/e-lab` and `/events`, 15 minutes on `/partners` and `/research`, and within an hour
   everywhere else (the layout's `revalidate = 3600`).
5. **CORS.** Add the Vercel preview and production domains as Sanity CORS origins with
   credentials allowed (sanity.io/manage, API, CORS origins); the embedded Studio needs them. Today
   only `http://localhost:3333`, `http://localhost:3000` and
   `https://website-softdevtumai-tum-ai.vercel.app` are allowed.

## Sources

- #286 (move hard-coded content to Sanity), #287 (redesign)
- `lib/sanity-config.ts`, `lib/cms-content.ts`, `lib/cms-content-model.ts`,
  `lib/cms-content-mock.ts`, `lib/cms-backfill.ts`, `lib/content-tokens.ts`,
  `lib/faq-content.ts`, `lib/mock-cms.ts` (`liveEventHosts`), `src/sanity/sanity.config.ts`,
  `src/sanity/content-structure.ts`, `scripts/sanity/` (`production-copy.ts`)
- [cms-content-inventory.md](../cms-content-inventory.md): what moves, when and by whom
