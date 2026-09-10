---
name: repairer/root-cause-analysis
description: Fix the cause once, where every affected caller routes through - and find the siblings the report did not mention.
agents: [repairer, builder, reviewer]
domains: [debugging, quality]
triggers: [root cause, why did, underlying, real problem, symptom, recurring, again]
dependencies: [repairer/systematic-debugging]
conflicts: []
priority: 9
version: 1.0.0
---

# Root-cause analysis

## The rule

A bug report names a symptom on one path. The cause usually sits upstream, shared by
several paths. Fixing the reported path leaves the siblings broken and guarantees the bug
comes back under a different title.

## Method

1. **Trace upstream** from the symptom to the first point where state becomes wrong. That
   point, not the crash site, is the cause.
2. **Ask "why" until it stops being about code**: the value is null → because the API omits
   it when empty → because the serializer skips falsy fields → because the schema marks it
   optional. Which of those is the right place to fix? Usually the highest one you own.
3. **Grep every caller** of the function you are about to change. Every one is a place the
   bug either exists already or could appear.
4. **Fix at the convergence point.** One guard in the shared helper is a smaller diff than
   a guard in each caller — and it is the only version that fixes the callers nobody
   reported.
5. **Check the class, not the instance.** If a date was parsed wrong here, grep for the same
   parse pattern elsewhere. Bugs of a kind travel in groups.

## When the cause is not yours to fix

Sometimes the cause is in a dependency, a data source, or a decision above your level. Then:
mitigate at your boundary (validate, coerce, fail loudly), document the real cause in the
report, and say what the permanent fix would require. Do not present the mitigation as the
fix.

## Anti-patterns

- Adding a null check at the crash site while the null's origin stays unknown.
- Catching an exception to make an error go away.
- A retry that hides a deterministic bug.
- A default value that papers over a missing field, silently producing wrong data forever.
- Fixing the one call site named in the ticket, with five siblings visible in the grep.

## Report

State the cause in one sentence, the fix location and why it is the right level, the list of
callers you checked, and what class of bug this belongs to.
