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
- LSP: `.claude/settings.json` enables `typescript-lsp@claude-plugins-official`. Prefer the LSP
  tool (definition, references, hover, diagnostics) over text search for TypeScript symbols. It
  needs `typescript-language-server` on `PATH`
  (`npm install -g typescript-language-server typescript`); if the tool says no server is
  available for `.ts`/`.tsx`, run `/plugin install typescript-lsp@claude-plugins-official` and
  start a new session.
- Local checks are `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run <files>`; the rest runs
  in the PR's CI (see "Where tests run" in `AGENTS.md`).
- Personal settings go in `.claude/settings.local.json` (gitignored), not in the shared settings.
