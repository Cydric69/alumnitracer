---
name: reviewer/requirements-review
description: Check the delivered work against what the user actually asked for - coverage, drift, and silent scope changes.
agents: [reviewer, orchestrator]
domains: [review, requirements]
triggers: [does it meet, requirements, asked for, scope, drift, coverage of criteria]
dependencies: [analyst/requirements-analysis]
conflicts: []
priority: 9
version: 1.0.0
---

# Requirements review

## What it is

The check that the right thing was built, independent of whether it was built well. Code
review misses this entirely — a flawless implementation of the wrong feature passes it.

## Method

1. **Go back to the original request**, in the user's words. Not the spec, not the plan —
   those are where drift entered.
2. **Build the coverage table**: each requirement → the evidence that it is met → verdict
   (met / partially met / not met / not attempted).
3. **Look for the three drift patterns**:
   - *Substitution*: a hard requirement quietly replaced with an easier neighbour
     ("real-time" became "refresh every 30s" with no mention).
   - *Omission*: the awkward part of the request is absent from the report entirely.
   - *Addition*: work nobody requested, now in the diff and needing review and maintenance.
4. **Check the non-goals** were respected.
5. **Check the assumptions**: were they stated, and are they the ones you would have made?

## Severity

- **Blocking**: a requirement is unmet or silently substituted.
- **Major**: a requirement is met but unproven, or unrequested scope was added.
- **Minor**: an assumption was left implicit.

## Common failures found here

- "Done" reported with two of five criteria unaddressed and unmentioned.
- The hard half handed back as "you may want to…".
- A feature implemented for the general case when the user asked for the specific one, or
  vice versa.
- Tests written for what was built rather than for what was asked.

## Output

The coverage table, the drift findings, and a single verdict: does this deliver the request?
Anything less than full coverage is reported as `partial` with the gap named explicitly.
