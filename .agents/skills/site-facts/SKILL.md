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
| E-Lab application form and deadline | `e-lab.ts` `applicationUrl`, `applicationDeadlineDate` ("26.09.2026"), `applicationDeadlineTime` ("23:59", Munich time) |
| E-Lab open or closed | `e-lab.ts` `applicationsOpen` is the master switch; applications also close by themselves after the deadline minute |
| Next E-Lab window (shown while closed) | `e-lab.ts` `nextApplicationWindow` |
| E-Lab length, money raised | `e-lab.ts` `programWeeks`, `ventureFundingMillions` |
| Membership recruiting round | `src/config/membership.ts` `applicationsOpen`, `applicationUrl`, `timeline` |
| Founding year, members, alumni, majors, universities, nationalities | `src/config/organization.ts` `organizationFacts` |
| Role emails, social links, registered office | `src/config/contact.ts` |
| Page titles, descriptions, canonical URLs, JSON-LD | `src/config/seo.ts` |
| Site URL, name, tagline, `absoluteUrl()` | `src/config/site.ts` (coming in W1-Data) |
| Legal identity, register number, representatives | `src/config/organization.ts` (coming in W1-Data) |
| Header and footer links | `src/config/navigation.ts` (coming in W1-Data) |

Derived values (`officialMembers`, `eLabProgramSummary`, `eLabCompletedIterations`,
`eLabApplicationsCloseAt`, `eLabPhaseCopy`) are computed in the same files; change the base fact,
not the derived one.

## Change a fact

1. Edit the field in the config file. Keep the documented format (German date and 24-hour time
   for E-Lab deadlines, which `parseMunichDateTime` parses in Europe/Berlin).
2. Run `pnpm test`. It must pass without editing tests: the tests derive expectations from config.
3. Check the pages that show it (`rg -n "<exportName>" src`) with `pnpm dev`.

## Add a new fact

1. Add it to the fitting config file with TSDoc (what it is, its format, who updates it).
2. Replace every literal copy in pages and `data/` with an import and a template string.
3. If the fact has a recognizable shape, add a pattern to `hardcodedFacts` in
   `test/content-facts.test.ts` so future literals fail with a pointer to the config file.

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
maintainers. Flag them in the PR instead of changing them.
