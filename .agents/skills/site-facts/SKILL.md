---
name: site-facts
description: Where every changeable fact on the TUM.ai website lives and which tests guard it. Use whenever a task changes or adds a date, deadline, cohort, application link or phase, member count, contact email, social link, address, register number, site URL or tagline, or any number or name that appears on several pages, for example "open E-Lab applications", "new recruiting round", "update the member count" or "change the partners email". Also use when a test in test/content-facts.test.ts or e-lab-content.test.ts fails.
---

# Site facts

Facts that change per semester, cohort or year live once in `src/config/`. Pages, FAQs and JSON-LD
read them, so one edit updates the whole site, and tests fail if a page types a fact in directly.

## Which file

| Fact | File and field |
|---|---|
| E-Lab cohort | `src/config/e-lab.ts` `currentIteration` (and `heroLogo` if the logo changes) |
| E-Lab application form and deadline | `e-lab.ts` `applicationUrl`, `applicationDeadlineDate` ("27.09.2026"), `applicationDeadlineTime` ("22:00", Munich time) |
| E-Lab open or closed | `e-lab.ts` `applicationsOpen` is the master switch; applications also close by themselves at exactly the deadline |
| Next E-Lab window (shown while closed) | `e-lab.ts` `nextApplicationWindow` |
| E-Lab length, money raised | `e-lab.ts` `programWeeks`, `ventureFundingMillions` |
| Membership recruiting round | `src/config/membership.ts` `applicationsOpen` (master switch; applications also close by themselves at the deadline), `applicationUrl`, `round` (`name`, `opens`, `deadlineDate` "27.10.2026" + `deadlineTime` "23:59" in Munich time, `interviews`, `onboarding`) |
| Founding year, members, alumni, majors, universities, nationalities | `src/config/organization.ts` `organizationFacts` |
| Role emails, social links, the Imprint's address line | `src/config/contact.ts` (`contactEmails`, `socialLinks`, `registeredOfficeAddressLine`) |
| Who handles partnership requests: finder CC addresses, the "Book a call" Cal.eu page and its host | `src/config/contact.ts` `partnershipContact` |
| Community figures quoted in copy (Makeathon size) | `src/config/community.ts` `communityFacts` (the initiative's age comes from `yearsSinceFounding()`) |
| Research output and hackathon reach (publications, venues, hackathon participants) | `src/config/impact.ts` `impactFacts` |
| Page titles, descriptions, canonical URLs, JSON-LD | `src/config/seo.ts` |
| Site URL, name, tagline, `absoluteUrl()` | `src/config/site.ts` `siteConfig` |
| Legal identity, registered office, register number, representatives | `src/config/organization.ts` `legalEntity` |
| Header and footer links | `src/config/navigation.ts` |
| Header call to action between recruiting rounds | `src/config/navigation.ts` `headerCtaSetting` (`fallback`, optional `override`); `member` shows automatically while `membershipConfig.applicationsOpen` |

Derived values (`officialMembers`, `recruitingTimeline`, `isMembershipApplicationOpen`, `applicationProgress`, `eLabProgramSummary`, `eLabCompletedIterations`,
`eLabApplicationsCloseAt`, `eLabPhaseCopy`) are computed in the same files; change the base fact,
not the derived one.

## Change a fact

1. Edit the field in the config file. Keep the documented format (German date and 24-hour time
   for E-Lab deadlines, which `parseMunichDateTime` parses in Europe/Berlin).
2. Run `pnpm exec vitest run test/content-facts.test.ts src/features/e-lab/e-lab-content.test.ts`
   (plus the config file's own test, if any). They must pass without editing tests: the tests
   derive expectations from config. CI runs the full suite and E2E on the PR.
3. Check the pages that show it (`rg -n "<exportName>" src`) with `pnpm dev`, or on the PR's
   Vercel preview.

## Add a new fact

1. Add it to the fitting config file with TSDoc (what it is, its format, who updates it).
2. Replace every literal copy in pages and `data/` with an import and a template string.
3. If the fact has a recognizable shape, add a pattern to `hardcodedFacts` in
   `test/content-facts.test.ts` so future literals fail with a pointer to the config file.
4. Add a row to "Updating site facts" in `docs/contributor-guide.md` and to the table above.

## Guard tests

- `test/content-facts.test.ts`: hard-coded fact patterns (program length, member counts, phase
  wording, role emails, social links, Tally forms) outside `src/config` and the mock CMS, plus
  consistency checks between config, FAQs and stats.
- `src/features/e-lab/e-lab-content.test.ts`: E-Lab timeline, FAQ, metrics and startups content.
- `src/features/partners/partnerships.test.ts`: the partnership finder, the partner directory
  and the partnership contact emails (CC addresses).

If a guard test fails, move the fact into config; don't loosen the pattern.

## Ask a maintainer, don't guess

Legal facts (register number, representatives, addresses in the imprint and privacy pages),
figures without a source, and anything the legal pages state need confirmation from the TUM.ai
maintainers. Keep the current value, add `// TODO(content): <question>` next to it, and list it
in the PR instead of changing it.
