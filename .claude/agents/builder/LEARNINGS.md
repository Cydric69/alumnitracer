# Learnings — `builder`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-11 — A module-scope `const X = process.env.Y; if (!X) throw` still fails tsc when X is used inside an exported function (TS2769 / possibly-undefined)
<!-- key:d3cfba9e6820 -->

- **Trigger:** A module-scope `const X = process.env.Y; if (!X) throw` still fails tsc when X is used inside an exported function (TS2769 / possibly-undefined)
- **Lesson:** Re-bind after the guard: `const SECRET: string = raw;`. Control-flow narrowing at module scope does not reach into closures.
- **Guard:** npx tsc --noEmit
- **Promoted:** no

## 2026-09-11 — Brief cites line numbers and handler names in a Next.js page (e.g. handleSave:200)
<!-- key:9e977b42a8cf -->

- **Trigger:** Brief cites line numbers and handler names in a Next.js page (e.g. handleSave:200)
- **Lesson:** Grep for the symbol before trusting it — in app/dashboard/events-announcements/page.tsx the handler is handleSubmit, ~30 lines off the cited line. Names drift; line numbers drift more.
- **Guard:** NONE-YET
- **Promoted:** no

