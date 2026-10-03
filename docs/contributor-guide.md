# Contributor guide

The shortest path from "I need to change X" to the right files. The layout and its rules are in
[architecture.md](architecture.md); the UI rules in [design-system.md](design-system.md); tests
in [testing.md](testing.md).

## Where things live

- `src/app/(site)/<route>/page.tsx`: thin routes (metadata, JSON-LD, the page module).
- `src/features/<domain>/`: everything a page owns: `<domain>-page.tsx`, sections, islands,
  `data/` (types and logic), domain logic and tests.
- `@tum.ai/ui-kit` 0.2.0: shared primitives; `src/components/shell/`: adapters for the kit shell.
- `src/config/`: CMS fact readers and derivation, navigation, CTA labels
  and SEO.
- `src/lib/`: the Sanity fetch layer and queries, validated shared content slices,
  mock CMS, Munich time, security, redirects.
- `src/sanity/schemas/`: the CMS content model. `src/styles/index.css`: kit stylesheet imports and app-specific CSS.

If you're unsure where to edit, start at the route in `src/app/(site)/`, follow its import to the
page module, then to the section.

## Local workflow

```bash
pnpm install                              # also installs the lefthook pre-commit hook
pnpm exec vercel link --yes --project website --scope tum-ai
pnpm exec vercel env pull .env.local --yes --environment=development
pnpm dev                                  # http://localhost:3000, output in .next-dev
USE_MOCK_CMS=1 pnpm dev                   # CMS fixtures instead of Sanity, no credentials

pnpm lint                                 # Biome; pnpm lint:apply fixes what it can
pnpm typecheck                            # route typegen + tsc
pnpm exec vitest run <files>              # the tests next to what you changed
```

Pull requests run everything else in CI: the full unit suite with coverage, the production build
and homepage budget, E2E in Chromium and WebKit, and the visual comparison. Coding agents stop at
lint, typecheck and targeted Vitest locally; people can run `pnpm test`, `pnpm verify` or
`pnpm test:e2e` when it helps (see [testing.md](testing.md)).

## Common changes

### Add a page

1. Create `src/features/<domain>/<domain>-page.tsx`: a server component with one `<main>`,
   starting with `PageHero` and continuing in `<Section tone>` bands.
2. Model editable page copy in a CMS singleton with a server-only reader; read facts through
   `getSiteFacts()` / the application-window readers and pass plain props to islands.
3. Add the page's key to `src/config/seo.ts` (title, description, canonical via `absoluteUrl()`,
   JSON-LD).
4. Create `src/app/(site)/<route>/page.tsx`:
   ```tsx
   import { JsonLd } from "@/components/json-ld";
   import { buildMetadata, getJsonLd } from "@/config/seo";
   import { ExamplePage } from "@/features/example/example-page";

   export const metadata = buildMetadata("example");

   export default function Page() {
     return (
       <>
         <JsonLd data={getJsonLd("example")} />
         <ExamplePage />
       </>
     );
   }
   ```
5. If it belongs in the header or footer, add it to `src/config/navigation.ts`.
6. Add it to `siteRoutes` in `e2e/fixtures.ts`; every E2E spec and the visual spec then cover it.
   The new baselines come from the `update-snapshots` label in the PR.

The `add-page` skill (`.agents/skills/add-page/SKILL.md`) has the full recipe.

### Change navigation or the header call to action

Navigation structure and selection logic are in `src/config/navigation.ts`; rendered defaults
and dated overrides come from CMS settings/campaigns:

- `mainNavigation`, `headerConnectLinks`, `connectLinks`, `legalLinks`, `contributeLinks`: the
  header and footer links.
- `siteSettings.headerCtaFallback` feeds the header's default variant. While the membership round is open
  (`isMembershipApplicationOpen`, the CMS membership window) it shows `member`;
  otherwise it uses the CMS default or an active campaign. Variant targets and standing labels
  are code structure (`headerCtasFor`). The site layout decides on the server and the header switches live at the
  window's boundaries. The default CTA choice and dated campaigns are edited in the Studio.
- `callToActionLabels` in `src/config/calls-to-action.ts`: the labels every page, the header and
  the footer use for the standing calls to action ("Become a Member", "Become a Partner",
  "Apply now", "Questions and answers"). They name destinations, so they stay in code.
- `getHeaderOptions(pathname, { membershipOpen })`: per-route header behaviour (frosted from the
  start, route-specific CTA).

### Updating site facts

Editable facts have one CMS owner. Pages, placeholders and fact-dependent metadata read
`getSiteFacts()` and application-window readers per render. Code owns types and derivation,
not a second editorial value. Required fields fail visibly when absent or malformed.

| Update | Edit in `/studio` |
| --- | --- |
| E-Lab round: switch, deadline, form and next window | Application window, `program: e-lab` |
| Membership switch, form, round dates and milestones | Application window, `program: membership` |
| E-Lab cohort/logo, program length, funding and selection funnel | Site settings; each selection gate must be no greater than the preceding one |
| Organization/member figures, mission, community and impact figures | Site settings |
| Role emails, social links, booking URL/host and footer tagline | Site settings |
| Makeathon and European Hackathon League facts/references | Site settings, hackathons group |
| Default header CTA | Site settings; dated overrides and featured event use Campaigns |

Munich deadlines close at the exact instant and the open switch can close a round early. Derived
values follow the render's base facts; update a base fact rather than duplicating its result.
Legal identity/addresses/register details, canonical URL, SEO structure, navigation, standing
CTA labels and private partnership CC addresses remain reviewed code concerns. Legal wording
and unsourced figures need maintainer evidence; keep unclear content and flag the question.
The `site-facts` skill maps owners and tests.

### Editing content

