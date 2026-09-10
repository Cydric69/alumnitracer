---
name: shared/artifact-handoff
description: The structured result contract every agent returns, and how the next agent consumes it.
agents: [orchestrator, analyst, researcher, builder, design-critic, tester, repairer, reviewer]
domains: [process, contracts]
triggers: [artifact, handoff, result, output contract, report]
dependencies: [shared/context-minimization]
conflicts: []
priority: 8
version: 1.0.0
---

# Artifact handoff

## What it is

The typed envelope agents exchange instead of prose. It is validated: an artifact claiming
`status: ok` while reporting failing tests or remaining work is rejected by the runtime.

## The contract

```json
{
  "status": "ok | partial | failed | blocked | needs_review",
  "summary": "one to three sentences, the verdict first",
  "files_changed": ["path:reason"],
  "tests_run": 0, "tests_passed": 0, "tests_failed": 0,
  "evidence": ["command -> observed output", "path:line -> fact"],
  "risks": ["what could still be wrong, and where"],
  "remaining_work": ["what is not done"],
  "uncertainties": ["what you guessed"],
  "next_action": "agent name or null",
  "skills_loaded": ["..."]
}
```

Write it with `aos artifact write <task_id> <agent> --json '<payload>'`; read the prior
stage with `aos artifact read <task_id> [agent]`.

## Rules

1. `status: ok` requires zero failing tests and an empty `remaining_work`. Anything else is
   `partial`. This is enforced; do not fight it, report honestly.
2. `summary` leads with the outcome, not the process.
3. `evidence` holds observations, not intentions.
4. `next_action` names the agent that should act, or `null` when the work is complete.
5. Never put a transcript in `summary`. Never put an apology anywhere.

## Consuming an artifact

Read `status` first, then `remaining_work` and `risks` — those are the parts written for
you. Do not re-derive what `evidence` already establishes; do spot-check load-bearing
claims (a passing suite claim before a review sign-off is worth re-running).

## Common mistakes

- Reporting `ok` with a caveat buried in prose. The caveat belongs in `remaining_work`.
- Empty `evidence` on a status claim.
- `files_changed` without reasons, which forces the reviewer to diff blind.
