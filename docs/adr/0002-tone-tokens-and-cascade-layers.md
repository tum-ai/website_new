# 0002: Tone tokens and cascade layers

- **Status:** Accepted
- **Date:** 2026-09-25 (redesign, #262); layering of page CSS completed in the cleanup (#278)

## Context

The pre-redesign site mixed brand colours with stock Tailwind greys and purples, and fought
unlayered global `button` and `a` rules with `!important` workarounds (#262, "Why"). Unlayered CSS
beats every Tailwind utility, so overrides needed ever more specificity. The same card also had to
work on light reading bands and dark hero bands.

## Decision

- **Tones.** A page is a sequence of full-bleed bands, each `<Section tone>` setting `data-tone`
  (`paper`, `mist`, `lavender`, `ink`, `night`, `violet`). Each tone defines the full semantic
  set (`--tone-canvas`, `-raised`, `-sunken`, `-fg`, `-fg-muted`, `-fg-subtle`, `-hairline`,
  `-hairline-strong`, `-accent`, `-glow`), exposed as utilities such as `bg-canvas`, `text-fg`,
  `border-hairline` and `text-highlight`. Components read these, never raw colours, so one
  component works on every band. Every foreground pair meets WCAG AA on its canvas.
- **Brand values.** The anchors and the type scale come from the 2026 brand guide
  (`docs/brand/source/`); tonal steps are derived from them. Raw hex and `rgb()` appear only in
  the token definitions in `src/styles/index.css`.
- **Layers.** Every rule lives in `@layer base`, `@layer components`, `@layer utilities` or an
  `@utility`, including page CSS such as `features/partners/partners.css`. Utilities therefore
  always win over component and base rules without `!important`.
- **Naming.** `tone` only ever means a band tone; a text colour within a tone is `emphasis`
  (ds API convention, #269).

## Consequences

- Colour decisions are made per band, not per element; per-item accent colours are off-brand by
  rule.
- Adding a tone means defining the whole semantic set and checking contrast for each pair.
- The audit found `partners.css` unlayered, which broke the contract; it was moved into layers
  with tokens during the cleanup. `.claude/rules/styles.md` and the design reviewer check new CSS
  for it.
- There is no dark mode; dark surfaces are the `ink` and `night` tones.

## Sources

- #262 (Why; How: "Tokens ... all in cascade layers"), commit `b719228`
- Cleanup audit (P1 design system: token discipline, unlayered `partners.css`), #269, #278
- [design-system.md](../design-system.md) ("Tones"), `src/styles/index.css`
