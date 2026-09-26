---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
---

# Tests

- **Vitest projects** (`vitest.config.ts`): `*.test.ts` runs in node, `*.test.tsx` in jsdom with
  Testing Library, jest-dom and the axe matcher from `vitest.setup.ts`. Colocate tests with the
  code; `test/` is only for repo-wide checks (content facts, public assets, favicon, perf).
- **Test behaviour, not source text.** No reading source files to grep for strings, no
  change-detector assertions on literals. Derive expected values from config so a documented
  config edit keeps tests green.
- **Component tests:**
  ```tsx
  import { axe } from "@test/axe";
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";

  const user = userEvent.setup();
  const { container } = render(<Thing />);
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(await axe(container)).toHaveNoViolations();
  ```
  Query by role and accessible name. jsdom axe skips `color-contrast` and `region`; Playwright
  covers those on real pages.
- **Mocks:** `server-only` is stubbed by the config. Mock `next/headers`, `next/navigation` and
  `next-sanity` with `vi.mock`. Use `vi.useFakeTimers()`/`vi.setSystemTime()` for deadlines.
- **Never build in `pnpm test`.** Build-output assertions go in `test/perf/*.perf.ts`.
- **E2E** (`e2e/`, Playwright; the harness is coming in W1-E2E):
  - use the shared helpers in `e2e/fixtures.ts`; the server runs a production build with
    `USE_MOCK_CMS=1` and a fixed `MOCK_CMS_NOW`;
  - every route runs in chromium and webkit; axe must report no serious or critical WCAG 2 A/AA
    violations;
  - prefer role and name locators; mask animated regions (marquee, mosaic, count-up) in
    `toHaveScreenshot`;
  - visual baselines come only from the CI Playwright container (the update workflow), never from
    a local macOS run;
  - mark a known failure `test.fixme` with a comment naming the owner, never delete it.
