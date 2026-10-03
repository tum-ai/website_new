---
name: add-page
description: Step-by-step recipe for adding a new route or page to the TUM.ai website. Use whenever someone wants a new page, route, landing page or legal page, or wants to split a section into its own URL, even if they only say "we need a page for X". It covers the thin App Router route, the feature folder and page module, the SEO and JSON-LD entry, navigation, the E2E route list (siteRoutes) and the visual baseline, so the architecture test, SEO and CI all accept the new page.
---

# Add a page

A page is a thin route in `src/app/(site)/` plus a feature folder in `src/features/<domain>/`.
The architecture test rejects any other shape, so follow these steps in order. Use kebab-case for
the route segment, the folder and every file.

## 1. Feature folder and page module

Create `src/features/<domain>/<domain>-page.tsx`, a server component that renders one `<main>`:

```tsx
import { Container, PageHero, Section, SectionHeader } from "@tum.ai/ui-kit";
import { intro } from "./data/<domain>";

/** The /<route> page. */
export function <Domain>Page() {
  return (
    <main>
      <PageHero eyebrow={intro.eyebrow} title={intro.title} lead={intro.lead} />
      <Section tone="paper" aria-labelledby="<domain>-overview">
        <Container>
          <SectionHeader id="<domain>-overview" title="..." />
        </Container>
      </Section>
    </main>
  );
}
```

- `PageHero` is the `h1`; each band is a `<Section tone>` opened by a `SectionHeader` (`h2`).
  End on a light or ink band (the footer is night). See `docs/design-system.md` "Page anatomy".
- Static copy goes in `data/<domain>.ts`; facts (dates, counts, emails) come from `@/config/*`.
- Interactive parts are small `"use client"` islands next to the page module.
- Page-only CSS, if unavoidable, goes in `<domain>.css` inside `@layer`; the route imports it.
- Add `index.ts` only if another feature needs something from this one, and never export the page.
  Keep it isomorphic; server-only exports (content getters, async server components) go in
  `server.ts`, which starts with `import "server-only"`.
- Editable copy and facts: once the page has copy editors should own, add a content slice and a
  `<page>Copy` singleton (the `cms-content-model` skill); read facts with `await getSiteFacts()`
  and the CTA labels from `@/config/calls-to-action`.

## 2. SEO entry

Add the page's key to `src/config/seo.ts` (title, description, canonical, JSON-LD), copying a
neighbouring entry. Build URLs with `absoluteUrl()` from `src/config/site.ts`, never URL
literals (`test/content-facts.test.ts` rejects them).

## 3. Route

Create `src/app/(site)/<route>/page.tsx`:

```tsx
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { <Domain>Page } from "@/features/<domain>/<domain>-page";

export const metadata = buildMetadata("<seo-key>");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("<seo-key>")} />
      <<Domain>Page />
    </>
  );
}
```

CMS-backed pages make `Page` async, fetch through `@/lib/sanity` getters, pass the data as props,
and set `export const revalidate = <seconds>`.

## 4. Navigation

If the page belongs in the header or footer, add it to `src/config/navigation.ts`
(`mainNavigation`, `connectLinks`, `legalLinks`, ...). If the header should behave differently on
it (frosted from the start, another CTA), add an entry to the route overrides behind
`getHeaderOptions(pathname, { membershipOpen })` in the same file.

## 5. E2E and visual baseline

Add the route to `siteRoutes` in `e2e/fixtures.ts` (path and exact `<title>`, `cms: true` if it
shows CMS data). Every spec that loops over it then covers the page: one `h1` and `main`, no
console errors, no overflow or broken images, axe, no-JS, and a visual snapshot at 390 and
1440 px. The new baselines come from CI: after the first push, add the `update-snapshots` label
to the PR (see the `pr-ready` skill). Never commit screenshots taken locally.

## 6. Verify

```bash
pnpm lint && pnpm typecheck
pnpm exec vitest run src/architecture.test.ts   # the page module and its imports
```

CI builds the site and runs the E2E and visual specs on the PR. Then follow `ui-verify` for the
visual diffs and screenshots, and `pr-ready` before marking the PR ready.
