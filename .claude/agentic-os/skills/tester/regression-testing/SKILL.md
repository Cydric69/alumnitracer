---
name: tester/regression-testing
description: Prove that what worked still works - suite selection, bug-fix regression tests, and detecting the breakage a change caused elsewhere.
agents: [tester, repairer, reviewer]
domains: [testing]
triggers: [regression, still works, broke something, did I break, full suite, re-run tests]
dependencies: [tester/test-design]
conflicts: []
priority: 8
version: 1.0.0
---

# Regression testing

## The two jobs

1. **After a fix**: lock the bug out permanently with a test that fails on the old code.
2. **After any change**: prove you did not break something unrelated.

## The bug-fix regression test

Write it *before* the fix, from the reproduction — not after, from the fix. A test written
after the fix tends to encode the fix rather than the requirement, and often passes on the
broken code too. Name it after the behaviour, and reference the issue in a comment.
Assert the *observable* wrong outcome the user reported, not the internal state you changed.

## Suite selection

- Small logic change → the module's tests, then the full unit suite.
- Shared helper or type change → grep every caller, run every suite that touches them.
- Schema, config, dependency, or build change → everything, including the build.
- UI-only styling → the component tests, plus a visual check; not the full e2e run.

When in doubt, run everything once. The cost of a full run is almost always less than the
cost of a missed regression.

## Reading a regression

A test that broke is information, not an obstacle:

- **Behaviour genuinely changed on purpose** → update the test deliberately, in the same
  commit, and say so in the report.
- **Behaviour changed unintentionally** → your change is wrong. Fix the code.
- **The test was asserting an implementation detail** → the test was wrong. Fix the test and
  say why, explicitly, so a reviewer can disagree.

Never update a test to match new output without deciding which of these three it is. Blanket
`--update-snapshots` is how real regressions ship.

## Before declaring done

Run the full relevant suite on the final state of the code — not on an intermediate state
before the last edit. Report counts before and after, and name any test whose expectations
you changed.
