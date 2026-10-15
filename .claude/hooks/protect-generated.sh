#!/bin/sh
# PreToolUse hook (Edit|Write|MultiEdit): block hand edits to generated files.
#
# Exit 2 blocks the tool call and shows stderr to Claude. Anything unexpected
# (no node, unparsable input) exits 0, so the hook never blocks by accident.
#
# Input: the hook JSON on stdin; the path is `tool_input.file_path`.

file=$(node -e '
let raw = "";
process.stdin.on("data", (chunk) => { raw += chunk; });
process.stdin.on("end", () => {
  try {
    process.stdout.write(JSON.parse(raw).tool_input?.file_path ?? "");
  } catch {}
});
' 2>/dev/null) || exit 0

case "$file" in
pnpm-lock.yaml | */pnpm-lock.yaml)
  echo "Blocked: pnpm-lock.yaml is generated. Change dependencies with pnpm (pnpm add, remove or update) and let pnpm rewrite the lockfile." >&2
  exit 2
  ;;
*.generated.ts)
  echo "Blocked: $file is generated. For Sanity types, change the schema in src/sanity/schemas/ or the query in src/lib/sanity-queries.ts, then run pnpm sanity:typegen." >&2
  exit 2
  ;;
esac
exit 0
