---
name: ds-component
description: How to add or change a component in the TUM.ai design system (src/components/ds). Use whenever you create a new ds component, add a variant, size or prop to an existing one, change its markup or behaviour, or replace a hand-rolled feature pattern with a shared component, even for a one-line variant tweak. It covers the API conventions (cva, as/headingAs, tone/emphasis, ref as prop, TSDoc), the colocated test with axe, the barrel export, the /design-system showcase and the docs table.
---

# Add or change a ds component

The design system is the only place shared UI is defined, and every page depends on it. A change
is done when the component, its test, its showcase entry and its docs row all agree.

## 1. Check before building

- Read `docs/design-system.md` and the conventions in the header of `src/components/ds/index.ts`
  (being written in W1-DS; if the header and this skill disagree, the header wins).
- Search for an existing component or variant first (`rg -n "export function" src/components/ds`).
  Prefer a new variant on an existing component to a near-duplicate component.

## 2. Write the component

Follow `references/component-template.md`. The short version:

- One kebab-case file per component family in `src/components/ds/`.
- Imports: React, Base UI, `class-variance-authority`, `lucide-react`, `next/*`, sibling ds files
  and `@/lib/cn`. Nothing from features, shell, config or other `lib` modules.
- Every variant prop is a cva variant with `defaultVariants`; export the `xStyles` function when
  other components compose it.
- `as` changes the root element; `headingAs` changes the heading level. `tone` only means a band
  tone; text colour is `emphasis`.
- Props: `ComponentProps<"div">` (React 19 passes `ref` as a prop) intersected with
  `VariantProps<typeof xStyles>`; export the type as `XProps`.
- TSDoc on the component and on every prop you add: what it is for, not how it works.
- Semantic tone tokens only, type-scale utilities, `motion-safe:`/`motion-reduce:`, `ease-brand`.
- No `"use client"` unless the component needs state, effects or browser APIs; use Base UI for
  interactive behaviour.

Export it (and `XProps`) from `src/components/ds/index.ts`.

## 3. Test it

Colocate `src/components/ds/<name>.test.tsx` (jsdom project). Cover what could regress:

- Rendering and the accessible role and name of each variant that changes semantics.
- Keyboard and pointer behaviour with `userEvent` (open, close, arrow keys, Escape, focus return).
- Reduced motion or no-JS output where the component animates (`matchMedia` stub, or
  `renderToString` for server output).
- `expect(await axe(container)).toHaveNoViolations()` with `axe` from `@test/axe`.
- Type-level contracts with `expectTypeOf` when a prop is required (for example `aria-label`).

## 4. Showcase and docs

- Render every variant in `src/features/design-system/design-system-page.tsx`, inside the fitting
  `Block` (or a new one); interactive demos go in `design-system-interactive.tsx`. Check it at
  `/design-system` with `pnpm dev`.
- Update the component list and props in `docs/design-system.md` ("Components"), and the rules if
  the component introduces one.

## 5. Verify

```bash
pnpm lint && pnpm typecheck && pnpm test
```

A change to an existing component can move pixels on every page: run the visual E2E specs
(coming in W1-E2E) or the `ui-verify` skill on the pages that use it
(`rg -l "<ComponentName>" src/features`), and run the `design-reviewer` subagent before the PR.
