---
name: reviewer/quality-review
description: Judge whether the work is maintainable and idiomatic for this codebase - without turning preference into a blocking finding.
agents: [reviewer, design-critic]
domains: [review, quality]
triggers: [quality, maintainable, clean, readable, idiomatic, tech debt, refactor review]
dependencies: [reviewer/code-review]
conflicts: []
priority: 6
version: 1.0.0
---

# Quality review

## What counts as a quality finding

Only things that will cost someone real time later:

- **Duplication of logic** that must stay in sync (not incidental similarity).
- **An abstraction with one implementation** added speculatively.
- **A function that cannot be understood in one screen** because it does several things.
- **Naming that misleads** (`getUser` that also writes, `isValid` that throws).
- **A dependency added for something trivial.**
- **Dead code, commented-out code, unused exports** left in the diff.
- **Error handling that loses information** (bare catch, swallowed exception, generic message).
- **Comments that restate code**, or that are already wrong.
- **A test that cannot fail.**

## What does not count

Formatting. Preferred loop style. Whether it is a class or a function, in a codebase that
uses both. File length. Anything the project's linter is silent about and its existing code
contradicts. If the surrounding code does it that way, consistency wins over your preference.

## Idiom check

Compare the diff to two or three neighbouring files. Does it look like it belongs? A
technically superior pattern introduced alone becomes an inconsistency someone else has to
reconcile. If a new pattern is genuinely worth introducing, say so as a proposal, not a
finding, and note the migration it implies.

## Simplification findings

State the shorter version, not just "this could be simpler". If your replacement is not
obviously equivalent, verify it before reporting. Simplification findings should reduce
line count or concept count meaningfully — shaving two lines is noise.

## Severity discipline

Quality findings are **minor** by default. They become **major** only when they will
plausibly cause a defect (duplicated logic that will drift, error handling that hides
failures). They are never blocking on their own.