Use `/studio` on a deployment configured with `NEXT_PUBLIC_SANITY_DATASET=redesign`.
[ADR 0009](adr/0009-cms-content-source.md) and
[cms-content-inventory.md](cms-content-inventory.md) describe the contract. Page-copy singletons,
FAQs, milestones, departments, journey, task forces, lab sites, organizations/logo lists, people,
case studies and venture trace are CMS content. Partners are organizations with a partner tier.
Optional lists/fields can be cleared; required page content must be complete. There is no local
copy fallback or source switch.

Facts inside editable copy stay placeholders such as `{{eLab.deadline}}` and
`{{org.activeMembers}}`, filled per render from the settings/windows. Page tokens such as
`{{count}}` use the count the page renders. A published edit invalidates tagged pages through the
Sanity webhook; the layout's hourly timer is a safety net. Existing event/research draft preview
remains; this work does not add page-content draft/live preview.

Interface/a11y strings, phase/count grammar and geometry stay in code. No em/en dashes in visible
copy; fix unambiguous typos and preserve factual/legal evidence.

### Change the content model

Follow `cms-content-model`: schema, real `defineQuery` projection, runtime parser, TypeGen,
small independent synthetic fixture and query/parser tests. Server-only readers validate
required content and preserve optional clearing. No local editorial payload, backfill builder
or slice registry is introduced.

Maintainer production copy, targeted migrations and asset repair default to dry run. Their
`--apply` modes are separate launch actions, never part of normal code delivery. Keep pending
image sources and the appropriate upload cache/repair ledger until the separately authorized
upload and document link are confirmed (ADR 0009 distinguishes the two mechanisms). Read-only
`pnpm sanity:ready --dataset redesign` disables mocks, exercises the real runtime parsers and
reports actionable gaps; synthetic CI success does not certify live readiness. See ADR 0009.

### Change events, research or partners data

Content is edited in `/studio` (locally or on a preview deployment). To change the shape of the
data, follow the order in the `cms-content-model` skill:

1. schema in `src/sanity/schemas/`;
2. query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`);
3. `pnpm sanity:typegen` (writes `src/lib/sanity.types.generated.ts`; never edit it by hand);
4. synthetic fixtures in `src/lib/mock-cms.ts` or `src/lib/cms-fixtures/`;
5. tests (`src/lib/sanity-queries.test.ts`, `mock-cms.test.ts`);
6. the UI that renders the field.

Pages fetch through the getters in `src/lib/sanity.ts`, not through the API routes.
`/api/getNotes` (events), `/api/getPartners` and `/api/getResearch` are a public API with their
own frozen queries: add fields freely, but don't rename or remove any without a migration note.

### Add or change a JSON endpoint

Route handlers live in `src/app/api/<name>/route.ts`. Keep them thin: read through `src/lib/`,
return `NextResponse.json(...)`, and don't duplicate query logic in the handler.

### Change styling, tokens or a component

- Tokens, tones and shared utilities: `@tum.ai/ui-kit/tailwind.css`. The app imports it from
  `src/styles/index.css`; keep app CSS in a cascade layer or an `@utility`.
- Components: import the public API from `@tum.ai/ui-kit`. Shared primitive changes belong in
  the [kit repository](https://github.com/tum-ai/ui-kit/tree/v0.2.0), followed by a release and
  exact dependency upgrade here. Follow [design-system.md](design-system.md) and the
  `ds-component` skill for the app integration and showcase.
- Page-only CSS, if unavoidable: `src/features/<domain>/<domain>.css`, imported by the route.

### Add or replace assets

Put shipped files under `public/assets/` in the closest existing folder (`homepage/`, `apply/`,
`e-lab/`, `partners/`, `innovation/` for projects). Partner logos shown from the CMS are managed
in Sanity. `test/public-assets.test.ts` fails when a literal `/assets/...` reference points at a
missing file. Brand source files in `docs/brand/source/` are reference material, not runtime
assets.

### Change SEO

Edit `src/config/seo.ts`. Build URLs with `absoluteUrl()` from `src/config/site.ts`.

### Host redirects

`src/lib/redirects.ts` (logic, tested) and `src/proxy.ts` (Next 16's replacement for middleware).
Today every path on `join.tum-ai.com` redirects to `/apply`.

## Draft preview and staging

Use a Vercel preview deployment as staging for CMS changes. With `SANITY_API_READ_TOKEN` set for
Preview and Development:

1. Open `/studio` on the preview deployment.
2. Use the Presentation tool. It calls `/api/draft-mode/enable` and loads the page in an iframe.
3. The site reads Sanity's draft perspective, and `<SanityLive>` refreshes it as you edit.

Without the token, `/api/draft-mode/enable` answers 503 and pages show published content only.

## Known footguns

- `USE_MOCK_CMS` is read at build time: `USE_MOCK_CMS=1 pnpm build`, not only `pnpm start`.
- Don't run bare `next build` or `next dev`: the package scripts keep dev and production output in
  separate dist dirs.
- `/api/getNotes` returns events despite its name.
- Changing an API route doesn't change a page; pages fetch from `src/lib/sanity.ts` directly.
- `/design-system` exists only in development and on preview deployments.
- Safari 26 has workarounds in the root background, header and dialogs; read
  [browser-quirks.md](browser-quirks.md) before touching them.

## Before you open a PR

- The change sits in the right layer; `src/architecture.test.ts` passes without new exceptions.
- No duplicated facts, copy or data fetching.
- `src/config/seo.ts` updated if a route changed; `siteRoutes` updated for a new page.
- `pnpm lint` and `pnpm typecheck` pass locally; CI is green.
- Intended visual changes are accepted with the `update-snapshots` label and listed in the PR.
- The PR template (`.github/pull_request_template.md`) is filled in.
