---
name: reviewer/completion-audit
description: The final gate before COMPLETED - evidence per requirement, and the eight questions that catch a false finish.
agents: [reviewer, orchestrator]
domains: [review, quality, process]
triggers: [complete, done, finished, final check, audit, sign off, ship it]
dependencies: [reviewer/requirements-review, shared/evidence, shared/unlazy]
conflicts: []
priority: 10
version: 1.0.0
---

# Completion audit

## What it is

The last check before a task may be marked COMPLETED. It is adversarial about the word
"done", because a false completion costs more than any other error the system can make.

## The eight questions

Answer each in writing, with evidence:

1. **What did the user actually request?** (Their words, not the spec's.)
2. **What defines done for that request?**
3. **What evidence proves each requirement is met?** (Command + output, or observation.)
4. **What remains unverified?**
5. **What failed?**
6. **What was repaired, and was it the root cause?**
7. **Was any difficult part of the request avoided, deferred, or handed back?**
8. **Was work added that nobody asked for?**

## Verdicts

- **COMPLETED** — every requirement has evidence, no failing tests, no remaining work.
- **PARTIAL** — some requirements met with evidence, others explicitly named as not done.
  This is an honourable outcome; a disguised partial is not.
- **FAILED** — the core request is not delivered.

There is no verdict for "done except for a few things I did not mention".

## Run it

`aos audit <task_id> --criteria "criterion one|criterion two"` compares the recorded
artifacts against the criteria and returns the verdict plus its findings. Its findings are
inputs to your judgement, not a substitute for reading the work.

## Red flags that force a re-check

- A summary with no numbers in it.
- "Should work", "appears to", "presumably".
- Tests mentioned but no counts.
- A `remaining_work` list that contradicts a `status: ok`.
- A large diff with a small summary.
- Any claim you have not seen an observation for.

## Output

The verdict, the evidence table, the unverified list, and — when PARTIAL — the exact
remaining work in the user's terms so they can decide what happens next.
