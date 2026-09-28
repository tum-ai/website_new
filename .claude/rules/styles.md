---
paths:
  - "src/styles/**"
  - "**/*.css"
---

# Styles and tokens

`src/styles/index.css` is the only global stylesheet: Tailwind v4 configured in CSS (`@theme`),
brand anchors, the violet and ink scales, the type scale, motion tokens and the tone surfaces.

- **Cascade layers:** every rule lives in `@layer base`, `@layer components`, `@layer utilities`
  or an `@utility`. Unlayered CSS beats every Tailwind utility and breaks overrides. Page CSS
  (`src/features/<domain>/<domain>.css`) follows the same contract.
- **Brand values:** anchors come from `docs/brand/source` (see the `tumai-ci` skill). Tonal steps
  are derived from them; never invent hues. Raw hex and `rgb()` belong only in token definitions
  here, never in components or page CSS: reference `var(--...)` or theme colours instead.
- **Tones:** each `[data-tone]` block defines the full semantic set (`--tone-canvas`, `-raised`,
  `-sunken`, `-fg`, `-fg-muted`, `-fg-subtle`, `-hairline`, `-hairline-strong`, `-accent`,
  `-glow`). Every foreground pair must meet WCAG AA on its canvas; check contrast when you change one.
- **New utilities:** write `@utility name { ... }`, not a plain class. Use the existing
  `zoom-media` (hover zoom, with `group/zoom`) and `scroll-mt-header` (anchor offset) instead of
  copies.
- **Type:** add a `--text-*` token rather than arbitrary sizes in markup.
- **Motion:** keyframes animate `transform` and `opacity`; never `filter` on text (Safari clips
  filtered boxes and cuts descenders). Use `--ease-brand`; entrances at most 1.2 s. Anything that
  loops or enters needs a reduced-motion path.
- **Safari:** the `html` background is brand black on purpose (Safari tints its status bar and
  toolbar from it). Read `docs/browser-quirks.md` and the comments tagged Safari before changing
  root, header or dialog styles.
- Biome lints CSS (`css.parser.tailwindDirectives`). Token changes affect every page: CI's Visual
  job shows which routes moved; accept intended diffs with the `update-snapshots` label and list
  them in the PR (`docs/testing.md`).
