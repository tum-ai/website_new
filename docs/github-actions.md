# GitHub Actions

Reference for the workflows under `.github/workflows/`. Every job checks out with
`persist-credentials: false` (except where it must push), pins actions to a commit SHA with a
version comment, and has a timeout. Jobs that need the toolchain use the composite action
`.github/actions/setup` (pnpm from `package.json`, Node from `.node-version`, cached store,
`pnpm install --frozen-lockfile`).

## CI (`ci.yml`)

Runs on every pull request (no branch filter, so stacked PRs into feature and integration branches
get CI too), on merge-queue runs and on pushes to `main`. A newer push to the same PR cancels the
running one; pushes to `main` are never cancelled.

| Job | What it runs | Gates `Verify` |
| --- | --- | --- |
| Lint | `biome ci --error-on-warnings .` (every rule is an error) | yes |
| Typecheck | `pnpm typecheck`, then `pnpm sanity:typegen:check` (fails if the generated Sanity types are stale) | yes |
| Unit tests | `pnpm test:coverage`, which fails below the coverage thresholds in `vitest.config.ts`; uploads `coverage` | yes |
| Build | `pnpm build`, then `pnpm test:perf` with `USE_MOCK_CMS=1` and `MOCK_CMS_NOW=2026-10-01T12:00:00Z` | yes |
| E2E (1/4 to 4/4) | `pnpm test:e2e --shard=N/4` in the Playwright container with `USE_MOCK_CMS=1`; uploads a blob report per shard | yes (every shard) |
| E2E report | merges the shards' blob reports into one HTML report with traces (`playwright-report` artifact) | no |
| Visual (1/2, 2/2) | `pnpm test:e2e:visual --shard=N/2` in the Playwright container; uploads `visual-report-N` | yes (both shards) |
| Knip | `pnpm knip` (unused files, exports and dependencies; configured in `knip.json`) | yes |
| Verify | fails unless every gating job succeeded | the required check |

Notes:

- **CMS evidence.** Build/perf and Playwright use independent synthetic CMS-shaped fixtures
  and the fixed clock `2026-10-01T12:00:00Z`. Mock mode is gated off on Vercel. CI validates
  query/parser/UI behavior; real dataset completeness is a separate read-only
  `sanity:ready --dataset redesign` check, never inferred from CI.

- **Sharding.** E2E is split across four runners and Visual across two, and each shard builds the
  site itself. A shared build job would put its whole runtime on the critical path, and runner
  minutes are free for this public repository. The shards run in
  `mcr.microsoft.com/playwright:v1.63.0-noble`, so browsers are preinstalled.
- **Visual** compares every route at 390 and 1440 px against the committed baselines in
  `e2e/__screenshots__/linux/`, in the same image the baselines are captured in.
- **Playwright image.** The tag appears in `ci.yml` (E2E, Visual) and `e2e-snapshots.yml` and must
  match `@playwright/test`. Each of those jobs runs `.github/actions/check-playwright-image`, which
  fails when the image lacks the browser builds the installed package expects, and names the tag
  to set. A Dependabot Playwright update therefore fails until the tags are bumped in the same PR.
- **Knip** gates `Verify`. Its ignores (generated Sanity types and dependencies that are open
  questions) are listed with reasons in `knip.json`. Before it
  became a gate it ran with step-level `continue-on-error`, which kept the job green but still
  left a "Process completed with exit code 1" annotation on the run.
- **Verify** runs even when a dependency failed (`if: always()`), so it fails instead of being
  skipped; a skipped check would count as passing.

Reading a failure: `gh pr checks <number>` lists the jobs, and
`gh run view --job <job id> --log-failed` prints the failing step's log. Artifacts:
`gh run download <run id> -n <name>` (`visual-report-1` and `-2` are large; comparing baseline PNG
files from git is often quicker, see [testing.md](testing.md)).

## Visual baselines (`e2e-snapshots.yml`)

Captures the Linux visual baselines in the Playwright image and commits them.

- **Trigger on a PR:** add the `update-snapshots` label
  (`gh pr edit <number> --add-label update-snapshots`). The job checks out the PR branch, runs
  `pnpm test:e2e:visual --update-snapshots=changed` (rewrites only baselines that fail the
  comparison, and writes missing ones), commits `e2e/__screenshots__/linux` as
  `github-actions[bot]`, and removes the label, also after a failure, so adding it again retries.
  Only branches of this repository qualify; a fork's token can't push.
- **Manual dispatch** works only once the workflow is on the default branch (GitHub resolves
  `workflow_dispatch` there); it commits to the dispatched branch unless `commit` is off.
- **The bot commit starts no CI.** Pushes made with `GITHUB_TOKEN` don't trigger other workflows.
  The next regular push runs CI against the new baselines. Don't close and reopen a PR just to
  re-run CI.
- After a capture, check that only the PR's routes changed and restore any other PNG from the
  base branch in a `[skip ci]` commit.

The full workflow for accepting a visual change is in [testing.md](testing.md#visual-baselines).

## `[skip ci]`

When the pushed head commit's message contains `[skip ci]`, GitHub starts none of the `push` or
`pull_request` workflows for that push (CI, Spell Check, CodeQL and the others). Use it
for commits that don't change what CI checks: restoring screenshots after a capture, or a pure
sync merge of the base branch into a PR that was already green. Code changes always get a CI run.

## Other pull-request checks

- `verify-pr-title.yml` (**Verify PR-Title**): the PR title must be a Conventional Commit.
- `spellcheck.yml` (**Spell Check**): `crate-ci/typos` over the repository, configured in
  `_typos.toml` (the German legal pages are excluded).
- `dependency-review.yml` (**Dependency Review**): fails PRs that add dependencies with known
  vulnerabilities of moderate severity or higher.
- `codeql.yml` (**CodeQL**): code scanning for JavaScript and TypeScript on PRs, pushes to `main`
  and weekly.
- `workflow-lint.yml` (**Workflow Lint**): only when workflows or actions change; actionlint and
  zizmor (pinned version) over `.github/`, including `dependabot.yml`. Both fail the check. zizmor's
  triage lives in `.github/zizmor.yml`: the `self-repository` audit is off because actionlint
  doesn't parse the `uses: $/...` syntax it suggests yet.

## Dependabot

`.github/dependabot.yml` checks npm packages and GitHub Actions (including `.github/actions/*`)
daily. Minor and patch updates are grouped (`vitest`, `playwright`, `npm-dev`, `npm-prod`,
`github-actions`), and security updates get their own groups. A 7-day `cooldown` holds back new
releases for a week (security updates are exempt), so a compromised version is usually yanked
before it is proposed. Playwright updates land on their own
because they change the browsers and therefore the visual baselines.

- `dependabot-triage.yml`: labels Dependabot PRs and approves safe ones. It runs on
  `pull_request_target` and never checks out or runs PR code.
- `dependabot-maintenance.yml`: on weekdays rebases open Dependabot PRs; hourly it squash-merges
  Dependabot PRs labelled `automerge` once every check has passed.

Safe auto-merge is limited to GitHub Actions updates and direct development dependencies, minor
and patch only. Major updates and production dependencies need a manual review.

### If automation stops working

Check, in order:

1. the workflow run logs in GitHub Actions;
2. whether the PR is still authored by `dependabot[bot]`;
3. whether the PR is a major update, a production dependency, or has maintainer changes;
4. whether the repository still allows Actions to approve and merge PRs.

## Local hooks

`lefthook.yml` installs a pre-commit hook on `pnpm install` (skipped when `CI` is set): Biome
fixes and re-stages staged files, and `typos` checks them when it's installed
(`brew install typos-cli`).
