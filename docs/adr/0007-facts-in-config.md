# 0007: Site facts live once in config

- **Status:** Accepted; editable fact storage superseded by [ADR 0009](0009-cms-content-source.md)
- **Date:** 2026-09-25 (redesign, #262); extended 2026-09-26 to 2026-09-28 (#267, W2 streams)

## Current ownership

As of 2026-10-03, editable facts live once in CMS settings/windows/campaigns and are read through
`src/config` readers. Config keeps types, derivation and reviewed code-only concerns, with no
local editorial fallback. Required CMS facts fail visibly if missing/malformed. The original
centralization rationale below remains; use ADR 0009 and the `site-facts` skill for current work.

## Context

Facts that change per semester or cohort (E-Lab deadline and cohort, recruiting round, member
figures, contact emails) were typed into several pages, and the copies disagreed: E-Lab length,
member counts, two register numbers, the Makeathon size in three places, and the site URL literal
26 times in `seo.ts` alone. Editors changing a deadline had to find every copy.

## Decision

- Each fact lives once in `src/config/` (`e-lab.ts`, `membership.ts`, `organization.ts`,
  `contact.ts`, `community.ts`, `site.ts`, `navigation.ts`, `seo.ts`). Pages, FAQs and JSON-LD
  import it and build their sentences with template strings. Derived values (for example
  `officialMembers`, `eLabProgramSummary`) are computed next to the base fact.
- Deadlines are Munich wall-clock strings parsed with `parseMunichDateTime`, so an edit reads the
  way it shows on the site.
- `test/content-facts.test.ts` scans page code for fact-shaped literals (program length, member
  counts, role and personal emails, register numbers, site URLs, form links) and fails with a
  pointer to the config file. Its allowlist can only shrink: a second test fails on entries that
  no longer match.
- Tests derive their expectations from config, so a documented config edit keeps them green.
- Facts without a confirmed source stay as they are with a `TODO(content)` for a maintainer.

## Consequences

- A new recruiting round or deadline is one edit, and the E-Lab page closes applications at the
  deadline by itself.
- Adding a new recurring fact means a config entry with TSDoc, replacing every literal, and a
  guard pattern.
- `headerCtaSetting` and `selectHeaderCta` in `config/navigation.ts` keep the header's call to
  action a pure function of plain input, so a CMS source with dated campaigns can feed it later.

## Sources

- #262 (What: "Site facts in one place"), #267 (Config; content-facts patterns and allowlist)
- Cleanup audit (P1 architecture: "Facts are not fully centralized")
- `src/config/`, [contributor-guide.md](../contributor-guide.md) ("Updating site facts")
