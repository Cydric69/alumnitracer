---
name: builder/frontend-engineering
description: Build UI code that fits the project's framework and conventions - state, data flow, rendering, and the boring correctness that UI code usually skips.
agents: [builder, design-critic, reviewer]
domains: [frontend, ui]
triggers: [component, react, vue, svelte, next.js, css, ui, page, frontend, jsx, tailwind, dom]
dependencies: [shared/evidence, builder/component-architecture]
conflicts: []
priority: 8
version: 1.0.0
---

# Frontend engineering

## When it applies

Any change to code that renders to a screen. Not for API-only or CLI work.

## Non-negotiables

1. **Every async surface has four states**: idle, loading, error, empty. Most AI-written UI
   ships only the success state. The empty state needs real copy, not a blank div.
2. **Keys are stable identities**, never array indices, for any list that can reorder.
3. **Controlled inputs stay controlled.** No `value={x || ''}` flip-flops between
   controlled and uncontrolled.
4. **Effects have correct dependencies and cleanups.** Every subscription, timer, and
   listener is removed. An effect that fetches must handle the unmount race.
5. **No layout shift on load.** Reserve space for images and async content.
6. **Forms submit with the keyboard**, show errors next to the field, and do not lose input
   on failure.

## Data flow

- Server state and client state are different things. Cache, invalidate, and refetch server
  state with whatever the project already uses (React Query, SWR, RTK, loaders). Do not
  hand-roll a cache next to an existing one.
- Derive, do not duplicate. Two pieces of state that must agree will eventually disagree.
- Lift state only as far as it is needed. Global state for a dropdown is a bug in waiting.

## Framework fit

Read three neighbouring components before writing one. Match: file layout, styling approach
(CSS modules vs Tailwind vs styled-components — do not mix a fourth), prop naming, export
style, and how they handle errors. A technically better pattern that clashes with the
codebase is the wrong pattern.

## Performance basics (do these, measure the rest)

Stable callbacks for memoised children, virtualise lists past ~200 rows, lazy-load routes
and heavy components, `loading="lazy"` and correct `width`/`height` on images, avoid
re-rendering the whole page on a keystroke. Do not scatter `memo`/`useMemo` without a
measured problem.

## Common mistakes

- `dangerouslySetInnerHTML` with unsanitised content.
- `useEffect` fetching where the framework has a loader/server component.
- Sizing with `window.innerWidth` instead of CSS.
- Swallowing errors into a silent `catch`.
- Building a modal, tooltip, or combobox from scratch when the project already has one, or
  has a primitives library installed (Radix, Headless UI) — the accessibility is the hard part.

## Verification

Render it. Click it. Tab through it. Resize to 360px. Throttle the network and watch the
loading state. Then run the project's tests.
