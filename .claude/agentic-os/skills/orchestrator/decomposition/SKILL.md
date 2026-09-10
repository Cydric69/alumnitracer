---
name: orchestrator/decomposition
description: Break a request into tasks that are independently executable, independently verifiable, and correctly ordered.
agents: [orchestrator, analyst]
domains: [process, planning]
triggers: [plan, decompose, break down, tasks, steps, milestones]
dependencies: [shared/context-minimization]
conflicts: []
priority: 8
version: 1.0.0
---

# Decomposition

## What it is

Turning one request into the smallest set of tasks that can be executed and checked
separately, with the dependency edges made explicit.

## When it applies

Level 3+ work, or anything touching more than about three files or more than one system.

## When it does not apply

Level 1-2 work. Decomposing a one-file change into five tasks creates coordination cost
with no benefit — the panel fills up and nothing goes faster.

## How to use it

1. **Find the seams.** Good task boundaries fall where an artifact changes hands: a schema
   exists, an endpoint responds, a component renders, a test suite goes green. Bad
   boundaries fall in the middle of one edit.
2. **One outcome per task.** If a task's title needs "and", it is two tasks.
3. **Verifiable independently.** Each task states how you would know it is done.
4. **Order by dependency, not by convenience.** Build before test before review. Schema
   before the code that reads it. Contract before both sides of it.
5. **Mark what is parallel.** Two tasks are parallel only if they share no files and no
   dependency edge. Same-file tasks serialise, always.
6. **Register them**: `aos queue add "<title>" --depends-on <ids>`. The queue infers
   obvious edges (test → build) but never assume — check with `aos queue ready`.

## Sizing

A task should be one focused agent session: roughly 15 minutes to two hours of work. Too
small and you pay delegation overhead for nothing; too large and failure is expensive and
the artifact becomes unreviewable.

## Common mistakes

- Decomposing by file rather than by outcome.
- A "final integration" task that hides all the real risk at the end.
- Serialising work that has no dependency, doubling wall-clock time.
- Parallelising two tasks that both edit the router.

## Example

"Add CSV export to the reports page" →
1. Add `to_csv(rows)` serializer + unit tests (no deps)
2. Add `/reports/export` endpoint using it (deps: 1)
3. Add the download button and loading state (deps: 2)
4. E2E: click export, assert file contents (deps: 3)
5. Review (deps: 1,2,3,4)

Tasks 1 and 3's markup could overlap; they touch different files, so 1 and the button's
static markup can run in parallel — but 3's wiring waits for 2.
