---
name: pr-ready
description: Pre-PR checklist for the TUM.ai website. Use before opening or marking ready any pull request, and whenever someone asks "is this ready?", "open a PR", "prepare the PR" or "what's left before review". It runs the full gate, the E2E specs for touched routes, the design and accessibility reviewers, checks docs and agent guidance for drift, and fills in the PR template with evidence and screenshots.
---

# PR ready

Reviewers and CI should find nothing you could have found yourself. Work through the list and
report what you actually ran; never claim a check you didn't run.

## 1. Scope

- `git status` and `git diff <base>...HEAD --stat`: only files that belong to this change. No
  stray lockfile edits, generated files, screenshots or local config.
- Commits follow Conventional Commits; the PR title is a Conventional Commit too (CI checks it).
- Base branch: `main` normally. During the redesign cleanup, `chore/redesign-cleanup` (or the
  stream branch named in the task).

## 2. Gate

```bash
pnpm verify                 # lint + typecheck + test + build + test:perf
pnpm test:e2e               # at least the specs for touched routes, chromium + webkit
pnpm knip                   # no new unused files, exports or dependencies
```

Fix every Biome warning in the files you touched. Don't add `biome-ignore` without a reason.

## 3. Tests match the change

Check the "Tests per change" table in `AGENTS.md`: unit tests for logic, component tests for
islands and ds behaviour, E2E and the route list for new routes or flows, updated visual baselines
for intended visual changes (and an explanation for each diff).

## 4. Reviews (UI changes)

- Run the `design-reviewer` subagent on the diff; fix findings or answer them in the PR.
- Run the `a11y-reviewer` subagent for interactive or markup changes.
- Run the `ui-verify` skill: screenshots at 390 and 1440 px, keyboard and reduced-motion pass,
  and the iPhone Safari checklist items that the change could affect.

## 5. Docs and guidance

If paths, commands, conventions, env vars or component APIs changed, update `AGENTS.md`,
`.claude/rules/`, `.agents/skills/` and `docs/` in the same PR. Run the `docs-sync` subagent to
find stale spots.

## 6. PR body

Fill in `.github/pull_request_template.md` (What, Why, How, checklist). Add:

- Verification: the exact commands you ran and their results.
- Screenshots at 390 and 1440 px for UI changes (upload them to the PR, don't commit them).
- Handoffs: changes needed outside this PR's scope, and facts or legal wording for a maintainer.

Open it as a draft unless asked otherwise, then watch CI (`gh pr checks <number> --watch`).
