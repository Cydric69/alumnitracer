---
name: analyst/requirements-analysis
description: Extract what the user actually asked for, separate it from what they implied, and write acceptance criteria that can be checked.
agents: [analyst, orchestrator, reviewer]
domains: [requirements, planning]
triggers: [requirement, acceptance criteria, spec, what should, expected behavior, scope]
dependencies: [shared/uncertainty]
conflicts: []
priority: 8
version: 1.0.0
---

# Requirements analysis

## What it is

The translation step from a sentence a person typed to a set of statements that are each
independently true or false about the finished system.

## How to use it

1. **Quote the request.** Literally. Drift starts when the request gets paraphrased.
2. **Split into atoms.** One verb, one object, one observable outcome per line.
3. **Classify each atom**: explicit (they said it), implied (professional standard: it
   should not crash, it should be accessible, it should not leak secrets), or invented
   (you thought of it). Invented atoms go to "out of scope" unless the user agrees.
4. **Write acceptance criteria** in the form: *Given … when … then …*, or
   *`f(x)` returns `y` for input `x`*. Each must be checkable by a test, a command, or a
   direct observation.
5. **Write the non-goals.** These prevent the builder from expanding the diff.
6. **Name the ambiguities** with a recommended default each.

## Quality bar for a criterion

- Names a concrete input and a concrete expected result.
- Does not mention implementation ("uses a Map") — only behaviour.
- Would be judged the same way by two different reviewers.
- Fails on today's code. (A criterion already satisfied is documentation, not a requirement.)

## Common mistakes

- "Improve performance" as a criterion. Improve what, measured how, from what to what?
- Turning an implied standard into a large feature (a request for a login form is not a
  request for an auth platform).
- Dropping a hard part of the request because the rest is clearer.
- Adding "and add tests" as a criterion instead of specifying what the tests must prove.

## Example

Request: "the search is slow and it doesn't find partial words."
Atoms: (1) partial-word matching, (2) latency.
Criteria: (1) searching `"pay"` returns items titled `"Payment"` and `"Repayment"`;
(2) p95 latency for a 10k-row corpus is under 200ms measured by `bench/search.py`.
Non-goals: fuzzy/typo tolerance, ranking changes, indexing new fields.
Ambiguity: should partial matching apply to the middle of words (`"pay"` → `"Repayment"`)?
Default: yes, substring; flagged in the report.
