---
paths:
  - "src/config/**"
  - "src/features/**/data/**"
---

# Site facts and static copy

Facts that change per semester, cohort or year live in exactly one `src/config` file; pages,
FAQs and JSON-LD derive their copy from it. The `site-facts` skill maps each fact to its file.

- **Where facts live:** `e-lab.ts` (cohort, application phase, deadline, program length, funding,
  the `selection` funnel), `membership.ts` (recruiting round), `organization.ts` (founding year,
  member counts, `brandMission`, legal entity, register number, representatives), `contact.ts`
  (role emails, `partnershipContact`, social links, the Imprint address line), `community.ts`
  (Makeathon size, `yearsSinceFounding()`), `impact.ts` (publications, venues, hackathon
  participants), `site.ts` (URL, name, tagline, `absoluteUrl()`), `navigation.ts` (links,
  `headerCtaSetting`, per-route header options), `seo.ts` (metadata, JSON-LD).
- **Never type a fact into page code or `data/`:** import it and build the sentence with a
  template string. `test/content-facts.test.ts` fails on hard-coded fact patterns; extend its
  patterns when you centralize a new fact rather than silencing them.
- **Derive, don't duplicate:** compute values such as `officialMembers` or
  `eLabProgramSummary` from the base facts.
- **CMS fallbacks:** content served by a content slice (`content.ts`, see the `cms-content-model`
  skill) keeps its code version here as the fallback and backfill source. Keep its shape exactly
  what the page renders; facts inside such copy are `{{placeholders}}` filled with
  `fillCodeTemplate(template, contentTokens)` (`lib/content-tokens.ts`,
  `config/content-tokens.ts`), so CMS text stays derived too.
- **Time:** deadlines are Munich wall-clock strings parsed with `parseMunichDateTime`
  (`@/lib/munich-time`); never `new Date("...")` on local time.
- **Imports:** `config` may import only `config` and `lib`.
- **Data files** are `.ts` (no JSX), kebab-case, typed, and reference only `/assets/...` paths that
  exist (`test/public-assets.test.ts`).
- **Copy:** no em or en dashes in visible text (use a comma, colon, period or spaced hyphen). Fix
  unambiguous typos. Don't invent or change facts, figures, names or legal wording without a
  source: keep the text, add `// TODO(content): <question>` and flag it in the PR. No personal
  email addresses in pages; addresses come from `contact.ts`.
- **Verify:** CI's unit job runs `test/content-facts.test.ts` and
  `src/features/e-lab/e-lab-content.test.ts`; locally, `pnpm exec vitest run` on those files.
  Tests derive their expectations from config, so a documented config edit must not break them.
