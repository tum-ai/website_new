# CMS content inventory

Ownership of editable content in the site's Sanity dataset (`redesign`), and the code concerns
that remain. See [ADR 0009](adr/0009-cms-content-source.md) and the `cms-content-model` skill.
This map describes the implementation contract; it is not a live dataset readiness report.
Paths below are relative to `src/`.

## Content ownership

Editable content is read directly from CMS documents. Required singleton/fact/structural fields
fail visibly when absent or malformed; optional lists may be empty and optional cleared fields
stay cleared. There are no local editorial payloads, source selector, backfill builders or slice
registry. Feature `data/` modules retain types and pure logic, not editable content copies.

Content schemas register on page-content datasets, outside the legacy `production` dataset.
Single-page copy types give TypeGen a specific shape per page. References share people and
organizations; logo lists own surface membership/order. Organization `partnerTier` marks a
partner and `partnerOrder` owns directory ordering.

The legacy `event`, `partner`, `research` types are copied read-only from published production
records using `sanity:copy-production`, preserving IDs and skipping existing target documents.
Public APIs retain CMS legacy compatibility. Event `coHosts` and research `institutions` refer
to existing organizations; reference migration does not create organizations from local lists.

| Type | Kind | Holds | Status |
| --- | --- | --- | --- |
| `faq` | list | `collection` (`apply`, `e-lab`, `qanda`), `order`, `question`, `answer` (plain text with `{{placeholders}}`); Q&A-only `anchor`, `points`, `spans`, `evidence` | CMS |
| `campaign` | list | `name`, start and end (Sanity dates plus Munich "HH:MM" times), the header CTA (`variant` key `member`/`partner`/`elab`/`notify`, optional `label`, `yieldsToRecruiting`), `notifyUrl`, `featuredEvent` (a weak reference to an event, read as its `_id`), `priority` (an integer, higher wins; ties: the latest start) | CMS |
| `applicationWindow` | list | `program` (`membership`, `e-lab`), `roundName` or cohort, `switchedOn`, `opens`, `deadlineDate`, `deadlineTime` (Munich), `applicationUrl`, `milestones[]` (`key` such as `interviews`/`onboarding`, `from`, `to`), `nextWindowLabel` | CMS |
| `siteSettings` | singleton | organization figures, `brandMission`, role emails, social links, booking page and host, community and impact figures, E-Lab program facts (length, funding, selection funnel, hero logo), league facts/references, footer tagline, header default CTA | CMS |
| `organization` | list | `name`, `key` (kebab-case; pages match its letters and digits), `shortName`, `href`, `logo` and optional `logoOnDark` (image with `alt`, `symbolOnly`, `aspectRatio`); the "Partnership" group: `partnerTier` (set = a partner), `partnerFeatured`, `partnerCategory`, `partnerOrder`, hidden `legacyPartnerId` (the old `partner` document's id, which `/api/getPartners` returns); one document per company, reused by every surface | CMS |
| `logoList` | list, fixed ids | `surface` (`alumni-destinations`, `partner-marquee`, `e-lab-ventures`, `rex-institutions`, `ehl-partners`), `organizations[]` (references, in page order); one document per section, `_id` `logolist-<surface>`. Membership and order live here, not on the organisation, because one organisation appears in several sections in different places | CMS |
| `person` | list | `placement` (`member-story`, `partner-profile`, `e-lab-testimonial`; one per document, since role and portrait differ per page), `key` (the id code picks by), `order`, `name`, `role`, `context`, `quote` or `story`, `portrait` (hotspot = position), `organization` (reference, any placement; testimonials need one), `roleAtOrganization` (the page shows "role @ organisation") | CMS |
| `caseStudy` | list | partner case studies: `organization`, `metric`, `label`, `summary`, `copy`, `attribution`, `image` | CMS |
| `ventureTrace` | singleton | the traced E-Lab venture: `venture` and `person` references, `cohort`, `now`, `milestones[]` with source URLs | CMS |
| `department` | list | `name`, `description` (placeholders), optional `photo` (`ContentImage` + caption), `order` | CMS |
| `journeyStep` | list | `number`, `name`, `description`, `iconKey` (mapped to a Lucide icon in code), `fromSemester`, `span`, `stage`/fork, `evidence` (a `person` reference to a member story and an excerpt) | CMS |
| `milestone` | list | `year`, `kind` (`research`, `programs`, `events`, `organization`), `title`, `detail` | CMS |
| `taskForce` | list | `slug`, `name`, `field`, `description`, `detailedDescription`, `work` (`partner`, a reference to the organisation, and `items[]`), optional `photo` | CMS |
| `labSite` | list | `city`, `location` (lat, lng), `home`, `organizations[]` (references: the research projects', research partners' and REX institutions' organisations there) | CMS |
| `<page>Copy` | singleton per page | the page's hero, section titles and leads, closings and figure copy: `homeCopy` (its quotes reference `person`), `applyCopy`, `communityCopy`, `eventsCopy`, `eLabCopy` (including voice references), `hackathonsCopy` (Makeathon editions and optional partner voice/outcome case-study references), `projectsCopy`, `qandaCopy`, `researchCopy` (with the REX band's copy) (C); `partnersCopy` (B) | CMS |

`pageCopy` is one singleton type per page, not one generic type: TypeGen then types each page's
fields, and each owner defines its own schema file.

## Runtime owners

| Content | Reader owner | Consumers |
| --- | --- | --- |
| Site facts | `config/site-settings-content.ts` | layout, page figures, metadata and copy tokens |
| Windows and campaigns | `config/schedule-content.ts` | header, Apply, Community, E-Lab and featured events |
| Copy singleton per page | owning feature `content.ts` / topic slice | owning page and server sections |
| Shared FAQ | `lib/faq-content.ts` with feature wrappers | Apply, E-Lab, Q&A |
| Departments and journey | `lib/community-content.ts` | Community, Apply, homepage |
| Organizations and logo lists | `lib/organization-content.ts` | partner directory, logo surfaces, affiliations |
| People | `lib/person-content.ts` with feature wrappers | stories, profiles and testimonials |
| Events and research | `lib/sanity.ts` | event/research/hackathon pages and published public APIs |

Client islands receive plain props. They import isomorphic domain types/logic, never readers or
fixtures. Shared server content is exposed through a feature's `server.ts` entry.

## Kept in code

| Content | Owner | Reason |
| --- | --- | --- |
| Legal wording, identity, register details, legal addresses | `features/legal/`, `config/organization.ts`, `contact.ts` | reviewed legal content |
| Canonical URL, metadata/JSON-LD structure | `config/site.ts`, `seo.ts` | routing/SEO structure; rendered editable values use CMS facts |
| Navigation, standing CTA labels, private partnership CC addresses | `config/navigation.ts`, `calls-to-action.ts`, `contact.ts` | destination structure and reviewed personal addresses |
| Geometry, icon mapping, phase/count grammar, UI/a11y strings | domain logic and components | layout and interface behavior |
| Types, validation, fact/window derivation | `config/`, `lib/`, feature model modules | runtime contracts |
| Development design-system examples | `features/design-system/` | showcase only |

## Fixtures and assets

Small independent synthetic CMS-shaped documents live in
`lib/cms-fixtures/{settings,organizations,community,programmes,hackathons}`; event/research mocks
remain in `lib/mock-cms.ts`. The actual GROQ runs through groq-js, resolving synthetic references
and image metadata. Fixtures are loaded only by the literal build-time `USE_MOCK_CMS=1 && !VERCEL`
gate; erased type-only domain imports are permitted, runtime reader imports are not. CI Build/perf
and Playwright use `MOCK_CMS_NOW=2026-10-01T12:00:00Z`. Fixtures are not a launch seed.

Published editorial images render from CMS assets. Structural brand assets, fonts and synthetic
fixture assets remain local. Focused migration image sources stay local until the separately authorized migration upload and
link are confirmed. Its `.sanity-backfill/<dataset>.single-source-assets.json` caches asset IDs by
source path and file digest, allowing retries after document-write failures without repeating a
successful upload. Preserve the cache and source files until apply is confirmed. This is separate
from `.sanity-backfill/<dataset>.pending-assets.json`, used only by `sanity:repair-assets` for
historical import recovery with revision/editor-removal safeguards. Missing optional images
are never automatically repopulated from local files.

## Remaining launch gaps and readiness

`sanity:migrate-single-source --dataset redesign` is a dry-run plan for specific known gaps:
missing Makeathon editions in `hackathonsCopy`, Atira, league references in
`siteSettings.hackathons`, `logoList` surface `ehl-partners`, partner hero imagery, organization
partner ordering, E-Lab voice references and hackathon case-study references. It does not rebuild
all CMS content. Production copy, partner/reference/dedup migrations and asset repair are separate
maintainer responsibilities; see ADR 0009.

`sanity:ready --dataset redesign` uses the real published queries and runtime parsers with mocks
disabled and writes `.sanity-backfill/<dataset>.readiness.json`. Missing or malformed required
fields/references have actionable report entries. Mock CI or an asset/reference-only audit does
not prove readiness. A fresh successful real readiness report and real page checks are required
before launch; no CMS apply or launch is implied by this inventory.
