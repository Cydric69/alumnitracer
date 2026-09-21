# Learnings — `architect`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-10 — Brief cites a framework convention (e.g. Next 'middleware vs proxy') and a candidate new dependency (jose) as if both were settled.
<!-- key:2ad29edd9185 -->

- **Trigger:** Brief cites a framework convention (e.g. Next 'middleware vs proxy') and a candidate new dependency (jose) as if both were settled.
- **Lesson:** Grep node_modules for the framework's own constants and runtime assertions BEFORE accepting a dependency add. Next 16.1.1 build/analysis/get-page-static-info.js:552 states 'Proxy always runs on Node.js runtime' and throws on any runtime export, so jsonwebtoken works and jose was an unnecessary dependency. Also check the entry template for the required export NAME (build/templates/middleware.js:61 picks mod.proxy, not mod.middleware) - a renamed file with the old export silently loads nothing.
- **Guard:** scripts/verify/proxy-convention.sh: fail if a root proxy.ts lacks 'export function proxy'/'export async function proxy', if app/middleware.ts still exists, or if 'jose' appears in package.json dependencies.
- **Promoted:** no

