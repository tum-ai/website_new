# GitHub Actions

Short reference for the workflows under `.github/workflows/`.

## Main Workflows

- `lint.yml`: main PR gate. Runs `pnpm verify` on pull requests to `main`.
- `verify-pr-title.yml`: enforces semantic PR titles.
- `dependency-review.yml`: fails PRs that introduce vulnerable dependencies.
- `codeql.yml`: GitHub code scanning for JavaScript/TypeScript on PRs, pushes to `main`, and a weekly schedule.

## Dependabot Automation

- `dependabot-triage.yml`: labels and auto-approves safe Dependabot PRs.
- `dependabot-maintenance.yml`: rebases open Dependabot PRs and merges labeled Dependabot PRs once checks are green.

Safe auto-merge is limited to:

- GitHub Actions updates
- direct development dependencies
- minor and patch updates only

Major updates and non-safe dependency updates still require manual review.

## Dependabot Config

`.github/dependabot.yml` currently:

- checks the root app, `packages/notion-data`, and GitHub Actions daily
- groups minor/patch updates to reduce PR noise
- groups security updates separately

## If Automation Stops Working

Check, in order:

1. the workflow run logs in GitHub Actions
2. whether the PR is still authored by `dependabot[bot]`
3. whether the PR is a major update, a production dependency, or has maintainer changes
4. whether the repo still allows Actions to approve and merge PRs
