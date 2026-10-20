---
paths:
  - "src/styles/**"
  - "**/*.css"
---

# Styles and tokens

`src/styles/index.css` imports Tailwind v4, `@tum.ai/ui-kit/tailwind.css`,
`@tum.ai/ui-kit/shell.css` and app-specific `partner-rotation.css`. The kit owns
brand scales, type scale, motion tokens, tone surfaces and shared utilities.
The Next.js font loader in the site layout supplies Manrope and `--font-manrope`;
keep the optional kit `fonts.css` out of this app to avoid duplicate loading.

- Keep the kit's Tailwind source registration so compiled package classes are
  generated. Do not copy the package's stylesheet or utility lists locally.
- Shared token or shell-style changes belong in an upstream kit release and an
  exact dependency upgrade. Keep route composition and partner rotation here.
- Every app rule lives in a cascade layer or an `@utility`: unlayered rules beat
  Tailwind utilities and break overrides. Route CSS follows the same contract.
- Use semantic theme tokens. Brand anchors come from `docs/brand/source` and the
  versioned kit brand guide linked in `docs/design-system.md`. Never invent hues
  or use raw hex, `rgb()` or stock palette values in app markup or page CSS.
- Use the kit type scale, `zoom-media` (with `group/zoom`) and `scroll-mt-header`
  instead of arbitrary font sizes or copied utilities.
- Motion uses `transform`, `opacity` and `--ease-brand`, with reduced-motion
  paths. Never animate filters on text. Partner artwork swaps retain their
  existing app-owned mechanics and image policy.
- The kit shell intentionally sets a brand-black root canvas for Safari chrome.
  Read `docs/browser-quirks.md` before changing root, header or dialog integration.
- Biome lints app CSS. CI Visual checks route changes; accept intended baselines
  through `update-snapshots` and list the diffs in the PR (`docs/testing.md`).
