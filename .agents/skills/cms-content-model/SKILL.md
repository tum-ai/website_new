---
name: cms-content-model
description: End-to-end recipe for changing the Sanity content model of the TUM.ai website (events, research projects, partners, a page content type such as faq, or a new document type), and for moving hard-coded content into the CMS as a content slice. Use whenever a task adds, renames or removes a CMS field or type, changes a GROQ query or projection, touches Sanity TypeGen output, the mock CMS fixtures, a content slice (`content.ts`, `build*Backfill`, `scripts/sanity/slices.ts`), or the public /api/getNotes, getPartners or getResearch responses, even if it looks like "just show one more field on the events page".
---

# Change the CMS content model

One dataset, `NEXT_PUBLIC_SANITY_DATASET` (`redesign` for the new site), two recipes
(docs/adr/0009-cms-content-source.md):

- **The old site's types** (`event`, `partner`, `research`; `redesign` holds copies of the
  documents in `production`, which the old site on `main` reads): steps 1 to 7 below. Never add
  a type to `schemas/index.ts`: the Studio registers those on `production` too.
- **Page content types** (content moving out of code: FAQs, campaigns, logos, people, copy): the
  "Content slices" section at the end. The Studio registers them on every dataset except
  `production`.

Sanity data crosses five layers, and each one fails differently when it drifts: the Studio schema,
the GROQ query, the generated types, the mock fixtures used for local work and E2E, and the UI.
Change them in this order and keep each step green.

## 1. Schema

Edit an event, partner or research field in `src/sanity/schemas/` (`defineType`, `defineField`;
registered in `src/sanity/schemas/index.ts`). New document types are page content types instead
(see "Content slices"). Enumerated fields use `options.list` so TypeGen emits a union. Check it
in the Studio: `pnpm dev`, then `/studio` (needs the Sanity env vars from Vercel;
`NEXT_PUBLIC_SANITY_DATASET=redesign` for the page content types too).

A new field on these types starts empty in `redesign` and in `production`: the backfill copies
documents as they are (`scripts/sanity/production-copy.ts`), so fill it in the Studio or, before
launch, add it to the copy (as `hosts` is, from `liveEventHosts` in `lib/mock-cms.ts`).

Removing or renaming a field breaks existing documents and the public API: keep the old field
readable (or alias it in the projection) until the content is migrated.

## 2. Query

