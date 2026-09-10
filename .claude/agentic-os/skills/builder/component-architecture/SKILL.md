---
name: builder/component-architecture
description: Decide what becomes a component, where state lives, and what the prop contract is - without inventing abstractions nobody asked for.
agents: [builder, design-critic, reviewer]
domains: [frontend, architecture]
triggers: [component, props, reusable, abstraction, refactor component, design system, composition]
dependencies: []
conflicts: []
priority: 7
version: 1.0.0
---

# Component architecture

## When to extract a component

Extract when one is true:

- The same markup appears three times (twice is a coincidence).
- A section has its own state and lifecycle.
- The parent has become impossible to read at a glance.
- It is a real domain concept the team names in conversation.

Do not extract because a file crossed a line count, or "for reusability" with one call site.

## Prop contract

- Props describe *what*, not *how*: `variant="danger"`, not `backgroundColor="#c00"`.
- Boolean props are additive flags, never mode switches. Two booleans that cannot both be
  true is a `variant` union.
- Prefer composition (`children`, slots) over a growing configuration object. A component
  with more than about seven props is usually two components.
- Required props stay required. Defaulting everything hides misuse.
- Never accept `style`/`className` overrides as the extension mechanism for something the
  variant system should express — that is how design systems die.

## State placement

Local until proven otherwise → lift to the nearest common parent → context only for genuine
cross-tree concerns (theme, auth, locale) → global store last. Each step up costs
re-renders and coupling. URL state (filters, tabs, pagination) belongs in the URL.

## Boundaries

- Presentational components take data and callbacks; they do not fetch.
- Container/route components fetch, and pass down.
- Side effects live at the boundary, not inside a leaf that "sometimes" also saves.

## Common mistakes

- A `<Card>` that takes `title`, `subtitle`, `icon`, `footer`, `actions`, `variant`,
  `size`, `elevated`, `bordered`, `compact` — replace with composition.
- Wrapping every primitive "in case we swap libraries later".
- One giant `types.ts` that every component imports, coupling everything to everything.
- Prop drilling five levels instead of composing children.

## Verification

Can you use the component in a second place without adding a prop? Can you read its
signature and know what it renders? If not, it is not ready to be shared.
