---
name: tester/test-driven-development
description: Red-green-refactor applied where it pays - write the failing test, the smallest implementation, then clean up, with the failure actually observed.
agents: [tester, builder]
domains: [testing, process]
triggers: [tdd, test first, failing test, red green, write a test]
dependencies: [tester/test-design]
conflicts: []
priority: 8
version: 1.0.0
---

# Test-driven development

## When it applies

Logic with a definable contract: parsers, calculations, state machines, validation,
permissions, data transforms, bug fixes (the regression test comes first, always).

## When it does not apply

Exploratory spikes, pure styling, config changes, and code whose shape is genuinely unknown
until you have written it once. Forcing TDD there produces tests that encode a design you
are about to throw away. Say you are skipping it and why.

## The loop

**RED** — Write one test for one behaviour. Run it. *Watch it fail, and read the failure
message.* A test you never saw fail is not a test; it might be asserting nothing. The
failure message should already tell you what is wrong — if it says
`AssertionError: assert None == 3`, improve the message now, not during the next outage.

**GREEN** — Write the smallest code that passes. Not the general solution. Hard-coding is
acceptable at this step if the next test forces generalisation. Do not skip ahead.

**REFACTOR** — Now clean it up: naming, duplication, structure. Tests stay green
throughout. This step is where the design happens, and it is the step people skip.

Repeat with the next behaviour. Commit at green.

## Bug fixes

1. Write a test that reproduces the bug. It fails.
2. Fix the cause.
3. The test passes; the rest of the suite still passes.

This ordering is non-negotiable for bugs — it is the only proof that the fix addresses the
reported behaviour and that the bug cannot silently return.

## Common mistakes

- Writing five tests before any implementation (that is not TDD, that is a spec dump).
- Writing the test after the code and calling it TDD.
- Tests that assert internals, so the refactor step is impossible.
- Skipping refactor because it is green and you are tired. The mess compounds.
- Never seeing red, because the test had a typo and passed vacuously.

## Verification

For each test: comment out the implementation line it covers. Does the test fail with a
message that names the problem? If not, the test is decorative.
