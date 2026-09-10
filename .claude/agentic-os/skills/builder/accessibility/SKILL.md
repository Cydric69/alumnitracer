---
name: builder/accessibility
description: Keyboard, screen reader, contrast, and focus - the accessibility floor that no design decision may override.
agents: [builder, design-critic, tester, reviewer]
domains: [frontend, ui, accessibility]
triggers: [accessib, a11y, aria, keyboard, screen reader, focus, contrast, wcag, alt text]
dependencies: []
conflicts: []
priority: 9
version: 1.0.0
---

# Accessibility

## The floor

These are not negotiable against visual preference:

1. **Semantic elements first.** `<button>` for actions, `<a href>` for navigation,
   `<label for>` on every input, real headings in order. A `<div onClick>` is a defect.
   ARIA is a patch for when semantics genuinely cannot express it — not a starting point.
2. **Keyboard complete.** Every interactive element reachable by Tab, operable by Enter/Space,
   dismissible by Escape where it is a layer. No keyboard trap. Logical tab order.
3. **Visible focus.** Never `outline: none` without a replacement that is clearly visible in
   both themes. `:focus-visible` is the modern hook.
4. **Contrast**: 4.5:1 for body text, 3:1 for large text and for the boundary of interactive
   elements. Grey-on-grey placeholder text is the most common failure.
5. **Text alternatives**: meaningful `alt` for informative images, `alt=""` for decorative
   ones, accessible names for icon-only buttons (`aria-label`).
6. **Announce dynamic change**: `aria-live="polite"` for async results and toasts; move
   focus into a dialog on open and back to the trigger on close.
7. **Respect `prefers-reduced-motion`.** Replace movement with an instant state change.
8. **Never convey meaning by colour alone** — pair with text, icon, or pattern.
9. **Do not disable zoom**, and keep layout usable at 200% text size.

## Forms

Errors are associated with their field (`aria-describedby`), announced, and stated in
words. Required fields marked in text as well as `required`. Do not validate on every
keystroke before first blur — it is hostile to screen reader users.

## Custom widgets

If you are building a combobox, tabs, menu, or dialog by hand, use the WAI-ARIA Authoring
Practices pattern for the exact roles and key handling — or better, use the primitives
library the project already has.

## Verification

- Unplug the mouse and complete the flow.
- Tab through: does focus go somewhere visible, in a sensible order?
- Run the project's axe/eslint-jsx-a11y checks if present.
- Check contrast with a real tool, not by eye.
- Zoom to 200% and to 360px width.

## Common mistakes

- `aria-label` on a `<div>` that is not focusable — invisible to keyboard users.
- Placeholder as the only label.
- Custom checkbox with no `role`/`aria-checked`/keyboard support.
- Auto-focusing something on every render, stealing focus mid-interaction.
