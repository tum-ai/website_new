# Contributor Guide

Use this document when you want the shortest path from "I need to change X" to the right files.

## First Principles

- `src/app/` owns routes
- `src/views/` owns page composition
- `src/components/` owns sections and reusable UI
- `src/data/` owns static content in Git
- `src/sanity/` owns the CMS schemas and Studio configuration
- `src/styles/index.css` owns the shared visual system

If you are unsure where to edit, start from the rendered route in `src/app/`, then trace into its view and section components.

## Local Workflow

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm verify
pnpm typecheck
```

Use `pnpm verify` before handoff for the normal repo gate. Use `pnpm typecheck` when you changed TypeScript shapes.

## Common Changes

### Add a new page

1. Create a new route at `src/app/<route>/page.tsx`
2. Add or reuse a page composition component in `src/views/`
3. Build metadata and JSON-LD in `src/config/seo.ts`
4. Add navigation only if the page should appear in the header or footer
5. Run `pnpm verify` and `pnpm typecheck`

Pattern to copy:

- thin route file in `src/app/`
- actual page assembly in `src/views/`

### Change global navigation or footer

Edit:

- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/app/layout.tsx` if the global shell itself changes

### Update site facts (cohorts, recruiting, figures, contacts)

Facts that change every semester or cohort live in one file each under `src/config/`. Pages, FAQs and JSON-LD read them from there, so one edit updates every page. `test/content-facts.test.ts` fails when a page types one of these facts in directly.

| Update | Edit |
|---|---|
| E-Lab application round: form link and deadline | `src/config/e-lab.ts`: `applicationUrl`, `applicationDeadlineDate`, `applicationDeadlineTime` (Munich time, as shown on the site). Applications close by themselves after the deadline minute: the E-Lab page, its buttons and badge, and the landing card switch live, and `/e-lab` regenerates every 5 minutes. `applicationsOpen` is the master switch for closing early or while no round is announced. |
| When the next E-Lab application phase opens (shown while closed) | `src/config/e-lab.ts`: `nextApplicationWindow` |
| New E-Lab cohort | `src/config/e-lab.ts`: `currentIteration` (and `heroLogo.src` if the logo changes). The completed-iterations metric follows. |
| E-Lab length or money raised | `src/config/e-lab.ts`: `programWeeks`, `ventureFundingMillions` |
| Membership recruiting round | `src/config/membership.ts`: `applicationsOpen`, `applicationUrl`, `timeline` |
| Member counts, majors, universities, nationalities | `src/config/organization.ts` |
| Role emails and social links | `src/config/contact.ts` |

### Change static copy or curated content

Check `src/data/` first.

Examples:

- FAQs: `src/data/qanda.tsx`, `src/data/apply/faq.tsx`, `src/data/e-lab/FAQ.tsx`
- homepage copy/images: `src/data/homepage.tsx`
- community copy: `src/data/community.tsx`

If copy is hard-coded inside a section component, move it into `src/data/` only if that makes the code easier to maintain. Do not shuffle content across files without a payoff.

### Change events, research, or partners data shape

Start in `src/sanity/schemas/`.

Typical flow:

1. update the schema definition (e.g., `src/sanity/schemas/event.ts`)
2. update the GROQ queries in `src/lib/sanity.ts`
3. update the TypeScript interface in `src/lib/types.ts`
4. update views/components that render the changed fields
5. run `pnpm typecheck`

Important:

- `/events`, `/research`, and `/partners` render from server-side calls to `src/lib/sanity.ts`
- the API routes mirror that data, but they are not the primary rendering path
- draft preview uses `/studio` -> Presentation -> `/api/draft-mode/enable`; keep `SANITY_API_READ_TOKEN` configured in staging/preview environments when testing drafts

### Add or change a JSON endpoint

Route handlers live in `src/app/api/<name>/route.ts`.

Keep them thin:

- read shared data from `src/lib/`
- return `NextResponse.json(...)`
- do not duplicate Sanity querying logic inside the route handler

### Change styling or theming

Start in `src/styles/index.css`.

That file contains:

- Tailwind imports
- theme tokens and tone surfaces
- type scale and motion tokens

Use `src/components/ds/` (see [design-system.md](design-system.md)) for reusable UI building blocks. Use page-specific component styles only when the styling is truly local to that page.

### Add or replace assets

Put shipped files under `public/assets/` in the closest existing subfolder.

Examples:

- route-specific photos in `public/assets/homepage/`, `public/assets/apply/`, `public/assets/e-lab/`
- static logos in `public/assets/partners_sponsors/` (note: dynamic partners are handled in Sanity)

Use brand source files in `docs/brand/source/` as reference material, not as runtime assets.

### Change SEO

Edit `src/config/seo.ts`.

For a new page, update both:

- the route under `src/app/`
- the matching SEO entry in `src/config/seo.ts`

## Known Footguns

- `src/data/routes.tsx` is legacy and not used for runtime routing
- `/api/getNotes` returns events despite the name
- `src/app/globals.css` only re-imports `src/styles/index.css`
- changing only an API route will not affect a page that fetches directly from `src/lib/sanity.ts`

## Suggested Review Checklist

Before shipping a change, check:

- correct ownership layer touched
- no duplicated content or data-fetching logic introduced
- `src/config/seo.ts` updated if a route changed
- `pnpm verify` passed
- `pnpm typecheck` passed when TypeScript contracts changed
