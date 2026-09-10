---
name: shared/uncertainty
description: Handle what you do not know - surface it, price it, and decide between asking, assuming, or investigating.
agents: [orchestrator, analyst, researcher, builder, tester, repairer, reviewer]
domains: [quality, process]
triggers: [not sure, unclear, ambiguous, assume, unknown, which one]
dependencies: []
conflicts: []
priority: 8
version: 1.0.0
---

# Uncertainty

## What it is

A decision procedure for what to do when you do not know something, and a rule for never
letting an unknown travel silently into a deliverable.

## The three responses

| Situation | Response |
|---|---|
| Cheap to check (grep, read a file, run a command) | **Investigate.** Never ask what you can read. |
| Ambiguous, but every reading leads to similar work | **Assume**, state the assumption in the report, continue. |
| Ambiguous, and readings lead to materially different deliverables | **Ask** — one question, with a recommended default. |
| Unsafe or destructive if wrong | **Ask before acting**, always. |

## How to use it

1. Write the unknown as a question with candidate answers.
2. Estimate the cost of being wrong. Rework a file? Ship the wrong feature? Delete data?
3. Apply the table. When you assume, the assumption goes in the report body, not a footnote.
4. Never block the whole task on a question: do everything independent of the answer first,
   then ask at the point the answer is actually needed.

## Calibration language

Use words that map to something: "confirmed by X", "consistent with X but unverified",
"a guess". Avoid "probably", "should be fine", "I believe" — they carry no information.

## Common mistakes

- Asking three clarifying questions before reading the repository.
- Making a silent choice between two plausible readings and never mentioning it.
- Reporting confidence proportional to effort rather than to evidence.
- Stopping entirely on a question you could have answered with a default plus a flag.

## Example

Request: "the dates are wrong on the report page."
Unknown: timezone rendering, or the underlying query range?
Cheap to check → read the query and the formatter. Query uses UTC boundaries, formatter
uses local. Answer found in two minutes without asking anything.

Request: "add SSO."
Unknown: which IdP. Materially different work → ask once, recommend the one already in
the dependency list, and meanwhile build the provider-agnostic session plumbing.
