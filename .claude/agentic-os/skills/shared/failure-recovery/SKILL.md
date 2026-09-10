---
name: shared/failure-recovery
description: What to do when a stage fails - isolate, preserve state, decide between retry, strategy change, and escalation.
agents: [orchestrator, builder, tester, repairer, reviewer]
domains: [process, reliability]
triggers: [failed, failure, error, broken, stuck, retry, escalate]
dependencies: [shared/evidence]
conflicts: []
priority: 8
version: 1.0.0
---

# Failure recovery

## What it is

The protocol for a failed stage: contain it, learn from it, and keep the rest of the work
moving.

## Immediate actions

1. **Capture** before changing anything: the command, the full error, the state of the
   working tree. A failure you cannot reproduce is a failure you cannot fix.
2. **Isolate.** Mark only the failing task FAILED (`aos queue set <id> FAILED "<why>"`).
   Its dependents park as WAITING_DEPENDENCY automatically; independent tasks continue.
   Halting everything on one failure is itself a failure mode.
3. **Classify** the failure:
   - *Environmental* (missing dep, wrong node version, no network) — fix the environment,
     do not change the code.
   - *Specification* (the code is right, the requirement was misread) — go back to the analyst.
   - *Implementation* (the code is wrong) — repairer.
   - *Test* (the test is wrong) — say so explicitly and get it reviewed; never quietly relax it.
   - *Guarded* (a guard blocked the action) — this is not a failure to route around. Take it
     to the user with the reason.

## Retry policy

Attempt 1 → fix the identified cause. Attempt 2 → different hypothesis, not a variant of
the first. Attempt 3 → change layer or approach entirely. After 3, escalate with: what was
tried, what was observed each time, what was ruled out, and what you would need to proceed.

Never retry an identical command hoping for a different result unless the failure was
explicitly transient (network, rate limit) — and then at most twice, with a delay.

## Preserving user work

Never `git reset --hard`, `git checkout -- .`, or delete files to "get back to clean" when
recovering. Stash, branch, or copy. The user's uncommitted work is not yours to discard.

## Reporting a failure

A good failure report is more useful than a bad success. State what failed, the evidence,
what still works, what is blocked, and the single next action you recommend.
