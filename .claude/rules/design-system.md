---
paths:
  - "src/features/design-system/**"
  - "src/components/shell/**"
  - "package.json"
---

# UI kit integration

The exact dependency `@tum.ai/ui-kit@0.2.0` owns shared primitives, tokens,
utilities, interaction behaviour and generic shell components. This repository
owns content, page composition and the adapters in `src/components/shell/`.
Read `docs/design-system.md` for site rules and versioned kit API links.

- Import primitives and public types from `@tum.ai/ui-kit`; generic shell
  components come from `@tum.ai/ui-kit/shell`. Never deep-import internals,
  recreate a local primitive barrel, copy kit components or patch `node_modules`.
- Keep navigation, site facts, CMS fetching and image policy in app adapters.
  Supply them to kit components through public props. Set kit media `unoptimized`
  using `isUnoptimizedRemoteImage` from `@/lib/image-optimization`: Sanity image CDN
  URLs stay optimized, other HTTP(S) hosts bypass the optimizer. Apply the same
  policy to nested media props; kit defaults differ from this app.
- Use semantic tone tokens, type-scale utilities and public styling hooks.
  Do not locally override shared hover, press, focus or reduced-motion behaviour.
- A shared variant, token or behaviour change belongs in the kit repository.
  Consume it after an upstream release by deliberately updating the exact pin.
- A kit upgrade updates the showcase and versioned documentation links together.
  `showcase-coverage.test.ts` checks the installed public runtime exports against
  the showcase; `MotionProvider` is exercised by the site layout.
- Package component tests, generated API docs and Storybook belong upstream.
  Website tests cover app adapters, content, routing and package integration.
  Locally run lint, typecheck and targeted tests; full suites/build/E2E/Visual
  run in PR CI. Follow the `ds-component` skill for the handoff and integration.
