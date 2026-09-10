---
name: researcher/uncertainty-reduction
description: Spend investigation effort where it changes the decision - order unknowns by cost of being wrong, not by curiosity.
agents: [researcher, orchestrator, analyst]
domains: [research, planning]
triggers: [unknown, risk, spike, prototype, de-risk, unclear, investigate]
dependencies: [shared/uncertainty]
conflicts: []
priority: 7
version: 1.0.0
---

# Uncertainty reduction

## What it is

A prioritisation method for investigation. Not all unknowns are worth resolving, and the
ones worth resolving are rarely the interesting ones.

## The method

1. **List the unknowns** as questions.
2. **Score each**: *impact* (what breaks or gets rebuilt if we guess wrong: none / rework
   a file / rework the design / ship the wrong thing / data loss) × *likelihood of being
   wrong*.
3. **Estimate the cost to resolve**: minutes for a grep, an hour for a spike, days for a
   real prototype.
4. **Resolve high impact / cheap first.** Then high impact / expensive. Ignore low impact
   entirely, and say you are ignoring it.
5. **Timebox spikes.** Write the question and the time budget before starting. When the box
   expires, report what you learned and what you would need — do not silently extend.
6. **Prefer the cheapest instrument that decides**: a grep beats a spike, a spike beats a
   prototype, a prototype beats a debate.

## Spike discipline

A spike answers one question and is then deleted. Spike code never becomes production code:
it has no error handling, no tests, and was written to be wrong quickly. If it turns out to
be useful, rewrite it deliberately.

## Common mistakes

- Researching the fun unknown (a new library) while the dangerous one (does the data model
  support this at all?) stays open.
- Resolving an unknown that both branches of the decision share.
- Producing a comparison matrix instead of a decision.
- Letting a spike grow into a half-feature.

## Output

Per unknown: resolved / partially resolved / unresolved, the finding, the confidence, and
what the remaining risk means for the plan.
