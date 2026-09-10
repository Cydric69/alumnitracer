---
name: reviewer/adversarial-review
description: Actively try to break the change - assume it is wrong and hunt for the input, state, or sequence that proves it.
agents: [reviewer]
domains: [review, quality]
triggers: [adversarial, break it, stress, attack, red team, poke holes, worst case]
dependencies: [tester/edge-case-analysis]
conflicts: []
priority: 8
version: 1.0.0
---

# Adversarial review

## Stance

Assume the change is broken and that the author's confidence is unearned. Your job is to
find the proof, not to be reassured. Politeness in the report; hostility in the reading.

## Attack list

For each changed function, ask:

- What input makes this return the wrong answer rather than an error? (Silent wrongness is
  worse than a crash and is what tests miss.)
- What happens on the second call? On a concurrent call? On a retried call?
- What if this is called with the arguments in the other order, or with a partially
  populated object?
- What if the collection is empty? Enormous? Contains a duplicate? Contains itself?
- What if the external call times out *after* the side effect landed?
- What if the user is not who they claim, or owns nothing here?
- What if the process dies exactly here — what state is left behind?
- What did the author assume about ordering, uniqueness, or nullability that nothing enforces?

## Attack the tests too

- Does any test fail if I invert this condition? Try it — mentally or actually.
- Is anything asserted, or does the test only check that nothing threw?
- Are the mocks doing all the work?
- Does the test data resemble real data at all?

## Attack the claims

Take the three most load-bearing statements in the report and verify each independently.
"All tests pass", "no other callers", "backwards compatible" are the three that are most
often wrong.

## Discipline

An attack that you cannot make concrete is not a finding. Enumerate broadly, report
narrowly: every reported item comes with the input and the observed or precisely-argued
wrong outcome. Ranked by severity, blocking first.
