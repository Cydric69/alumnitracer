---
name: analyst/codebase-analysis
description: Trace the real flow through unfamiliar code before changing it - entry points, callers, data, and the existing helpers you should reuse.
agents: [analyst, builder, repairer, reviewer]
domains: [codebase, analysis]
triggers: [codebase, existing code, where is, how does, trace, architecture, callers]
dependencies: [shared/evidence]
conflicts: []
priority: 8
version: 1.0.0
---

# Codebase analysis

## What it is

Reading code with a specific question, in an order that answers it fast.

## How to use it

1. **Start from the outside.** Find the entry point for the behaviour: route handler, CLI
   command, event listener, component. `grep` the user-visible string, URL path, or error
   message — that lands you in the right file faster than reading the tree.
2. **Follow the data, not the folders.** Where does the value come from, what transforms
   it, where is it persisted or rendered?
3. **Map the callers before you change anything.**
   `grep -rn "functionName" --include=*.ts` — every caller is a place your change lands.
4. **Find the existing solution.** Before writing a helper, search for one:
   the same repo usually already has `formatCurrency`, `slugify`, `retry`, `useDebounce`.
   Re-implementing what lives three files over is the most common form of slop.
5. **Read the tests.** They document intent better than comments and show the real contract.
6. **Note the idioms**: error handling style, naming, module boundaries, whether the repo
   prefers classes or functions. Your change should be indistinguishable in style.

## What to write down

- Entry point → … → data store, as a short chain with `path:line` at each hop.
- Every caller of the function you will change.
- Existing helpers/types you will reuse.
- Anything surprising: dead code, two implementations of the same thing, a leaky abstraction.

## Common mistakes

- Reading files top-to-bottom instead of following the question.
- Assuming a name means what it says (`utils/safe.ts` may be neither).
- Missing a dynamic call site (string-keyed dispatch, DI container, decorator registry).
  Grep the *string* name too, not just the symbol.
- Trusting comments over code. The code shipped; the comment did not.

## Verification

You understand the flow when you can predict, before running it, what a specific input
produces at each hop — then run it and check.
