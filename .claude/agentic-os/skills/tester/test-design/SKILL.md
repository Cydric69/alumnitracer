---
name: tester/test-design
description: Choose what to test, at which level, with what data - so the suite catches real defects without becoming a maintenance tax.
agents: [tester, builder, reviewer]
domains: [testing]
triggers: [test plan, what to test, test strategy, coverage, test cases, how should I test]
dependencies: []
conflicts: []
priority: 8
version: 1.0.0
---

# Test design

## Choosing the level

| Level | Use for | Keep it |
|---|---|---|
| Unit | pure logic, branching, formatting, calculation | many, fast, no I/O |
| Integration | the wiring between real components, DB queries, handlers | some, real dependencies where possible |
| E2E | the two or three journeys that must never break | very few, deterministic |

Pick the *highest* level that still fails fast and points at the cause. One integration
test over a real database beats a dozen unit tests against mocks that encode your
assumptions rather than the system's behaviour.

## What earns a test

- Every acceptance criterion.
- Every branch that changes an outcome a user can see.
- Every bug ever fixed.
- Every boundary (see tester/edge-case-analysis).
- Anything whose failure would be silent (money, permissions, data writes).

## What does not

- Getters, constants, framework glue.
- Code covered incidentally by a higher-level test that would fail loudly.
- Third-party behaviour.
- Coverage-percentage padding. A test written to move a number tests nothing.

## Test data

Use realistic values (real names with apostrophes, unicode, long strings), not `"foo"` and
`1`. Build data with a factory/builder so each test states only what it cares about. Never
share mutable fixtures between tests — order-dependent suites are worse than no suites.

## Naming and structure

Name for the behaviour: `rejects_expired_token`, not `test_auth_2`. One logical assertion
per test. Arrange-act-assert, with the arrange section small enough to read.

## Mocking policy

Mock only what you cannot run: network, clock, randomness, paid third parties. Do not mock
the database if a real one is available in the test environment. Never mock the unit under
test. Every mock is an assumption; the more mocks, the more the test proves only that your
assumptions are self-consistent.

## Common mistakes

- A suite of 200 unit tests and no test that the app starts.
- Tests that pass against a completely broken implementation because everything is mocked.
- Asserting log output rather than state.
- Flaky tests left in place — a flaky test trains the team to ignore red.

## Verification

Mutation check by hand: change a `>` to `>=`, invert a boolean, return early. If the suite
stays green, it is not testing what you think.
