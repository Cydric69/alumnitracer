---
name: analyst/specification
description: Write the implementable spec - problem, behaviour change, criteria, affected files, non-goals, unknowns.
agents: [analyst, orchestrator]
domains: [requirements, planning]
triggers: [specification, spec, design doc, plan the change, write up]
dependencies: [analyst/requirements-analysis, analyst/codebase-analysis]
conflicts: []
priority: 7
version: 1.0.0
---

# Specification

## What it is

The document a builder can implement from without guessing, and a reviewer can grade against.

## The template

```
## Problem
What is wrong or missing today, with file:line evidence.

## Behaviour change
Before → after, stated observably. Include the exact strings, shapes, or states.

## Acceptance criteria
1. Given … when … then …
2. …

## Affected files
path — what changes here and why

## Reuse
Existing helpers/types/patterns to use instead of writing new ones.

## Non-goals
Explicitly not doing X, Y, Z.

## Unknowns
Question → how it will be resolved → working assumption meanwhile.

## Risks
What could break elsewhere, and what to check.
```

## Rules

- Length follows the change. A level-2 spec is fifteen lines; a level-5 spec is two pages.
  A long spec for a small change is a way of avoiding the change.
- No implementation prescriptions unless they are constraints ("must stay synchronous
  because it runs inside the render path" is a constraint; "use a for loop" is not).
- Every acceptance criterion must fail against today's code.
- The non-goals section is not optional — it is the main defence against scope creep.

## Common mistakes

- Writing the spec from the request alone, without reading the code (the "affected files"
  section is where this becomes obvious — it will be wrong).
- Criteria that restate the feature name.
- Hiding an unknown in a confident sentence.
- Specifying a refactor as part of a bug fix.

## Verification

Hand the spec to the builder. If the first question back is "but what about …", the spec
had a hole. Log the hole as an observation — recurring holes are what the learning system
turns into checklist policies.
