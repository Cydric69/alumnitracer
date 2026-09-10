---
name: orchestrator/delegation-economics
description: Decide whether delegating to a subagent is worth its cost - and when to just do the work.
agents: [orchestrator, router]
domains: [process, efficiency]
triggers: [delegate, subagent, agent, orchestrate, parallel, spawn]
dependencies: []
conflicts: []
priority: 8
version: 1.0.0
---

# Delegation economics

## What it is

A cost model. Every delegation costs a fresh context, a re-read of the relevant code, an
artifact round trip, and the orchestrator's own tokens to brief and to absorb. That cost
is real and is paid whether or not the delegation helped.

## The rule

Delegate when at least one is true:

- The work needs a different **model tier** than the current one (deep reasoning, or cheap bulk).
- The work needs a **different lens** on the same code (adversarial review, security, taste).
- The work is **large and self-contained**, and its context would pollute yours.
- The work is **parallel** with other work and genuinely independent.

Do it yourself when:

- The change is under roughly 20 lines in files you have already read.
- The instruction to the agent would be as long as the fix.
- You would have to review the result line by line anyway.
- It is a rename, a typo, a copy change, a version bump, a one-line guard.

## Fleet size

The existence of nine agents does not make nine agents correct. Typical shapes:

| Level | Shape |
|---|---|
| 1 | direct |
| 2 | builder (+ tester) |
| 3 | analyst → builder → tester → reviewer |
| 4-5 | orchestrator over the full workflow, researcher on unknowns, two review passes |

Risk can raise the shape; it never lowers it.

## Parallelism rules

- Same file → serialise.
- Shared generated artifact (schema, lockfile, migration) → serialise.
- Independent modules with independent tests → parallel, and say so.
- Never parallelise two agents that both need to run the same slow suite; run it once after.

## Common mistakes

- Spawning a researcher for something one grep answers.
- Delegating the "easy" half and doing the hard half yourself — inverted.
- Spawning agents to look thorough. Overspawning is a reported failure mode, not diligence.
- Re-delegating from inside a subagent.

## Verification

After the work, compare: did the delegation change the outcome, or only the token bill?
Record it as a learning observation (`aos learn observe`) so routing improves.
