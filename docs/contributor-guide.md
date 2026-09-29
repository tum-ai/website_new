# Contributor guide

The shortest path from "I need to change X" to the right files. The layout and its rules are in
[architecture.md](architecture.md); the UI rules in [design-system.md](design-system.md); tests
in [testing.md](testing.md).

## Where things live

- `src/app/(site)/<route>/page.tsx`: thin routes (metadata, JSON-LD, the page module).
- `src/features/<domain>/`: everything a page owns: `<domain>-page.tsx`, sections, islands,
  `data/` (static copy), domain logic and tests.
- `src/components/ds/`: the design system; `src/components/shell/`: header, footer, skip link.
- `src/config/`: site facts (the code fallback of the CMS site settings), navigation, CTA labels
  and SEO.
- `src/lib/`: the Sanity fetch layer and queries, the content source and shared content slices,
  mock CMS, Munich time, security, redirects.
- `src/sanity/schemas/`: the CMS content model. `src/styles/index.css`: tokens and tones.

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
2. Put static copy in `src/features/<domain>/data/<domain>.ts`; import facts from `@/config/*`.
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

Everything is in `src/config/navigation.ts`:

- `mainNavigation`, `headerConnectLinks`, `connectLinks`, `legalLinks`, `contributeLinks`: the
  header and footer links.
- `headerCtaSetting`: which call to action the header shows. While the membership round is open
  (`isMembershipApplicationOpen`, the dated window in `membershipConfig`) it shows `member`;
  otherwise `fallback`. Set `override` to pin one variant. The variants and their labels are in
  `headerCtas`. The site layout decides on the server and the header switches live at the
  window's boundaries. After launch, the fallback and dated campaigns are edited in the Studio.
- `callToActionLabels` in `src/config/calls-to-action.ts`: the labels every page, the header and
  the footer use for the standing calls to action ("Become a Member", "Become a Partner",
  "Apply now", "Questions and answers"). They name destinations, so they stay in code.
- `getHeaderOptions(pathname, { membershipOpen })`: per-route header behaviour (frosted from the
  start, route-specific CTA).

### Updating site facts

Facts that change per semester, cohort or year live once in `src/config/`. Pages, FAQs and JSON-LD
read them, so one edit updates every page. After launch, most of them are edited in the Studio
instead (see "Editing content" below), and the config values are the fallback.
`test/content-facts.test.ts` fails when page code types one of them in directly, and the tests
derive their expectations from config, so a documented edit keeps them green.

