---
name: ds-component
description: Use when a website change needs a shared UI primitive, variant, token or behaviour, or when upgrading @tum.ai/ui-kit. Routes primitive changes to the standalone kit and covers consumer imports, app adapters, the exact dependency pin, showcase coverage and versioned documentation.
---

# Use or upgrade a shared UI component

`@tum.ai/ui-kit` owns shared UI. This website consumes its exact pinned release
(currently 0.2.0), and owns page composition, content and site-specific adapters.
Do not create a local primitive barrel, copy kit source or patch installed files.

## 1. Check the public contract

Read `docs/design-system.md` and its versioned links to the kit's public API,
component notes and API conventions. Inspect the installed public declarations
when checking a prop. Search existing page usage before inventing another pattern.

Import primitives and public types from `@tum.ai/ui-kit`; generic header, footer
and skip link come from `@tum.ai/ui-kit/shell`. Never deep-import implementation
files. `references/component-template.md` shows a consumer composition example.

## 2. Choose the owner

- Existing public component or variant: compose it in the feature using semantic
  tokens and its public styling hooks.
- App-specific content, CMS data, navigation, logo URLs or image policy: keep it
  in the feature or `src/components/shell/` adapter and pass plain props.
- Shared primitive, variant, token or interaction behaviour: implement and test
  it in the standalone kit, following that repository's instructions. Release
  upstream before consuming the change here; do not fork it inside the website.

## 3. Integrate the release

Update the exact package version with pnpm and regenerate the lockfile. Read the
release's public contracts and account for any pre-1.0 breaking changes. Keep the
kit CSS imports and compiled-source registration; this app continues loading
Manrope through Next.js. Retain `#app-root`, `#main-content`, `MotionProvider` and
app-owned partner-rotation mechanics. Set media optimizer props explicitly where
the application's CMS policy requires them.

## 4. Showcase and documentation

Update `src/features/design-system/design-system-page.tsx` and interactive demos
for changed public variants. `showcase-coverage.test.ts` reads the installed root
public API and verifies its runtime exports are used. Check the dev or preview
`/design-system`; it remains 404 in production.

Update versioned kit links in `docs/design-system.md` and other consumer guidance
when the dependency changes. Keep API tables and component tests upstream;
document website-specific integration contracts here.

## 5. Verify

Run `pnpm lint`, `pnpm typecheck` and targeted Vitest for changed app tests,
including `src/features/design-system/showcase-coverage.test.ts`. Full suites,
build, E2E and visual checks run in this website's PR CI. Follow `ui-verify` for
intended visual diffs and `.claude/agents/design-reviewer.md` for design review.
