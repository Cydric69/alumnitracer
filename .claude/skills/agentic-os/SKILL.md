---
name: agentic-os
description: The Agentic OS - classify a task's difficulty and risk, route the minimum sufficient skills, plan the workflow, delegate to the right agents, and audit completion. Use at the start of any non-trivial engineering task, when deciding whether to delegate, before a dangerous command, or when asked about agentic-os / aos status, doctor, queue, or learning.
---

# Agentic OS

The installation lives at `.claude/agentic-os`. Its CLI is `.claude/agentic-os/bin/aos`
(runtime) and `.claude/agentic-os/bin/agentic-os` (installer: `doctor`, `status`, `update`,
`uninstall`).

## It runs automatically

The `UserPromptSubmit` hook classifies every prompt and injects the plan and the routed
skills into context before the turn starts. The `[Agentic OS]` block at the top of the turn
is that plan - follow it.

Run it by hand only when the prompt and the real task differ, or for a sub-task:

```bash
.claude/agentic-os/bin/aos plan "<the task in one sentence>"
```

Returns: difficulty level 1-5, risk level, workflow stages, the agents to use, the model
tier per agent, and the exact skill files to read.

Level 1 → do it directly. Level 2 → builder, plus tester if behaviour changed.
Level 3 → analyst → builder → tester → reviewer. Level 4-5 or risk ≥ high → the full
workflow under `aos-orchestrator`, with review and guards.

## Queue

Multi-step work goes in the persistent queue so it survives session loss:

```bash
aos queue add "Build the CSV serializer"
aos queue add "Test the CSV serializer" --depends-on 1
aos queue ready          # what may run now
aos queue set 1 COMPLETED
```

## Handoff

Agents exchange validated artifacts, never transcripts:

```bash
aos artifact write 1 builder --json '{"status":"ok","summary":"...","tests_run":12,"tests_passed":12}'
aos artifact read 1
```

## Completion

```bash
aos audit <task_id> --criteria "criterion one|criterion two"
```
Exit code 0 only when every criterion has evidence and nothing is failing or outstanding.

## Safety

Every Bash command and file write passes the guards automatically (PreToolUse hook).
`aos guard '<command>'` shows the verdict in advance. BLOCK ends the approach; CONFIRM and
REVIEW_REQUIRED go to the user with the reason. Never work around a guard.

## Learning

```bash
aos learn observe <task_id> <kind> <key>   # record what happened
aos learn hypothesize                      # recurring patterns -> candidate policies
aos learn challengers | active | history   # what is being tested / in force
aos learn rollback <policy_id>             # every learned policy is reversible
```
Learned policies bias routing, classification, and workflow depth. They can never weaken a
guard, skip tests, or remove an approval — the safety floor rejects such candidates.
