---
name: builder/interaction-design
description: State, feedback, and affordance - making an interface respond so users always know what happened and what they can do next.
agents: [builder, design-critic]
domains: [frontend, ui, design]
triggers: [interaction, hover, click, feedback, state, loading, error state, empty state, form, undo, toast]
dependencies: [builder/accessibility]
conflicts: []
priority: 8
version: 1.0.0
---

# Interaction design

## The five states, every time

For every interactive element: **default, hover, focus-visible, active, disabled**.
For every async surface: **idle, loading, success, empty, error**.
Shipping only the default and the success state is the most common interaction defect.

- *Loading*: show it after ~150ms (earlier flashes), and prefer a skeleton that matches the
  final layout over a spinner — it prevents layout shift and communicates shape.
- *Empty*: explain what goes here and give the action that fills it. "No results" is a
  dead end; "No invoices yet — create your first" is a design.
- *Error*: say what went wrong, in the user's terms, and what to do. Keep their input.
  Offer retry where retry can work.
- *Disabled*: say why, in a tooltip or adjacent text. A disabled button with no explanation
  is a trap.

## Feedback timing

| Duration | Treatment |
|---|---|
| <100ms | no feedback needed |
| 100ms-1s | immediate state change (button pressed, row highlights) |
| 1-5s | inline loading indicator, keep the UI responsive |
| >5s | progress with an estimate, and the user can keep working or cancel |

Optimistic updates for actions that almost always succeed — with a real rollback path and
a visible failure message. Optimistic UI without rollback is a lie.

## Affordance

Things that look clickable must be clickable; things that are clickable must look it.
Cursor, hover change, and focus ring are the minimum. Do not make whole cards clickable
while also nesting buttons inside them — that produces unreachable actions and ambiguous
targets. Choose one primary target per card.

## Destructive actions

Confirm with a description of what will be lost and its scale ("Delete 47 records? This
cannot be undone"). Better: allow the action immediately and offer undo for 10 seconds —
undo beats confirmation for everything reversible. Never make the destructive button the
default focus. Never place it adjacent to the common action without separation.

## Forms

Label above the field. Validate on blur, not on every keystroke; re-validate on submit.
Show all errors, at the fields, and move focus to the first one. Never clear a form on
error. Support paste, autofill, and password managers. Submit on Enter. Disable the submit
button only *while submitting*, and say so on the button.

## Common mistakes

- A toast as the only feedback for an action whose result is off-screen.
- Modal on modal.
- Hover-only affordances (invisible on touch).
- Instant "Saved!" that is not actually saved yet.
- A confirmation dialog for an action that is trivially reversible.
- Focus lost to `<body>` after closing a layer.

## Verification

Complete the flow with the keyboard only. Force each async path to fail (throttle,
offline, 500) and confirm the error state is real. Trigger the empty state deliberately.
