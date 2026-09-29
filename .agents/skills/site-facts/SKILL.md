---
name: site-facts
description: Where every changeable fact on the TUM.ai website lives and which tests guard it. Use whenever a task changes or adds a date, deadline, cohort, application link or phase, member count, contact email, social link, address, register number, site URL or tagline, or any number or name that appears on several pages, for example "open E-Lab applications", "new recruiting round", "update the member count" or "change the partners email". Also use when a test in test/content-facts.test.ts or e-lab-content.test.ts fails.
---

# Site facts

Facts that change per semester, cohort or year live once in `src/config/`. Pages, FAQs and JSON-LD
read them, so one edit updates the whole site, and tests fail if a page types a fact in directly.

Two sources (docs/adr/0009-cms-content-source.md). With `CMS_CONTENT_SOURCE=sanity` (after
launch, on `NEXT_PUBLIC_SANITY_DATASET=redesign`), editors change the editable facts in `/studio`:
the Site settings singleton (organisation and impact figures, mission, role emails, social links,
booking page, E-Lab program facts and selection funnel, footer tagline, header CTA fallback), the
two Application windows (membership round, E-Lab deadline and form) and Campaigns. The config files below are
then the code fallback: a value the CMS leaves empty or invalid renders the config value. Legal
facts, the site URL, SEO, navigation and the standing CTA labels (`config/calls-to-action.ts`)
stay in code only.

Pages read the render's facts: `await getSiteFacts()` (`config/site-settings-content.ts`),
`await getMembershipWindow()` / `await getELabWindow()` (`config/schedule-content.ts`), and copy
placeholders through `await getContentTokens()`. Never import a fact constant into page code for
rendering; pass values to client islands as props.

## Which file

| Fact | File and field |
|---|---|
| E-Lab cohort | `src/config/e-lab.ts` `currentIteration` (and `heroLogo` if the logo changes) |
| E-Lab application form and deadline | `e-lab.ts` `applicationUrl`, `applicationDeadlineDate` ("27.09.2026"), `applicationDeadlineTime` ("22:00", Munich time) |
| E-Lab open or closed | `e-lab.ts` `applicationsOpen` is the master switch; applications also close by themselves at exactly the deadline |
| Next E-Lab window (shown while closed) | `e-lab.ts` `nextApplicationWindow` |
| E-Lab length, money raised | `e-lab.ts` `programWeeks`, `ventureFundingMillions` |
| E-Lab selection funnel (teams per gate, drawn to scale on /e-lab) | `e-lab.ts` `selection` (`applications`, `admitted`, `midterm`, `selectionDay`, `finalPitch`; each at most the one before) |
| Membership recruiting round | `src/config/membership.ts` `applicationsOpen` (master switch; applications also close by themselves at the deadline), `applicationUrl`, `round` (`name`, `opens`, `deadlineDate` "27.10.2026" + `deadlineTime` "23:59" in Munich time, `interviews`, `onboarding`) |
| Founding year, members, alumni, majors, universities, nationalities | `src/config/organization.ts` `organizationFacts` |
| The mission statement (brand guide wording; /apply and /qanda quote it) | `src/config/organization.ts` `brandMission` |
| Role emails, social links, the Imprint's address line | `src/config/contact.ts` (`contactEmails`, `socialLinks`, `registeredOfficeAddressLine`) |
| Who handles partnership requests: finder CC addresses, the "Book a call" Cal.eu page and its host | `src/config/contact.ts` `partnershipContact` |
| Community figures quoted in copy (Makeathon size; started applications per round and acceptance rate, drawn as the /partners selection field) | `src/config/community.ts` `communityFacts` (the batch size comes from `admittedPerBatchOf()`, the initiative's age comes from `yearsSinceFounding()`) |
| Research output and hackathon reach (publications, venues, hackathon participants) | `src/config/impact.ts` `impactFacts` |
| Page titles, descriptions, canonical URLs, JSON-LD | `src/config/seo.ts` |
| Site URL, name, tagline, `absoluteUrl()` | `src/config/site.ts` `siteConfig` |
| Legal identity, registered office, register number, representatives | `src/config/organization.ts` `legalEntity` |
| Header and footer links | `src/config/navigation.ts` |
| Header call to action between recruiting rounds | `src/config/navigation.ts` `headerCtaSetting` (`fallback`, optional `override`); `member` shows automatically while `isMembershipApplicationOpen` (the dated round window); campaigns in `src/config/campaigns.ts` (CMS `campaign`) |
| The standing CTA labels ("Become a Member", "Become a Partner", "Apply now", "Questions and answers") | `src/config/calls-to-action.ts` `callToActionLabels` (code only) |

Derived values (`officialMembers`, `recruitingTimeline`, `isMembershipApplicationOpen`, `applicationProgress`, `eLabProgramSummary`, `eLabCompletedIterations`,
`eLabApplicationsCloseAt`, `eLabPhaseCopy`) are computed in the same files, each also as a
function of the facts (`deriveSiteFacts(facts)`, `officialMembersOf`, `eLabPhaseCopyOf`, ...)
that pages call on the render's facts; change the base fact, not the derived one.

## Change a fact

1. After launch, an editable fact changes in the Studio (`/studio`), not here. For the
   code value (the fallback, and the site before launch), edit the field in the config file.
   Keep the documented format (German date and 24-hour time for E-Lab deadlines, which
   `parseMunichDateTime` parses in Europe/Berlin).
2. Run `pnpm exec vitest run test/content-facts.test.ts src/features/e-lab/e-lab-content.test.ts`
   (plus the config file's own test, if any). They must pass without editing tests: the tests
   derive expectations from config. CI runs the full suite and E2E on the PR.
3. Check the pages that show it (`rg -n "<exportName>" src`) with `pnpm dev`, or on the PR's
   Vercel preview.

## Add a new fact

1. Add it to the fitting config file with TSDoc (what it is, its format, who updates it).
2. Replace every literal copy in pages and `data/`: pages read it from the render's facts
   (add it to `SiteFacts`, the `siteSettings` schema and its query when editors should own it),
   and copy uses a `{{placeholder}}` (`lib/content-tokens.ts` and `contentTokensFor` in
   `config/content-tokens.ts`).
3. If the fact has a recognizable shape, add a pattern to `hardcodedFacts` in
   `test/content-facts.test.ts` so future literals fail with a pointer to the config file.
4. Add a row to "Updating site facts" in `docs/contributor-guide.md` and to the table above.

## Guard tests

- `test/content-facts.test.ts`: hard-coded fact patterns (program length, member counts, phase
  wording, role emails, social links, Tally forms) outside `src/config` and the mock CMS, plus
  consistency checks between config, FAQs and stats.
- `src/features/e-lab/e-lab-content.test.ts`: the E-Lab deadline and application window, FAQ,
  testimonials, the traced venture and its milestone sources, the startup list and content images.
- `src/features/partners/partnerships.test.ts`: the partnership finder, the partner directory
  and the partnership contact emails (CC addresses).

If a guard test fails, move the fact into config; don't loosen the pattern.

## Ask a maintainer, don't guess

Legal facts (register number, representatives, addresses in the imprint and privacy pages),
figures without a source, and anything the legal pages state need confirmation from the TUM.ai
maintainers. Keep the current value, add `// TODO(content): <question>` next to it, and list it
in the PR instead of changing it.
