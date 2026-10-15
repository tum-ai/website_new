---
paths:
  - "src/config/**"
  - "src/features/**/data/**"
---

# Site facts and content contracts

Editable facts and copy have one CMS owner; code holds types, derivation and structural wording,
not a second editorial payload. See `site-facts`, `cms-content-model` and ADR 0009.

- **Facts:** site settings own organization/community/impact/E-Lab/league facts, role emails,
  social links, booking URL/host and footer tagline. Application windows own dates/forms/switches.
  Campaigns own dated CTAs. Read `getSiteFacts`, `getMembershipWindow`, `getELabWindow` and
  `getContentTokens` per render; pass plain props to client islands. Required facts fail visibly
  if missing or malformed. Derive figures and metadata from those rendered facts.
- **Code owners:** legal wording/identity/addresses, canonical site URL, SEO structure, navigation,
  standing CTA labels, private partnership CC addresses, geometry and interface strings.
  Keep types/derivation in their matching `config` or feature module; `config` imports only
  `config` and `lib`.
- **Copy:** editable copy comes from a server-only CMS slice. Facts remain `{{placeholders}}`,
  filled with `fillCmsCopy` per render. Page tokens such as `{{count}}` use `fillPageTokens`.
  No local copy fallback, backfill builders or source selector. Optional cleared fields and
  empty lists stay cleared; required singletons and structural content fail visibly.
- **Time:** parse Munich wall-clock deadlines with `parseMunichDateTime` / `munich-time.ts`,
  never `new Date` on local-time text.
- **Data modules:** `.ts` with no JSX, typed, kebab-case, holding contracts/logic only. Synthetic
  editorial fixtures live independently under `src/lib/cms-fixtures/` and are opt-in local data.
  Keep pending editorial asset source files local until a separately authorized repair upload.
- **Content quality:** no em/en dashes in visible text. Fix unambiguous typos; never invent facts,
  figures, names or legal wording. Keep unclear existing legal content and flag the question.
  Role emails displayed on pages come from the render's CMS facts.
- **Verification:** content-facts guards prevent duplicate literals; test parsers, derivation,
  optional clearing and required failure. Honor task-scoped no-tests requests. Mock checks are
  distinct from read-only real dataset readiness (`sanity:ready --dataset redesign`).