| Update | Edit |
| --- | --- |
| E-Lab application round: form link and deadline | `src/config/e-lab.ts`: `applicationUrl`, `applicationDeadlineDate` ("27.09.2026"), `applicationDeadlineTime` ("22:00", Munich time). Applications close by themselves at exactly the deadline (for "22:00": open at 21:59:59, closed at 22:00:00): the E-Lab page, its buttons and badge, and the landing card switch live, and `/e-lab` regenerates every 5 minutes. `applicationsOpen` is the master switch for closing early or while no round is announced. |
| When the next E-Lab application phase opens (shown while closed) | `src/config/e-lab.ts`: `nextApplicationWindow` |
| New E-Lab cohort | `src/config/e-lab.ts`: `currentIteration` (and `heroLogo` if the logo changes). The completed-iterations metric follows. |
| E-Lab length or money raised | `src/config/e-lab.ts`: `programWeeks`, `ventureFundingMillions` |
| E-Lab selection funnel (teams at each gate, drawn to scale on `/e-lab`) | `src/config/e-lab.ts`: `selection` (`applications`, `admitted`, `midterm`, `selectionDay`, `finalPitch`; each at most the one before). Update after each round. |
| Membership recruiting round | `src/config/membership.ts`: `applicationsOpen`, `applicationUrl`, `round` (Munich dates "DD.MM.YYYY" and the deadline time; the Apply page's important dates, day ruler and FAQ, and the home and Community closing bands and the header CTA derive from it and switch live at `opens` and the deadline) |
| Founding year, member counts, majors, universities, nationalities | `src/config/organization.ts`: `organizationFacts` |
| The mission statement (the brand guide's wording, quoted on `/apply` and `/qanda`) | `src/config/organization.ts`: `brandMission` |
| Legal name, registered office, register entry, representatives | `src/config/organization.ts`: `legalEntity` (legal content: confirm with the board first) |
| Community figures quoted in copy (Makeathon size) | `src/config/community.ts`: `communityFacts` |
| Research output and hackathon reach (publications, venues, hackathon participants) | `src/config/impact.ts`: `impactFacts` |
| Role emails and social links | `src/config/contact.ts`: `contactEmails`, `socialLinks` |
| Who handles partnership requests (CC addresses, booking page) | `src/config/contact.ts`: `partnershipContact` |
| Site URL, name, tagline | `src/config/site.ts`: `siteConfig` |
| Page titles, descriptions, JSON-LD | `src/config/seo.ts` |

Derived values (`officialMembers`, `eLabProgramSummary`, `eLabCompletedIterations`,
`eLabApplicationsCloseAt`, `eLabPhaseCopy`, `yearsSinceFounding()`) are computed in the same files;
change the base fact, not the derived one. The `site-facts` skill lists the guard tests.

Legal facts and figures without a source are not changed on a guess: keep the current text, add
`// TODO(content): <question>` and flag it in the PR.

### Editing content: the Studio or code

Page content lives in Sanity's content dataset, with the repository's copy as its fallback
([ADR 0009](adr/0009-cms-content-source.md); the model and owners are in
[cms-content-inventory.md](cms-content-inventory.md)). Which one the site renders is
`CMS_CONTENT_SOURCE`: `code` (the default, and the site until launch) renders the repository and
never calls Sanity; `sanity` (after launch) renders the CMS and falls back to the code content
for anything empty, invalid or missing, so a page never breaks on an unfinished document.

After launch, editors change these in the Studio:

| Content | Where in the Studio |
| --- | --- |
| Events, research projects, partner logos in the directory | `/studio/live` (the live dataset, shared with the old site) |
| Organisation and impact figures, the mission, role emails, social links, the partnership booking page, the E-Lab program facts and selection funnel, the footer tagline, the header CTA fallback | `/studio/content`: Site settings |
| The membership round (dates, form, open switch) and the E-Lab application window (deadline, form, next window) | `/studio/content`: Application windows |
| Dated header CTAs and featured events | `/studio/content`: Campaigns |
| Every page's headings, leads, captions, photos and section copy | `/studio/content`: the page's singleton (Homepage, Apply page, E-Lab page, Community page, Events page, Projects page, Research page, Q&A page, Partners page) |
| FAQs, milestones, the member journey, departments, task forces, lab sites | `/studio/content`: their lists |
| Organisations and their logos, the logo lists' order, people (member stories, partner profiles, E-Lab testimonials), case studies, the traced E-Lab venture | `/studio/content`: Logos and people |

These stay in code, always:

| Content | Where |
| --- | --- |
| Legal pages, `legalEntity`, the Imprint's address and email | `src/features/legal/`, `src/config/organization.ts`, `src/config/contact.ts` |
| Site URL, SEO metadata and JSON-LD | `src/config/site.ts`, `src/config/seo.ts` |
| Navigation structure and the standing CTA labels ("Become a Member", "Become a Partner", "Apply now", "Questions and answers") | `src/config/navigation.ts`, `src/config/calls-to-action.ts` |
| Partnership CC addresses (they name people) | `src/config/contact.ts` `partnershipContact.cc` |
| Sentences built from dates or counts (the round's status lines, the events hero's count, the traced venture's lead) and interface labels (buttons such as "Book a call", badges, screen-reader text) | the section's component, or `src/features/apply/round.ts` and `src/config/e-lab.ts` |
| Layout geometry, the E-Lab dot field, the Projects overlaps | the feature's geometry files |

Figures, dates and emails inside editable text are placeholders such as `{{eLab.deadline}}` or
`{{org.activeMembers}}`: editors keep them, and the page fills them from the site settings and
windows at render. A few texts take page tokens, like `{{count}}`, which the page fills from what
it lists; the field's help text names them. Content edits show when the page revalidates (at
most an hour on `/apply`, five minutes on `/e-lab`, the next build for fully static pages until a
revalidation webhook exists); there is no draft preview for the content dataset yet.

Until launch, and in the code fallback, the repository is the source: copy in
`src/features/<domain>/data/`, facts in `src/config/`.

### Change static copy

Copy lives in `src/features/<domain>/data/*.ts`, for example:

- FAQs: `src/features/qanda/data/qanda.ts`, `src/features/apply/data/faq.ts`,
  `src/features/e-lab/data/faq.ts`
- Homepage: `src/features/home/data/homepage.ts`
- Community: `src/features/community/data/departments.ts`, `member-journey.ts`,
  `member-stories.ts`

No em or en dashes in visible copy (use a comma, colon, period or spaced hyphen), and fix only
unambiguous typos. The German legal pages are excluded from the spell check. When a slice serves
the copy (a `content.ts` next to `data/`), the code copy is the fallback and the backfill source:
keep it current until the CMS content is reviewed.

### Move content into the CMS

Follow the "Content slices" section of the `cms-content-model` skill: schema in
`src/sanity/schemas/content/`, a `content.ts` slice next to the data, the builder registered in
`scripts/sanity/slices.ts`, a parity test, `pnpm sanity:typegen`, and a dry run of
`pnpm sanity:backfill`. Importing into a dataset (`--apply`) is a launch step for a maintainer
(runbook in ADR 0009), never part of a change.

### Change events, research or partners data

Content is edited in `/studio/live` (locally or on a preview deployment). To change the shape of the
data, follow the order in the `cms-content-model` skill:

1. schema in `src/sanity/schemas/`;
2. query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`);
3. `pnpm sanity:typegen` (writes `src/lib/sanity.types.generated.ts`; never edit it by hand);
4. fixtures in `src/lib/mock-cms.ts`;
5. tests (`src/lib/sanity-queries.test.ts`, `mock-cms.test.ts`);
6. the UI that renders the field.

Pages fetch through the getters in `src/lib/sanity.ts`, not through the API routes.
`/api/getNotes` (events), `/api/getPartners` and `/api/getResearch` are a public API with their
own frozen queries: add fields freely, but don't rename or remove any without a migration note.

### Add or change a JSON endpoint

Route handlers live in `src/app/api/<name>/route.ts`. Keep them thin: read through `src/lib/`,
return `NextResponse.json(...)`, and don't duplicate query logic in the handler.

### Change styling, tokens or a component

- Tokens, tones and utilities: `src/styles/index.css`. Every rule goes in a cascade layer or an
  `@utility`.
- Components: `src/components/ds/`, following the conventions in
  [design-system.md](design-system.md) and the `ds-component` skill (test, showcase entry, docs
  table in the same PR).
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

1. Open `/studio/live` on the preview deployment.
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
