---
name: add-page
description: Step-by-step recipe for adding a new route or page to the TUM.ai website. Use whenever someone wants a new page, route, landing page or legal page, or wants to split a section into its own URL, even if they only say "we need a page for X". It covers the thin App Router route, the feature folder and page module, the SEO and JSON-LD entry, navigation, the E2E route list and the visual baseline, so the architecture test, SEO and CI all accept the new page.
---

# Add a page

A page is a thin route in `src/app/(site)/` plus a feature folder in `src/features/<domain>/`.
The architecture test rejects any other shape, so follow these steps in order. Use kebab-case for
the route segment, the folder and every file.

## 1. Feature folder and page module

Create `src/features/<domain>/<domain>-page.tsx`, a server component that renders one `<main>`:

```tsx
import { Container, PageHero, Section, SectionHeader } from "@/components/ds";
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

## 2. SEO entry

Add a key to `pageSEOConfig` in `src/config/seo.ts` (title, description, canonical, jsonLd),
copying a neighbouring entry. Once W1-Data lands, build URLs with `absoluteUrl()` from
`src/config/site.ts` instead of URL literals.

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

If the page belongs in the header or footer, add it to `src/config/navigation.ts` (coming in
W1-Data). Until that file exists, the link arrays live in `src/components/shell/header.tsx`
(`links`) and `src/components/shell/footer.tsx` (`columns`).

## 5. E2E and visual baseline

Add the route to the E2E route list in `e2e/` (coming in W1-E2E) so it gets the per-route checks
(one `h1`, one `main`, no console errors, no overflow, axe) and a visual snapshot at 390 and
1440 px. Generate the new baseline through the CI update workflow, not locally.

## 6. Verify

```bash
pnpm lint && pnpm typecheck && pnpm test   # architecture test checks the page module and imports
pnpm build                                  # the route appears in the build output
pnpm test:e2e                               # once the harness exists
```

Then run the `ui-verify` skill for screenshots and the keyboard and reduced-motion pass, and
`pr-ready` before opening the PR.
