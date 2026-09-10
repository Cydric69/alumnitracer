---
name: repairer/systematic-debugging
description: Reproduce, narrow, hypothesise, falsify - the procedure that finds bugs without guessing.
agents: [repairer, builder]
domains: [debugging]
triggers: [debug, bug, broken, not working, crash, exception, stack trace, reproduce, investigate]
dependencies: [shared/evidence, tester/failure-analysis]
conflicts: []
priority: 9
version: 1.0.0
---

# Systematic debugging

## Step 1 — Reproduce

Nothing else counts until you can trigger it on demand. Record the exact command, input,
and environment. If it only happens sometimes, find what varies (order, timing, data, user,
cache state) and make that variable explicit.

Cannot reproduce? That *is* the finding. Report it, ask for the missing conditions, and do
not "fix" code you have never seen fail.

## Step 2 — Narrow

Cut the search space in half repeatedly, by whatever axis is cheapest:

- **Input**: shrink the failing input until removing anything makes it pass.
- **Code path**: does it fail at the API layer, the service, the query? Add one probe at
  the midpoint of the pipeline.
- **Time**: `git bisect` or `git log -S "<symbol>"` between the last good and first bad state.
- **Environment**: same code, different machine/branch/version — what differs?

Each halving should take minutes, not an hour of reading.

## Step 3 — Hypothesise, then try to be wrong

Write the hypothesis as a sentence: "the timestamp is parsed as local time in the formatter,
so anything after 23:00 UTC shows the wrong day." Then name the observation that would
*disprove* it and go make that observation. Confirmation-hunting is how you spend an hour
fixing the wrong thing.

## Step 4 — Instrument, at the boundary

Print or log the value where correct state becomes incorrect state — the entry and exit of
the suspect function, with the actual value and its type. Structured, labelled, temporary.
Remove every probe before finishing.

For hard cases: a real debugger with a breakpoint beats twenty print statements; `strace`,
network inspection, or query logging beats guessing at a layer you cannot see.

## Step 5 — Confirm the mechanism

Before fixing, you should be able to explain: given this input, this line produces this
wrong value, which propagates here, which the user sees as that. If any link in that chain
is "somehow", keep digging — you are about to fix a symptom.

## Anti-patterns

- Changing several things at once and losing which one mattered.
- "Fixing" by adding a null check where the null should never have existed.
- Restarting, clearing the cache, or bumping a timeout and declaring victory.
- Reading code for an hour instead of running it once with a probe.
- Blaming the framework. It is almost never the framework.

## Bound

Three serious attempts. After two failures on the same hypothesis, the hypothesis is wrong —
change layer or restart from the reproduction. After three, escalate with what you ruled out.