Update the projection in `src/lib/sanity-queries.ts`. Wrap queries in `defineQuery` so TypeGen can
type them. Project exactly what the UI needs, with stable aliases
(`"id": _id`), `coalesce` for optional text, and arrays kept as arrays (don't join to strings).
Filter in GROQ, not in route code.

## 3. Types

Run `pnpm sanity:typegen`. It writes `src/lib/sanity.types.generated.ts`; never edit that file by
hand (a hook blocks it), and commit it with the change: CI's Typecheck job fails when it is stale
(`pnpm sanity:typegen:check`). `src/lib/types.ts` derives the app types from the generated ones;
adjust it only when the app shape itself changes.

## 4. Mock fixtures

Update `src/lib/mock-cms.ts` so every fixture matches the new projection, including edge cases
the UI must handle (missing image, long text, each enum value, past and upcoming dates relative
to `now`). Fixtures use shipped `/assets/...` files, neutral links and no personal data.
`USE_MOCK_CMS=1 pnpm dev` shows them; E2E runs on them with `MOCK_CMS_NOW=2026-10-01T12:00:00Z`
(the fixtures' dates are relative to it, see `src/lib/mock-cms-env.ts`).

## 5. Tests

- `src/lib/sanity-queries.test.ts`: evaluate the query with groq-js against sample documents,
  including a document missing the new field.
- `src/lib/mock-cms.test.ts`: fixtures still cover every filter and state.
- Domain logic that uses the field (for example `src/features/events/events.ts`): unit tests.

## 6. UI and API

- Pages receive the data from the server route and pass plain props to islands. Handle the empty
  and missing-field cases visibly (for example `EmptyState` or a brand placeholder).
- `/api/getNotes` (events), `/api/getPartners`, `/api/getResearch` are a public API used outside
  this repo, with their own frozen `PUBLIC_*` queries: additions are fine, but don't remove or
  rename response fields without a migration note in the PR.

## 7. Verify

```bash
pnpm lint && pnpm typecheck
pnpm exec vitest run src/lib/sanity-queries.test.ts src/lib/mock-cms.test.ts <domain tests>
```

CI runs the full suite, the TypeGen freshness check, the build and the E2E specs for the routes
that show the data.

Check the draft preview when the change affects what editors see: open `/studio`, use
Presentation, edit a draft and confirm the page updates (needs `SANITY_API_READ_TOKEN`).

## Content slices (moving hard-coded content into the CMS)

A slice is one `content.ts` module that serves a domain's content from code or from the CMS. The reference is the FAQ slice: `src/features/apply/content.ts`,
`src/features/apply/data/faq.ts`, `src/lib/faq-content.ts`,
`src/sanity/schemas/content/faq.ts`, `src/features/apply/content.test.ts`. The APIs are in
`src/lib/cms-content.ts` (`loadContent`, `fetchContent`, `getContentSource`),
`src/lib/cms-content-model.ts` (`ContentImage`, `CONTENT_IMAGE_PROJECTION`, `toContentImage`,
`mergeOverFallback`), `src/lib/cms-backfill.ts` (`backfillId`, `backfillImage`),
`src/lib/content-tokens.ts` (`{{placeholders}}`), `src/lib/content-copy.ts` (`fillCodeCopy`,
`fillCmsCopy`, page tokens with `fillPageTokens`), `src/lib/content-backfill.ts`
(`backfillContentImage`, `keyedItems`) and the Studio field builders in
`src/sanity/schemas/content/copy-fields.ts` (`copyString`, `copyText`, `copyStringList`,
`orderField`; limits, placeholders and page tokens). Page copy singletons follow
`src/features/apply/content.ts` (`applyCopy`); people and logos follow
`src/lib/person-content.ts` and `src/lib/organization-content.ts`. What moves, and who owns it:
`docs/cms-content-inventory.md`.

Nothing a visitor sees may change: `CMS_CONTENT_SOURCE` defaults to `code`, and the parity test
proves the CMS path renders the same.

1. **Code fallback.** Keep the content in `src/features/<x>/data/` (copy) or `src/config/`
   (facts), shaped exactly as the page renders it: images as `ContentImage` (`src`, intrinsic
   `width`/`height` of the file, `alt`, optional `objectPosition` as `"<x>% <y>%"`), icons as a
   string key mapped to a Lucide component in the component, facts in copy as `{{name}}`
   placeholders kept in the template. The slice fills them per render with
   `await getContentTokens()` (`fillCodeCopy(template, tokens, pageTokens)` for the fallback);
   never fill a template at module load with the `contentTokens` constant, which would freeze
   the code facts and, in a `data/` file, pull the server-only token source into client
   bundles. A new placeholder goes into `contentTokenNames` (`lib/content-tokens.ts`) and
   `contentTokensFor` (`config/content-tokens.ts`) together; never rename one. A figure only the
   page knows (a count of what it renders) is a page token: list it in the copy's
   `<page>PageTokens`, declare it on the field (`pageTokens` in `copy-fields.ts`) and fill it in
   the section with `fillPageTokens`.
2. **Schema.** `src/sanity/schemas/content/<type>.ts` with `defineType`/`defineField`;
   `Rule.required()` on what the page cannot do without; enums with `options.list`; images with
   `contentImageField` and text with facts with `validatePlaceholders` + `placeholderHelp`
   (`./fields.ts`); an `order` number for editor-sorted lists. Register it in
   `schemas/content/index.ts` (singletons also in `contentSingletons`: one document whose `_id`
   is the type name). Never in `schemas/index.ts`: those types are registered on `production`
   too. A campaign's featured event is the event's `_id` as a string, so it never blocks
   deleting the event.
3. **Slice.** `src/features/<x>/content.ts` (a second slice in the same feature:
   `<topic>-content.ts`; facts: `src/config/<x>-content.ts`), starting with
   `import "server-only"`:
   - the query with `defineQuery`, filtered and ordered in GROQ, images as
     `` "logo": logo${CONTENT_IMAGE_PROJECTION} ``;
   - a getter per thing the page needs, via
     `loadContent({ fallback, query, params, tags: ["content:<type>"], label, mockDocuments: build<X>Backfill, select })`,
     where `select` shapes the result like the fallback (drop empty items, `toContentImage`,
     `fillCmsCopy(result, tokens, label, pageTokens)` for placeholders) and leaves anything it
     cannot use empty so the fallback wins;
   - a field that names a person or organisation is a `reference`, projected to the code
     shape's key (`quote->key`, `person->name`); when the reference and the fields beside it
     describe one thing (a quote and its person), `select` returns the group as `whole(group)`
     only when complete and leaves it out otherwise, so an unresolved reference never pairs CMS
     words with the code person; its backfill uses the target's deterministic id
     (`personId`, `organizationId`), and `mockDocuments` adds the target documents (the other
     slice's builder) so the mock resolves it;
   - one `build<X>Backfill(): BackfillDocument[]` for everything the slice owns, from the code
     fallback: `_id` from `backfillId(type, key)`, where the key is an explicit field of the
     code data (`id`/`key`), never the visible text: an id that follows the wording turns a copy
     edit into a second document (only `[a-z0-9-]`; a `.` makes the document private), images with `backfillImage("/assets/...", { alt, objectPosition })`,
     placeholders kept as `{{name}}`.
   A type used by several features keeps its shared part in `lib` with the fallback passed in
   (`lib/faq-content.ts`); the per-feature `content.ts` stays a thin wrapper. The server-only
   slice is also imported by `pnpm sanity:backfill` (tsx stubs `server-only`), so keep its
   top-level code free of request-time APIs.
4. **Types.** `pnpm sanity:typegen` (TypeGen scans `lib`, `features/**/content.ts` and
   `config/*-content.ts`); commit `src/lib/sanity.types.generated.ts`.
5. **Registry.** Append `{ slice, build }` to `scripts/sanity/slices.ts`, and the schema to
   `contentSchemaTypes`, each under its phase's comment, so parallel work doesn't touch the same
   lines. After merging two slices, rerun `pnpm sanity:typegen` rather than resolving conflicts
   in the generated file.
6. **Page.** The server page component awaits the getter (it may become `async`; routes may not
   import feature modules other than the page) and passes plain props to sections and islands.
   Site facts the page renders directly come from `await getSiteFacts()`, never from the
   `config/` constants. Client components never import a slice, `config/*-content.ts`,
   `config/content-tokens.ts` or `lib/cms-content`. Another feature reaches a slice through the
   owning feature's `server.ts` entry (server only), never its `index.ts`, which must stay safe
   for client islands; `src/architecture.test.ts` fails on any client path to `server-only`.
   The standing CTA labels come from `config/calls-to-action.ts`, never from page copy.
7. **Tests.** Copy `src/features/apply/content.test.ts`: the `code` source returns the fallback;
   under `USE_MOCK_CMS=1` with `CMS_CONTENT_SOURCE=sanity` the getter returns exactly the same
   value (`toStrictEqual`), and `fetchContent` over the backfill is not empty (so the parity is
   not vacuous). Keep the existing data and content-facts tests green. A test that edits the
   documents with `vi.mock("@/lib/cms-content-mock")` calls one getter at a time: Vitest gives
   the mock only to the first of several concurrent dynamic imports (`docs/testing.md`).
8. **Verify.**

   ```bash
   pnpm lint && pnpm typecheck && pnpm sanity:typegen:check && CI=1 pnpm knip
   pnpm exec vitest run <slice tests> test/cms-backfill.test.ts test/content-facts.test.ts
   pnpm sanity:backfill --dataset redesign   # dry run: check the per-type counts
   ```

   Never run `--apply`, `sanity dataset create` or `sanity dataset import`: importing is a launch
   step for a maintainer (the runbook in ADR 0009). `--apply` creates missing documents only
   (and attaches images an earlier import left without a file);
   `--apply --overwrite` replaces existing documents with the code content and discards what
   editors changed.

Gotchas: images in the mock are sized from the file header like Sanity does, so the code
`ContentImage` must state the file's intrinsic size or parity fails; a structural list (one the
page draws as a whole, like the E-Lab gates or the journey's fork) must fall back to the code list
when `select` or `fillCmsCopy` drops any item, and check its invariants (every gate figure once,
a two-step fork); lists replace wholesale
(no per-item merge); the CMS cannot clear a value the fallback sets; content edits show after
revalidation (no drafts or `SanityLive` for page content yet).
