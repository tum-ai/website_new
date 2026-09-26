@AGENTS.md

## Claude Code

- Skills in `.claude/skills/` are symlinks to `.agents/skills/`. Use them for the tasks they name:
  `add-page`, `ds-component`, `site-facts`, `cms-content-model`, `ui-verify`, `pr-ready`, `tumai-ci`.
- Rules in `.claude/rules/` load automatically when you read files under their `paths`.
- Before opening a PR that changes UI, run the `design-reviewer` subagent on the diff and fix or
  answer every finding; run `a11y-reviewer` for interactive or markup changes, and `docs-sync` when
  paths, commands or conventions change.
- Hooks (`.claude/settings.json`): `format.sh` runs Biome on every file you edit and reports what it
  can't fix; fix those findings. `protect-generated.sh` blocks edits to `pnpm-lock.yaml` and
  `*.generated.ts`; run pnpm or the generator instead.
- Personal settings go in `.claude/settings.local.json` (gitignored), not in the shared settings.
