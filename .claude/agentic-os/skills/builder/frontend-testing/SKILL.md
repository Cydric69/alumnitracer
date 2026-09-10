---
name: builder/frontend-testing
description: Test UI by behaviour a user can perform - queries, interactions, async, and the visual checks worth automating.
agents: [builder, tester]
domains: [frontend, testing]
triggers: [test component, testing library, vitest, jest, playwright, cypress, ui test, snapshot, render test]
dependencies: [tester/test-design]
conflicts: []
priority: 7
version: 1.0.0
---

# Frontend testing

## The principle

Test what the user does, not what the component contains. If a refactor that preserves
behaviour breaks the test, the test was wrong.

## Queries, in order of preference

`getByRole` (with the accessible name) → `getByLabelText` → `getByPlaceholderText` →
`getByText` → `getByTestId` (last resort). Role-based queries double as an accessibility
check: if you cannot query a button by its role and name, screen readers cannot find it
either.

Never query by CSS class or DOM structure.

## Interaction

Use `userEvent`, not `fireEvent` — it produces the real event sequence (pointer, focus,
keyboard) and catches bugs `fireEvent` walks past. Await it.

## Async

Use `findBy*` and `waitFor` with real assertions; never a fixed `sleep`. Assert the loading
state appears *and* disappears. Mock at the network boundary (MSW or the framework's
fetch mock), not by stubbing the component's own functions — the latter tests nothing.

## What to test

- Each acceptance criterion, once, at the highest level that is still fast.
- The four async states, especially error and empty.
- Keyboard operation of custom widgets.
- Form validation, including recovery after a failed submit.
- The regression case for every bug you fix.

## What not to test

- That a component renders without crashing (worthless on its own).
- Implementation details: internal state, hook call counts, prop identity.
- Third-party library behaviour.
- Styling values — unless a specific style *is* the behaviour (e.g. `display: none`).

## Snapshots

Large snapshots are review-blind: they get accepted with `-u` and stop detecting anything.
Use small, targeted snapshots (a single formatted string, a normalised data shape) or none.

## E2E

Reserve for critical, multi-page journeys: sign-up, checkout, the one flow that must never
break. Keep them few, deterministic, and independent (own their data setup and teardown).
Use the framework's auto-waiting; never `waitForTimeout`.

## Verification

Break the implementation deliberately and confirm the test fails. A UI test that passes
against a broken component is the norm, not the exception — check it.
