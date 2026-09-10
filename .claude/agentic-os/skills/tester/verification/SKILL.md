---
name: tester/verification
description: The tester's completion check - every acceptance criterion mapped to a run command and its observed output.
agents: [tester, reviewer]
domains: [testing, verification]
triggers: [verify, verification, proof, criteria met, sign off, is it done]
dependencies: [shared/verification, shared/evidence]
conflicts: []
priority: 8
version: 1.0.0
---

# Verification (tester)

## What it is

The mapping table that turns "the tests pass" into "the request is satisfied".

## The table

| # | Acceptance criterion | Check (command or observation) | Result |
|---|---|---|---|
| 1 | search "pay" returns "Payment" | `pytest -k test_partial_match` | 1 passed |
| 2 | p95 < 200ms on 10k rows | `python bench/search.py` | 148ms |

Every criterion gets a row. A row with no command is not verified — say so rather than
implying coverage.

## Rules

1. Criteria come from the spec or the original request, in their words.
2. One check per criterion, at the cheapest sufficient level.
3. Record the actual output, not "passed".
4. If a criterion cannot be checked automatically, describe the manual observation you made
   (what you clicked, what you saw). "Looks right" is not an observation.
5. Report unverified criteria loudly. An unverified criterion is the single most common
   route to a false "complete".

## Beyond the criteria

Also confirm and record:

- The full relevant suite: counts before and after.
- The build/typecheck/lint the project defines.
- No new warnings introduced.
- Any test whose expectation you changed, and why.

## Handing off

The reviewer will re-run the load-bearing checks. Make that cheap: give exact commands,
not descriptions of commands.
