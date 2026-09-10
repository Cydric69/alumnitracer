---
name: builder/motion
description: Purposeful animation - duration, easing, orchestration, and performance - with reduced-motion support built in.
agents: [builder, design-critic]
domains: [frontend, ui, visual]
triggers: [animation, motion, transition, animate, easing, spring, scroll effect, parallax, gsap, framer]
dependencies: [builder/performance]
conflicts: []
priority: 6
version: 1.0.0
---

# Motion

## The purpose test

Motion must do one of four jobs: show **where something came from or went**, show a
**state change**, direct **attention** to a change the user did not cause, or express
**brand personality** in a place where it does not delay the user. Motion that does none of
these is decoration — remove it.

## Duration and easing

| What | Duration | Easing |
|---|---|---|
| Hover, focus, small state change | 100-150ms | `ease-out` |
| Dropdown, tooltip, toggle | 150-250ms | `ease-out` entering, `ease-in` leaving |
| Modal, drawer, page transition | 250-400ms | `cubic-bezier(0.2, 0, 0, 1)` |
| Large or spatial movement | 400-600ms | spring, or a custom curve |

Entering is faster than leaving is a myth in reverse: things should *enter* decisively
(ease-out, quick) and *leave* quickly and unobtrusively. Nothing a user waits on should
exceed 400ms. Linear easing is wrong for everything except a continuous progress indicator.

## Orchestration

Stagger related items by 20-50ms — enough to read as sequence, not as lag. Cap the number
of staggered items (after ~8, the last one arrives late enough to feel broken). Animate one
property family at a time; simultaneous position, colour, size, and opacity changes read as
noise.

## Performance

Animate `transform` and `opacity` only. Animating `width`, `height`, `top`, `left`,
`margin`, or `box-shadow` triggers layout or paint on every frame. Promote sparingly with
`will-change` and remove it after. Any animation that cannot hold 60fps should be replaced
by an instant change — jank is worse than no motion.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```
Then check that every animated element still reaches its correct final state. Reduced
motion means "no movement", not "no feedback" — keep opacity/colour cues.

## Scroll

Scroll-triggered reveal is the most overused effect in existence. If you use it: once only,
short distance (8-16px), fade-dominant, never on primary content the user came to read, and
never blocking. No parallax on text. No scroll-jacking, ever.

## Common mistakes

- 800ms page transitions that feel broken after the second visit.
- Bounce/elastic easing on functional UI (fine for a mascot, wrong for a menu).
- Animating a list that re-sorts on every keystroke.
- Infinite subtle loops that draw the eye away from content.
- Animation with no `will-change`/composite path that drops frames on mobile.

## Verification

Record it and step through: does the motion explain something? Disable it entirely — is
anything lost? Test on a mid-range phone, and with reduced motion enabled.
