# Learnings — `silent-failure-hunter`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-11 — A hardening PR added a zod schema for query-filter params (eventFiltersSchema) whose year regex ^\\d{4}$ is stricter than the write-side schema (year: string min1 max20, free-text input), and buildContentFilters() returns {} on safeParse failure
<!-- key:720865963657 -->

- **Trigger:** A hardening PR added a zod schema for query-filter params (eventFiltersSchema) whose year regex ^\\d{4}$ is stricter than the write-side schema (year: string min1 max20, free-text input), and buildContentFilters() returns {} on safeParse failure
- **Lesson:** When a diff adds read-side validation, diff it against the WRITE-side schema for the same field. A stricter read schema plus a permissive fallback turns real stored data into a parse failure, and 'return empty filter' turns that into 'return every row' — including rows an isActive filter was supposed to hide. Always check what the fallback does to the OTHER fields in the same parse: one bad field drops the whole object, so a security filter (status=active) dies with the cosmetic one (year).
- **Guard:** Lint rule: flag a safeParse/try whose failure branch returns an empty object/array literal with no logging, in a function feeding a DB query. Cheaper still: a runtime assert that the read filter schema accepts every value the write schema can produce.
- **Promoted:** no

