#!/bin/sh
# PostToolUse hook (Edit|Write|MultiEdit): format the file Claude just edited.
#
# Runs `biome check --write` on that one file, which applies Biome's safe fixes
# (formatting, import order, Tailwind class order), the same as the lefthook
# pre-commit job. It never fails the edit: if Biome still reports problems, they
# go back to Claude as `additionalContext` so it can fix them. Anything
# unexpected (no node, no Biome install, unparsable input) exits 0 silently.
#
# Input: the hook JSON on stdin. The file path is `tool_input.file_path`
# (absolute). Biome runs from the file's own checkout, so edits inside a git
# worktree use that worktree's biome.json and node_modules.

input=$(cat)

file=$(printf '%s' "$input" | node -e '
let raw = "";
process.stdin.on("data", (chunk) => { raw += chunk; });
process.stdin.on("end", () => {
  try {
    process.stdout.write(JSON.parse(raw).tool_input?.file_path ?? "");
  } catch {}
});
' 2>/dev/null) || exit 0

case "$file" in
*.js | *.jsx | *.mjs | *.cjs | *.ts | *.tsx | *.mts | *.cts | *.json | *.jsonc | *.css) ;;
*) exit 0 ;;
esac
[ -f "$file" ] || exit 0

root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || root=$CLAUDE_PROJECT_DIR
biome="$root/node_modules/.bin/biome"
[ -n "$root" ] && [ -x "$biome" ] || exit 0

if output=$(cd "$root" && "$biome" check --write --colors=off \
  --no-errors-on-unmatched --files-ignore-unknown=true "$file" 2>&1); then
  exit 0
fi

# Biome fixed what it safely could; report the rest without blocking.
printf '%s' "$output" | FILE="$file" node -e '
let raw = "";
process.stdin.on("data", (chunk) => { raw += chunk; });
process.stdin.on("end", () => {
  const report = raw.length > 6000 ? `${raw.slice(0, 6000)}\n[truncated]` : raw;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext:
        `Biome formatted ${process.env.FILE} but still reports problems ` +
        `(the edit was kept). Fix them or explain why not:\n${report}`,
    },
  }));
});
'
exit 0
