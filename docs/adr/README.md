# Architecture decision records

Short records of decisions that shape the codebase: the context, what was decided, and what it
costs. They were written after the fact, during the #262 redesign cleanup, from the pull
requests, commits and plans of that work. Where the reason for a choice was not written down at
the time, the record says so and describes the trade-off as it shows in the code instead of
inventing one.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-base-ui-over-radix.md) | Base UI for interactive primitives, replacing the shadcn/Radix wrappers | Accepted |
| [0002](0002-tone-tokens-and-cascade-layers.md) | Tone tokens (`data-tone`) and cascade layers for all CSS | Accepted |
| [0003](0003-feature-folders.md) | Feature folders; routes import page modules; page-free indexes | Accepted |
| [0004](0004-vitest-and-playwright.md) | Vitest for unit and component tests, Playwright for E2E, a11y and visual | Accepted |
| [0005](0005-mock-cms.md) | A build-time mock CMS with a fixed clock | Accepted |
| [0006](0006-sanity-typegen.md) | Sanity TypeGen for query result types | Accepted |
| [0007](0007-facts-in-config.md) | Site facts live once in `src/config/`, guarded by a test | Accepted |
| [0008](0008-dist-dir-isolation.md) | Separate Next.js dist dirs for dev and production | Accepted |

## Writing a new ADR

Copy the shape of an existing one: `NNNN-kebab-title.md` with Status, Date, Context, Decision,
Consequences and Sources. Record a decision when it constrains how future code is written, or when
someone would otherwise undo it without knowing why. Superseding an ADR means a new one that
links back; the old one gets `Status: Superseded by NNNN`.
