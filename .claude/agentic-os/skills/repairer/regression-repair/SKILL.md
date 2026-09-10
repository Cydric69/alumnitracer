---
name: repairer/regression-repair
description: Something that worked now fails - find the change that caused it and repair without reverting what the change was for.
agents: [repairer, builder]
domains: [debugging]
triggers: [regression, used to work, broke after, since the update, worked yesterday, bisect]
dependencies: [repairer/root-cause-analysis]
conflicts: []
priority: 8
version: 1.0.0
---

# Regression repair

## First: establish the two points

Find a state where it works and a state where it does not. Commit, branch, dependency
version, config, or data — regressions come from all five, and "the code" is only the first
place to look.

`git bisect run <command>` automates the search when you have a reliable check. Even a
manual bisect over ten commits is faster than reading them.

## Then: read the diff with the failure in hand

Once you have the first bad commit, its diff is small. Read it asking "which of these lines
could produce exactly this symptom?" — not "does this look wrong?".

## Non-code causes to rule out

- A dependency updated within a range (`^1.2.0` moved). Check the lockfile diff.
- A config or environment variable changed.
- Data changed: a new row shape, a null where there never was one, a much larger table.
- A build or toolchain version bump.
- A feature flag flipped.

## Repair rules

1. **Do not revert the whole change** if it was there for a reason. Understand what it was
   for, then fix the interaction.
2. **Preserve both behaviours.** The regression means two requirements now conflict; the
   fix usually needs to satisfy both, not choose one.
3. **Write the regression test first**, from the old behaviour, and check that it fails on
   the current code.
4. **Check for siblings**: the same change probably affected other paths that nobody has
   reported yet. Grep, run the full suite.
5. If a revert genuinely is the right call (the change was wrong, the release is burning),
   say so plainly, revert cleanly, and file what needs redoing.

## Report

The first bad commit, the mechanism, whether the original change's intent is preserved, the
new regression test, and the sibling paths you checked.
