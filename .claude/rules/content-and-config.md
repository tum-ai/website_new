---
paths:
  - "src/config/**"
  - "src/features/**/data/**"
---

# Site facts and static copy

Facts that change per semester, cohort or year live in exactly one `src/config` file; pages,
FAQs and JSON-LD derive their copy from it. The `site-facts` skill maps each fact to its file.

- **Where facts live:** `e-lab.ts` (cohort, application phase, deadline, program length, funding),
  `membership.ts` (recruiting round), `organization.ts` (founding year, member counts),
  `contact.ts` (role emails, social links, registered office), `seo.ts` (metadata, JSON-LD).
  Coming in W1-Data: `site.ts` (URL, name, tagline, `absoluteUrl()`), `navigation.ts`, and legal
  identity in `organization.ts`.
- **Never type a fact into page code or `data/`:** import it and build the sentence with a
  template string. `test/content-facts.test.ts` fails on hard-coded fact patterns; extend its
  patterns when you centralize a new fact rather than silencing them.
- **Derive, don't duplicate:** compute values such as `officialMembers` or
  `eLabProgramSummary` from the base facts.
- **Time:** deadlines are Munich wall-clock strings parsed with `parseMunichDateTime`
  (`@/lib/munich-time`); never `new Date("...")` on local time.
- **Imports:** `config` may import only `config` and `lib`.
- **Data files** are `.ts` (no JSX), kebab-case, typed, and reference only `/assets/...` paths that
  exist (`test/public-assets.test.ts`).
- **Copy:** no em or en dashes in visible text (use a comma, colon, period or spaced hyphen). Fix
  unambiguous typos. Don't invent or change facts, figures, names or legal wording without a
  source: flag them for a maintainer instead. No personal email addresses; role addresses come
  from `contact.ts`.
- **Verify:** `pnpm test` runs `content-facts` and `src/features/e-lab/e-lab-content.test.ts`.
  Tests derive their expectations from config, so a documented config edit must not break them.
