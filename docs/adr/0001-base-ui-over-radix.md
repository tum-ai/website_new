# 0001: Base UI for interactive primitives

- **Status:** Accepted
- **Date:** 2026-09-25 (redesign, #262)

## Current ownership

The redesign decision below remains in force. Shared primitives and token definitions
now ship in [`@tum.ai/ui-kit` 0.2.0](https://github.com/tum-ai/ui-kit/tree/v0.2.0);
the former local implementation paths describe the historical redesign. The app
imports the kit and owns page composition and integration. See
[ADR 0010](0010-ui-kit-consumption.md).

## Context

Before the redesign, interactive UI came from shadcn-style wrappers in `src/components/ui/`
(button, card, carousel, dialog, tabs, ...) built on Radix packages, next to hand-rolled pieces.
The redesign PR lists the accessibility gaps this left: a `div`-based FAQ and a mobile menu
without a focus trap. Pages were also styled ad hoc against unlayered global `button` and `a`
rules.

## Decision

Interactive behaviour in the design system (`src/components/ds`) comes from Base UI
(`@base-ui/react`): accordion, tabs, dialog, collapsible, filter chips and buttons used as
triggers. Styling is Tailwind against the tone tokens ([ADR 0002](0002-tone-tokens-and-cascade-layers.md)).
The shadcn/Radix wrappers, their `components.json`, and the Radix and `tw-animate-css` packages
were removed once every page used the ds (`b3ec7e8`).

Why Base UI rather than keeping and restyling the Radix wrappers is not recorded in the PRs or
commits. What is recorded is the goal, "a reusable component library on Base UI for accessible
behavior" (`b719228`), and that the old wrappers were unused afterwards.

## Consequences

- Anything interactive is a Base UI part or a native element; the design rules forbid clickable
  `div`s, and the ds tests cover keyboard and focus behaviour per component.
- Base UI parts are client components, so ds wrappers need no `"use client"` of their own unless
  they add state.
- Observed costs, each fixed in the ds:
  - Base UI's focus guards alone leaked focus in Safari, whose Tab key skips links; `Dialog` now
    makes the page root inert while open (`useInertBackground`, see
    [browser-quirks.md](../browser-quirks.md)).
  - Base UI cancels key events on `aria-disabled` buttons, so the carousel's arrow keys did
    nothing while focus sat on a disabled arrow; the carousel hands focus over itself (#269).
  - `@date-fns/tz` is a Base UI peer dependency and had to be added explicitly (#263).
- Focus guards hold focus briefly before wrapping it back into a dialog, so the E2E focus-trap
  check polls after each Tab (#268).

## Sources

- #262 (What: "Removed: the shadcn/Radix `ui/*` wrappers"; Why), commits `b719228`, `b3ec7e8`
- #263 (`@date-fns/tz`), #268 (focus guards), #269 (carousel keys)
