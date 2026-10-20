---
name: site-facts
description: Locate and update changeable site facts such as dates, application windows, cohort/program figures, membership/impact counts, role emails, social links and league facts. Use for fact readers, placeholders and content-facts failures.
---

# Site facts

Editable facts live in the site's Sanity dataset (`redesign`), with one owner per fact. Read
`docs/adr/0009-cms-content-source.md`: required site settings and application windows fail
visibly if missing or malformed. There is no local editorial fallback or content source switch.
Code owns types, derivation, legal facts, canonical URLs, SEO structure, navigation and standing
CTA labels. The synthetic fixtures under `src/lib/cms-fixtures/` are local test data only.

Pages read `await getSiteFacts()` (`config/site-settings-content.ts`),
`await getMembershipWindow()` / `await getELabWindow()` (`config/schedule-content.ts`) and copy
placeholders via `await getContentTokens()`. Pass values as props to client islands; never
import a CMS reader there. Derive computed values from the render's facts, including metadata
that displays editable figures. Do not introduce a second constant for a CMS-owned value.

## Ownership

| Fact | Editorial owner | Code contract |
| --- | --- | --- |
| Organization/member/alumni figures and mission | `siteSettings` | `config/site-facts.ts`, `organization.ts` derivation |
| Role emails, social links, partnership booking URL/host | `siteSettings` | `config/contact.ts` types/helpers; private CC addresses stay reviewed code |
| Community and research/hackathon impact figures | `siteSettings` | `config/community.ts`, `impact.ts` derivation |
| E-Lab cohort, logo, length, funding and selection funnel | `siteSettings` | `config/e-lab.ts` types/derivation; validate funnel order |
| Makeathon URL and European Hackathon League facts/references | `siteSettings.hackathons` | `config/hackathons.ts` types/logic |
| Membership open switch, form, recruiting dates and milestones | `applicationWindow` for `membership` | `config/membership.ts` clock and schedule logic |
| E-Lab open switch, deadline, form and next window label | `applicationWindow` for `e-lab` | `config/e-lab.ts` phase logic |
| Header default CTA variant | `siteSettings` | `config/navigation.ts` selection logic |
| Dated CTA and featured event | `campaign` | `config/campaigns.ts` schedule logic |
| Footer tagline | `siteSettings` | shell adapter reads rendered facts |
| Site URL, legal identity, register details and legal addresses | reviewed code | `config/site.ts`, `organization.ts`, `contact.ts`, legal pages |
| Navigation and standing CTA labels | code | `config/navigation.ts`, `calls-to-action.ts` |
| Metadata/JSON-LD structure | code; rendered editable values use CMS facts | `config/seo.ts` |

## Change or add a fact

An editorial change belongs in `/studio`. Keep Munich date/time semantics: Sanity dates convert
through `munich-time.ts`; deadlines close at the exact boundary and the open switch can close a
window early. Legal facts, unsourced figures and legal wording require maintainer evidence;
keep the current value and flag the question instead of guessing.

For a model change, add the schema field, query projection, runtime validation and the
`SiteFacts` or window type together. Update derivation and token mapping rather than duplicating
values in page copy. New placeholder names go into `lib/content-tokens.ts` and
`config/content-tokens.ts`; facts inside CMS copy keep the placeholder template. Update this
ownership table and `docs/contributor-guide.md` when the owner changes.

Update the relevant small synthetic fixture to test the new shape, including invalid required
values and optional clearing. Maintain `test/content-facts.test.ts` guards against literals in
page code and fact-dependent feature tests. Follow the task's test authorization; a no-tests
request takes precedence over the normal local checks. Real dataset readiness is a separate
read-only `pnpm sanity:ready --dataset redesign` run with mocks disabled, not inferred from
fixture tests or CI.
