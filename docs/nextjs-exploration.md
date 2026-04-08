# Next.js Exploration for `website_new`

## Current State Snapshot (what we have today)

The project is currently a Vite + React SPA with client-side routing (`react-router-dom`) and shared header/footer around route content. Data for events/research/partners is fetched in the browser after initial render via Vercel serverless endpoints backed by Notion. This means first paint can happen before content is available, but SEO and first contentful data are limited by client fetch timing.

## Why Next.js is a strong fit for this repo

Your intuition about SSR/CSR separation is correct. The codebase has a clear split between:

- **SEO/public content pages** (home, events, research, partners, legal pages), and
- **interactive islands** (filters, tab states, carousels, animations).

Next.js App Router (React Server Components) gives this split natively:

- **Server Components** for data-heavy/SEO content.
- **Client Components** (`"use client"`) for interaction-heavy widgets.

---

## Next.js features and concrete use in this website

## 1) React Server Components (RSC)

Use for page shells and data sections that do not need browser APIs.

**How to apply here:**
- Convert route-level pages to server components by default.
- Keep filters, carousels, tabs, and motion-heavy blocks as client components.

**Benefit:** smaller JS shipped to browser, faster load on content pages.

## 2) Rendering modes per route: SSR / SSG / ISR / CSR

### Recommended per-page strategy

- **`/` Home:** ISR (`revalidate` every 5–30 min), because event cards/logos may change but not every second.
- **`/events`:** SSR or short ISR (1–5 min), especially if "upcoming" logic should stay fresh.
- **`/research`:** ISR (15–60 min), usually less volatile.
- **`/partners`:** SSG or long ISR (daily/weekly).
- **`/community`, `/projects`, `/qanda`, legal pages:** SSG (static).
- **`/apply`:** ISR if content updates occasionally.

**Benefit:** each page gets an intentional freshness/performance tradeoff instead of one SPA behavior.

## 3) Built-in Data Fetching + Caching (`fetch` cache, `revalidate`, tags)

Next.js can replace custom in-memory cache logic currently duplicated in API handlers.

**How to apply here:**
- Move Notion reads into server-side data utilities (or route handlers).
- Use `fetch(..., { next: { revalidate: 300, tags: ['events'] } })` style policies.
- Trigger updates with `revalidateTag('events')` when content changes (if webhook/publish flow exists).

**Benefit:** cache behavior centralized and composable per resource.

## 4) Route Handlers (`app/api/.../route.ts`)

You can keep API endpoints for browser consumers if needed.

**How to apply here:**
- Migrate `/api/getNotes`, `/api/getPartners`, `/api/getResearch` to route handlers.
- Prefer server component direct data access when only pages need the data.

**Benefit:** less client roundtrips when API is only internal to page rendering.

## 5) Streaming + Suspense

Render stable sections instantly while slower Notion-backed sections stream in.

**How to apply here:**
- Events page: render hero/filter frame immediately; stream event list.
- Research page: stream cards while static tab copy renders.

**Benefit:** lower perceived latency without blocking whole page.

## 6) Metadata API (SEO)

Replace runtime SEO component calls with static/async `generateMetadata`.

**How to apply here:**
- Convert `src/config/seo.ts` mapping into route-level metadata generators.
- Add OpenGraph/Twitter images and canonical URLs per route.

**Benefit:** reliable server-rendered metadata for crawlers/social previews.

## 7) `next/image` and `next/font`

The repo has many heavy assets and local fonts.

**How to apply here:**
- Replace `<img>` with `<Image>` for responsive optimization and lazy loading.
- Move font loading from static asset/css approach to `next/font` for better CLS and caching.

**Benefit:** bandwidth savings and better Core Web Vitals.

## 8) Layouts and Nested Routing

Current global header/footer wrapping in `main.tsx` maps naturally to `app/layout.tsx`.

**How to apply here:**
- Base layout for header/footer.
- Optional nested layout for sections like `/events` or `/e-lab` if they need shared structure.

**Benefit:** clearer route composition and less repetitive scaffolding.

## 9) Middleware

Useful for host/domain redirects currently defined in `vercel.json`.

**How to apply here:**
- Move `join.tum-ai.com -> /apply` redirect to `middleware.ts` for code-managed logic.

**Benefit:** versioned redirect logic with tests and conditionals.

## 10) Partial Prerendering (PPR, where available)

For marketing pages with dynamic islands.

**How to apply here:**
- Pre-render static page shell and stream only dynamic parts (events counters/list segments).

**Benefit:** static-like TTFB + dynamic freshness.

## 11) Server Actions (optional)

No strong immediate need unless adding forms/CMS workflows.

**Potential use:**
- Contact/partner forms, internal admin publish actions, webhook-triggered cache invalidation.

## 12) Better deployment alignment with Vercel

You already target Vercel functions. Next.js gives first-class integration for edge/node runtimes and caching semantics.

---

## Proposed SSR/CSR separation blueprint for this repo

## Server-first (default)

- Route pages and non-interactive sections.
- Notion-backed data transformations.
- SEO metadata generation.
- Date splitting logic for "upcoming vs past" (consistent server output).

## Client-only islands

- Event filtering controls.
- Tabs with keyboard interaction.
- Carousels and animation-heavy components (Framer Motion/GSAP).
- Any feature requiring `window`, `useEffect`, or imperative animation.

---

## Migration strategy (low-risk)

1. **Bootstrap Next.js app in parallel branch** (App Router + TS + Tailwind).
2. **Migrate design system/ui primitives** (`src/components/ui`) first.
3. **Port static routes** (`/imprint`, `/data-privacy`, `/disclaimer`, `/community`, `/projects`, `/qanda`).
4. **Migrate events/research with server data layer + client filter islands.**
5. **Move SEO to Metadata API + replace image/font loading.**
6. **Cut over domain once parity + Lighthouse/SEO checks pass.**

---

## Risks and mitigations

- **Notion latency/rate limits:** use ISR + tag-based revalidation + defensive fallbacks.
- **Animation libraries in RSC world:** isolate into client components early.
- **Hydration mismatches (date logic/timezones):** do date comparisons on server with explicit timezone assumptions.
- **Migration complexity:** keep route-by-route parity checklist to avoid regressions.

---

## Suggested first PoC

Build `/events` in Next.js first because it exercises the full stack:

- server data fetch from Notion,
- upcoming/past split,
- client-side filters,
- metadata/SEO,
- cache revalidation.

If that route performs and indexes better, scale the pattern to `/research` and `/`.
