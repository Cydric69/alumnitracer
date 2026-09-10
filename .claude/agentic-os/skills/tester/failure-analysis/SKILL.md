---
name: tester/failure-analysis
description: Read a failing test correctly - what it proves, what it does not, and whether the test or the code is wrong.
agents: [tester, repairer, builder]
domains: [testing, debugging]
triggers: [test failed, failing, assertion error, red, why did it fail, error output]
dependencies: [shared/evidence]
conflicts: []
priority: 8
version: 1.0.0
---

# Failure analysis

## First: read the whole thing

The full assertion, the full diff, the full stack — including frames in library code. The
first line of a failure is rarely the informative one. Note the *exact* values: expected
vs actual, and how they differ (type? order? whitespace? one element? off by one?).

## Then: classify

| Signature | Likely cause |
|---|---|
| Expected 3, got 4 (or vice versa, by one) | boundary condition, `<` vs `<=`, inclusive range |
| Expected `{...}`, got `None`/`undefined` | early return, unhandled branch, failed lookup |
| Same content, different order | non-deterministic iteration or missing sort |
| Passes alone, fails in the suite | shared state, order dependence, unreset mock |
| Fails only in CI | environment: timezone, locale, file case-sensitivity, missing env var |
| Fails intermittently | race, real timing dependency, or an unseeded random |
| Type error deep in a library | wrong shape passed at your boundary; look at your call, not theirs |
| Everything fails | import error, config, migration not applied — fix that first, ignore the rest |

## Is the test wrong or the code wrong?

Answer from the requirement, not from convenience. Ask: if a user did exactly what this
test does, what *should* happen? If the test's expectation does not match the requirement,
the test is wrong — fix it explicitly and flag it in the report. Never adjust an expectation
just to reach green; that is how a bug becomes a documented feature.

## Suite-level reading

Many failures with one cause: fix the cause, re-run, do not triage each. One failure among
many passes: it is specific — read what makes it different. A previously-passing test
failing after your change: your change caused it until proven otherwise.

## Report

State: the command, the failing test name, the expected/actual values, the classification,
and the single next action. Attach nothing else — a wall of log output is not analysis.
