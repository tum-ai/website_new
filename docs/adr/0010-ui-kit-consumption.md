# 0010: Consume the standalone TUM.ai UI kit

- **Status:** Accepted
- **Date:** 2026-10-03

## Context

The website redesign supplied the shared primitives, tone tokens, utilities and
shell later extracted into the standalone UI kit. Keeping both implementations
would give shared APIs and interaction fixes two owners.

## Decision

Pin `@tum.ai/ui-kit` to 0.2.0 and consume its public root exports directly.
Use `@tum.ai/ui-kit/shell` behind site-specific adapters. Remove the local
primitive implementation and barrel. Import the kit's Tailwind and shell CSS,
retaining the existing Next.js Manrope loader and app partner-rotation CSS.

The kit owns shared component behaviour, styling, tokens, tests and generated API
docs. The app owns routes, feature composition, content, navigation, CMS fetching,
image policy and integration adapters. Shared changes ship through an upstream
release and deliberate dependency upgrade; do not copy or patch kit code here.

## Consequences

- Site layout and content remain app-owned; package 0.2.0 supplies its shared
  hover, press, focus and accordion treatments.
- The development/preview `/design-system` showcase uses installed public exports
  and preserves production 404. Its coverage guard reads the package's shipped
  public declarations, so removing the old local barrel does not weaken it.
- Consumer documentation links to the versioned upstream API instead of duplicating
  component tables. Package upgrades update these links and the showcase together.
- This app retains `#app-root`, `#main-content` and `MotionProvider`, its shell data
  adapters and media optimizer policy. Website CI verifies package integration,
  while primitive tests and Storybook stay in the kit.

## Sources

- [UI kit 0.2.0](https://github.com/tum-ai/ui-kit/tree/v0.2.0)
- [Consumer contract](../design-system.md)
- [ADR 0001](0001-base-ui-over-radix.md), [ADR 0002](0002-tone-tokens-and-cascade-layers.md)
