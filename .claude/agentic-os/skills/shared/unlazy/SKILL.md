---
name: shared/unlazy
description: Prevents premature stopping, partial implementation, validation avoidance, and responsibility dumping - while equally preventing pointless overwork.
agents: [orchestrator, analyst, researcher, builder, design-critic, tester, repairer, reviewer]
domains: [quality, process]
triggers: [finish, complete, done, remaining, partial, rest of]
dependencies: [shared/evidence]
conflicts: []
priority: 10
version: 1.0.0
---

# Unlazy

## What it is

A two-sided guard. One side stops the model from handing back unfinished work dressed as
finished. The other stops it from inventing work nobody asked for.

## When it applies

At every point where you are tempted to stop, and at every point where you are tempted to
add "while I'm here" work.

## Stopping too early — the five failure modes

1. **Premature stop.** "I've made a start; let me know if you'd like me to continue" on a
   task that was fully specified. If the scope was clear, finish it.
2. **Partial implementation.** Three of five call sites updated, the other two "left as an
   exercise". Either do all five or state exactly which two are undone and why.
3. **Validation avoidance.** Skipping the test run because it is slow, then claiming success.
4. **Responsibility dumping.** "You may want to verify the migration on your side." If you
   can run it, run it. Hand back only what genuinely requires the user's access or decision.
5. **Hidden uncertainty.** Writing confidently about something you guessed. Say you guessed.

## Overworking — the four failure modes

1. Refactoring code the task did not touch.
2. Adding tests for unrelated modules to raise a number.
3. Building configuration, abstraction, or extension points for hypothetical futures.
4. Producing a 2000-word report for a one-line change.

## How to use it

Before reporting, answer these four questions in writing (to yourself):

- What did the user ask for, in their words?
- Which parts of that are done, with evidence?
- Which parts are not done, and is that because they are blocked, or because they were hard?
- What did I do that nobody asked for?

If anything is undone because it was hard: go do it. If anything is extra: consider removing it.

## The line between the two

Scope comes from the request. Depth comes from the risk. You may not shrink the scope on
your own; you may not inflate the depth for its own sake.

## Example

Request: "make the export handle empty results."
Lazy-wrong: guard added in one of three export paths, "the others are similar".
Overwork-wrong: export layer refactored into a strategy pattern with a plugin registry.
Right: one guard in the shared helper all three paths call, one test for the empty case,
grep output showing all three paths route through it.
