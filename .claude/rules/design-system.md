---
paths:
  - "src/components/ds/**"
---

# Design system (`src/components/ds`)

Every page is built from these components, so a change here changes the whole site. Usage, tokens
and composition rules: `docs/design-system.md`. API conventions: the header of `index.ts` (being
written in W1-DS); where it and this file disagree, the header wins.

- **Imports:** only sibling ds files and `@/lib/cn`. Never features, shell, config or other `lib`
  modules (Biome `noRestrictedImports` + `src/architecture.test.ts`). Data comes in through props.
- **Public API:** export every public component and its `XProps` type from `index.ts`; consumers
  import from `@/components/ds`, never from a file path.
- **API shape:** cva for every variant prop. `as` picks the root element and `headingAs` the heading
  level. `tone` means band tone only; text colour is `emphasis`. Props extend `ComponentProps<...>`
  (React 19 ref as prop), not `ComponentPropsWithoutRef`. TSDoc on every export and every prop.
- **Tokens:** read semantic tokens (`bg-canvas`, `bg-raised`, `text-fg`, `text-fg-muted`,
  `border-hairline`, `text-highlight`, `bg-fg/[0.07]`) so the component works on every tone. No raw
  hex or `rgb()`, no stock palette, no arbitrary font sizes: use the type-scale utilities.
- **Server first:** no `"use client"` unless the file uses state, effects, refs to the DOM or
  browser APIs. Interactive behaviour comes from Base UI (`@base-ui/react`), never a clickable `div`.
- **Motion:** CSS first. `motion-safe:` on entrances and loops, `motion-reduce:` fallbacks on
  transitions that move. Animate only `transform` and `opacity` (no `filter` on text), use
  `ease-brand`, stay within 300 ms to 1.2 s. framer-motion only through `m` inside `LazyMotion`.
- **Accessibility:** next/image instead of `<img>`; decorative SVGs get `aria-hidden`; links that
  open a new tab say so; icon-only buttons require `aria-label`; no array-index keys.
- **Every change** needs, in the same PR:
  - a colocated `<name>.test.tsx` for behaviour (Testing Library, user-event, `axe()`),
  - the showcase in `src/features/design-system/design-system-page.tsx` rendering each variant,
  - the component list in `docs/design-system.md` updated.
  The `ds-component` skill walks through it; run the `design-reviewer` subagent before the PR.
