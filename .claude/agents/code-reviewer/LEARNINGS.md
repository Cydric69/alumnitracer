# Learnings — `code-reviewer`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-10 — A committed agent-config JSON carries hook commands with an absolute /Users/<name>/... path, while sibling entries in the same file use the portable $CLAUDE_PROJECT_DIR form.
<!-- key:0f9ab54ccee9 -->

- **Trigger:** A committed agent-config JSON carries hook commands with an absolute /Users/<name>/... path, while sibling entries in the same file use the portable $CLAUDE_PROJECT_DIR form.
- **Lesson:** On any scaffolding or config PR, grep added lines for an absolute home path FIRST: git diff main...BRANCH | grep -E '^\+.*/(Users|home)/[a-z]+/'. Installer-generated config is machine-local by default; it breaks every other clone silently because a failed hook does not fail the build.
- **Guard:** A pre-commit or CI grep over committed agent JSON and CLAUDE.md for '/Users/|/home/[a-z]' exiting nonzero — cheaper and never forgotten, unlike a reviewer turn.
- **Promoted:** no

