---
name: cms-content-model
description: End-to-end recipe for changing the Sanity content model of the TUM.ai website (events, research projects, partners, or a new document type). Use whenever a task adds, renames or removes a CMS field or type, changes a GROQ query or projection, touches Sanity TypeGen output, the mock CMS fixtures, or the public /api/getNotes, getPartners or getResearch responses, even if it looks like "just show one more field on the events page".
---

# Change the CMS content model

Sanity data crosses five layers, and each one fails differently when it drifts: the Studio schema,
the GROQ query, the generated types, the mock fixtures used for local work and E2E, and the UI.
Change them in this order and keep each step green.

## 1. Schema

Edit or add a type in `src/sanity/schemas/` (`defineType`, `defineField`) and register new types in
`src/sanity/schemas/index.ts`. Enumerated fields use `options.list` so TypeGen emits a union.
Check it in the Studio: `pnpm dev`, then `/studio` (needs the Sanity env vars from Vercel).

Removing or renaming a field breaks existing documents and the public API: keep the old field
readable (or alias it in the projection) until the content is migrated.

## 2. Query

Update the projection in `src/lib/sanity-queries.ts`. Wrap queries in `defineQuery` so TypeGen can
type them (coming in W1-Data). Project exactly what the UI needs, with stable aliases
(`"id": _id`), `coalesce` for optional text, and arrays kept as arrays (don't join to strings).
Filter in GROQ, not in route code.

## 3. Types

Run `pnpm sanity:typegen` (coming in W1-Data). It writes `src/lib/sanity.types.generated.ts`; never
edit that file by hand (a hook blocks it). Until TypeGen lands, update the matching type in
`src/lib/types.ts` by hand to mirror the projection.

## 4. Mock fixtures

Update `src/lib/mock-cms.ts` so every fixture matches the new projection, including edge cases
the UI must handle (missing image, long text, each enum value, past and upcoming dates relative
to `now`). Fixtures use shipped `/assets/...` files, neutral links and no personal data.
`USE_MOCK_CMS=1 pnpm dev` shows them; E2E runs on them with a fixed `MOCK_CMS_NOW` (coming in
W1-Data).

## 5. Tests

- `src/lib/sanity-queries.test.ts`: evaluate the query with groq-js against sample documents,
  including a document missing the new field.
- `src/lib/mock-cms.test.ts`: fixtures still cover every filter and state.
- Domain logic that uses the field (for example `src/features/events/events.ts`): unit tests.

## 6. UI and API

- Pages receive the data from the server route and pass plain props to islands. Handle the empty
  and missing-field cases visibly (for example `EmptyState` or a brand placeholder).
- `/api/getNotes` (events), `/api/getPartners`, `/api/getResearch` are a public API used outside
  this repo: additions are fine, but don't remove or rename response fields without a migration
  note in the PR.

## 7. Verify

```bash
pnpm lint && pnpm typecheck && pnpm test
USE_MOCK_CMS=1 pnpm build && pnpm test:e2e   # routes that show the data
```

Check the draft preview when the change affects what editors see: open `/studio`, use
Presentation, edit a draft and confirm the page updates (needs `SANITY_API_READ_TOKEN`).
