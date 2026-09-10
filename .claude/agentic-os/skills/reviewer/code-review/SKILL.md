---
name: reviewer/code-review
description: Read a diff for defects that matter - correctness, reuse, and simplification - with a concrete failure scenario behind every finding.
agents: [reviewer]
domains: [review, quality]
triggers: [review, code review, pr, diff, look over, check my code, feedback]
dependencies: [shared/evidence]
conflicts: []
priority: 8
version: 1.0.0
---

# Code review

## What you are looking for, in priority order

1. **Correctness** — an input that produces a wrong result, a crash, or data corruption.
2. **Security** — see reviewer/security-review.
3. **Missing cases** — the branch, state, or error path that was not handled.
4. **Reuse** — this reimplements something the codebase already has.
5. **Simplification** — a materially shorter, clearer way with the same behaviour.
6. **Efficiency** — a real complexity or query problem, not a micro-optimisation.

Style, naming preference, and architectural taste are not review findings unless the
project has a stated rule. Formatting belongs to the formatter.

## The finding bar

Every finding states: **file:line**, a **concrete failure scenario** (given input X, this
returns Y, expected Z), and a severity. If you cannot construct the failing input, you have
a suspicion, not a finding — either go verify it or drop it.

## How to read the diff

- Read the whole changed function, not just the changed lines. Context is where the bug is.
- For every new branch, ask what happens on the other side of it.
- For every removed line, ask who depended on it.
- For every new parameter or field, check every call site (the diff shows only some).
- Check the tests: do they actually fail if the implementation is wrong?
- Look for what is *missing*: the error path, the empty case, the cleanup, the index.

## Verify claims

If the description says the suite passes, run it. If it says a behaviour changed, exercise
it. A review that only reads is half a review — and agent-authored diffs frequently claim
verification that did not happen.

## Output

Ranked most severe first. State plainly when there are no blocking findings — an honest
clean review is more valuable than a padded one. Never invent findings to appear thorough.
