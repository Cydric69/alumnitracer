---
name: repairer/verification
description: Prove a repair actually repaired - the original reproduction, the class of bug, and everything the fix could have broken.
agents: [repairer]
domains: [debugging, verification]
triggers: [verify fix, is it fixed, confirm repair, retest, after the fix]
dependencies: [shared/verification]
conflicts: []
priority: 9
version: 1.0.0
---

# Verification (repairer)

## The four checks, in order

1. **The original reproduction now passes.** Run the exact command from the bug report,
   with the exact input. Not a similar case — that one.
2. **The regression test fails on the old code.** Stash the fix (or comment out the changed
   line) and confirm the new test goes red. A regression test that passes both ways proves
   nothing, and this is the most commonly skipped step.
3. **The class is covered.** You found other callers or similar patterns during root-cause
   analysis — check them too, and add a test for at least one sibling.
4. **Nothing else broke.** Run the full relevant suite. Compare counts to before the fix.

## Instrumentation removed

Every temporary print, log, breakpoint, timing probe, and commented-out line goes before
you hand off. Grep your own diff for `print(`, `console.log`, `debugger`, `TODO`, and
`XXX`.

## The fix quality questions

- Did I fix the cause or the symptom? (If the answer needs a paragraph, it was the symptom.)
- Is the fix at the level where all callers benefit?
- Did I add a guard that hides a different bug?
- Did I change behaviour that something else depends on?
- Would this bug still be caught if someone reverted my fix but kept my test?

## Report

The reproduction command with its now-passing output, the regression test and its
red-on-old-code evidence, the suite counts before and after, the siblings checked, and any
remaining risk. Anything unverified is stated as unverified.
