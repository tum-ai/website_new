---
name: pr-ready
description: Pre-PR checklist for the TUM.ai website. Use before opening or marking ready any pull request, and whenever someone asks "is this ready?", "open a PR", "prepare the PR" or "what's left before review". It covers the local checks (lint, typecheck, targeted Vitest), the design and accessibility reviewers, docs drift, the remote CI run with the visual-baseline label flow, and the PR template with evidence.
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

## 2. Local checks (agents: nothing else locally)

```bash
pnpm lint
pnpm typecheck
pnpm exec vitest run <the test files you wrote or touched>
```

Agents don't run the full unit suite, `pnpm build`, `pnpm verify`, E2E or the visual spec
locally: CI runs all of them on the PR. Fix every Biome warning in the files you touched, and
don't add `biome-ignore` without a reason.

## 3. Tests match the change

Check the "Tests per change" table in `AGENTS.md`: unit tests for logic, component tests for
islands and ds behaviour, `siteRoutes` and a spec for new routes or flows, and an explanation for
each intended visual diff.

## 4. Reviews (UI changes)

- Run the `design-reviewer` subagent on the diff (other harnesses: follow
  `.claude/agents/design-reviewer.md`); fix findings or answer them in the PR.
- Run the `a11y-reviewer` subagent for interactive or markup changes.
- For changes to the header, footer, dialogs, page tops or bottoms, or the root background, hand
  the maintainer the iPhone checklist from the `ui-verify` skill.

## 5. Docs and guidance

If paths, commands, conventions, env vars or component APIs changed, update `AGENTS.md`,
`.claude/rules/`, `.agents/skills/` and `docs/` in the same PR (a ds prop change updates the API
reference in `docs/design-system.md`). Run the `docs-sync` subagent to find stale spots.

## 6. Push once, then let CI run

1. Push and open the PR as a draft unless asked otherwise:
   `gh pr create --draft --base <base>`.
2. Poll, don't block: `gh pr checks <number>` every 30 to 60 seconds. Don't sit on
   `gh pr checks --watch` for many minutes.
3. On a failure, read the log (`gh run view --job <job id> --log-failed`), batch every fix, and
   push once. Never close and reopen the PR to re-run CI.
4. **Visual job failed on an intended change:** check the diffs (compare baseline PNG files from git,
   or the `visual-report` artifact), then `gh pr edit <number> --add-label update-snapshots`. The
   snapshot workflow captures only the changed baselines, commits them as `github-actions[bot]`
   and removes the label. Its commit starts no CI; the next push runs it.
5. Check the bot's commit touched only your routes. Restore any other PNG from the base branch in
   a commit whose message contains `[skip ci]`.

## 7. PR body

Fill in `.github/pull_request_template.md` (What, Why, How, checklist). Add:

- Verification: the exact local commands you ran and the CI result (job names and state).
- Visual changes: a table of route, what changed and cause for every changed baseline, or "none".
- Screenshots at 390 and 1440 px for UI changes (upload them to the PR, don't commit them).
- Handoffs: changes needed outside this PR's scope, and facts or legal wording for a maintainer
  (`TODO(content)` items).
