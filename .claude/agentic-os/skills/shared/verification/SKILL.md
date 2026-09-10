---
name: shared/verification
description: Turn "I think it works" into a reproducible check that would fail if it did not.
agents: [builder, tester, repairer, reviewer, orchestrator]
domains: [quality, verification, testing]
triggers: [verify, verification, validate, check, confirm, does it work]
dependencies: [shared/evidence]
conflicts: []
priority: 9
version: 1.0.0
---

# Verification

## What it is

The step between making a change and believing it. Verification asks: what observation
would be different if this change were wrong, and have I made that observation?

## When it applies

After any behaviour change, before any completion claim, and after every repair.

## When it does not apply

Pure documentation edits, comment changes, and formatting-only diffs need a build/lint
check at most. Do not run a 20-minute e2e suite for a README typo.

## How to use it

1. **Name the falsifier.** Write down the specific result that would prove the change wrong.
2. **Choose the cheapest sufficient check** that produces it:
   - unit test for logic
   - integration test for wiring between real components
   - one manual run for a CLI or script
   - a screenshot or DOM assertion for visual/UI state
   - a query for a data change
3. **Run it before and after** where practical. A check that passes on the broken code
   proves nothing — this is the single most common verification failure.
4. **Run the surrounding suite** to catch what you broke elsewhere.
5. **Record it**: command, exit code, counts, and the first failure verbatim.

## Common mistakes

- Writing the test after the fix and never seeing it fail.
- Verifying the happy path only.
- Accepting "no output" as success from a command that is silent on failure too.
- Verifying in a different environment than the one that reported the bug.

## Verification of verification

Deliberately break the change (comment out the fix) and confirm your check fails. If it
still passes, your check is not measuring the thing you fixed.

## Example

Change: coerce `page` query param to int with a floor of 1.
Falsifier: `?page=-3` still reaches the query layer with -3.
Check: `assert paginate({"page": "-3"})["offset"] == 0` — run against the old code first
(fails), then the new (passes). Then `pytest tests/test_pagination.py` for regressions.
