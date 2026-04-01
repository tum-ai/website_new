# TUM.ai Brand CI

This summary is based on the repo-local brand material and implementation sources in this repository.

## Source bundle

- `docs/brand/source/brand-guidelines.pdf`
- `docs/brand/source/colors.jpeg`
- `src/styles/index.css`
- `src/components/ui/button.tsx`
- `public/assets/tum_ai_logo_new.svg`
- `public/assets/logo_new_white_standard.png`
- `public/assets/Manrope.ttf`

## Identity

The brand guide frames TUM.ai as the hub where academic rigor meets a make-it-happen builder mindset.

Mission:
"To bridge the gap between theory and practice by empowering students to build the future of AI."

Vision:
"To be the defining hub for AI talent in Europe, a community where technical precision meets human creativity."

When designing UI, that means:

- clean and technically precise, not noisy
- confident and modern, not playful or random
- community-oriented, but still restrained

## Color system

Confirmed from `docs/brand/source/colors.jpeg` and `src/styles/index.css`.

- White: `#FFFFFF`
- Minimal Grey: `#EFEFEF`
- Lavender Tint: `#F5EFFF`
- Electric Lavender / TUM.ai violet: `#9A64D9`
- Dark Purple: `#523573`
- Dark Indigo: `#1B0049`
- Black: `#0D0214`
- Electric Fade gradient: `#9A64D9 -> #523573`

Usage rules:

- Keep `#9A64D9` as the main brand accent and primary action color.
- Use `#523573` for stronger hover or pressed states.
- Use `#F5EFFF` sparingly for tinted backgrounds and highlights.
- In dark mode, backgrounds and surfaces should stay in the `#0D0214`, `#1B0049`, `#523573` family.
- Avoid random per-item accent colors.
- Avoid old or alternate purples from exploratory palettes unless a task explicitly asks for a legacy look.

## Typography

The website loads `Manrope` from `public/assets/Manrope.ttf`.

Usage rules:

- Use Manrope for UI typography.
- Favor clear hierarchy through size and weight, not decorative styling.
- Keep copy crisp and minimal.

## Logos

Repo-local logo assets:

- `public/assets/tum_ai_logo_new.svg`
- `public/assets/logo_new_white_standard.png`

Usage rules:

- Prefer the provided exported assets.
- Do not redraw, recolor, crop, or rebuild the logo manually.
- Use the white logo variant only on dark enough backgrounds.

## Buttons and interaction

The canonical implementation is `src/components/ui/button.tsx`.

Current brand-consistent behavior:

- Primary button fill: brand violet
- Primary button text: white or minimal gray depending on context
- Primary hover: dark purple
- Outline buttons: restrained border, subtle tinted hover
- Interaction should feel crisp and confident, not bouncy or playful

## Website-specific UI direction

For this repo specifically:

- If a design choice looks more generic SaaS than TUM.ai, simplify it.
