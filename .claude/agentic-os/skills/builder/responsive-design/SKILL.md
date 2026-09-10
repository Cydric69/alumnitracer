---
name: builder/responsive-design
description: Layouts that hold from 320px to ultrawide - fluid by default, breakpoints only where the design actually breaks.
agents: [builder, design-critic]
domains: [frontend, ui, visual]
triggers: [responsive, mobile, breakpoint, viewport, layout, grid, flex, tablet, desktop]
dependencies: []
conflicts: []
priority: 7
version: 1.0.0
---

# Responsive design

## Principles

1. **Fluid first, breakpoints second.** `clamp()`, `minmax()`, `auto-fit`, and percentage
   widths remove most breakpoints. Add a breakpoint where the layout visibly breaks, not at
   a device size from a 2014 blog post.
2. **Content-driven breakpoints.** Resize until it looks wrong; that width is the breakpoint.
3. **Constrain measure, not just width.** Body text stays 45-75 characters per line —
   `max-width: 65ch` does more for readability than any breakpoint.
4. **Mobile is not "the same page, narrower".** Priority changes: the primary action moves
   up, secondary navigation collapses, dense tables become cards or scroll horizontally in
   their own container.
5. **The page body never scrolls horizontally.** Wide things (tables, code, diagrams) scroll
   inside their own `overflow-x: auto` container.

## Modern tools to reach for

- `grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))` — a responsive card grid
  with zero media queries.
- `clamp(1rem, 2.5vw, 2rem)` for fluid type and spacing.
- Container queries (`@container`) when a component's layout depends on its own width, not
  the viewport — this is the correct tool for reusable components.
- `dvh` over `vh` for full-height mobile layouts (address-bar safe).
- `gap` instead of margin hacks.

## Touch

Hit targets at least 44×44px. No hover-only affordances — anything revealed on hover needs
a tap/focus path. Do not attach meaning to `:hover` on touch devices.

## Verification

Check 360×640, 768, 1024, 1440, and 2560. Then check 320px — it still exists and it is
where overflow bugs surface. Check with the OS font size increased. Check landscape on a
short viewport (a 400px-tall window breaks most "centred hero" layouts).

## Common mistakes

- Fixed pixel heights on text containers.
- `100vw` (ignores the scrollbar → horizontal overflow).
- Hiding content on mobile instead of reorganising it.
- A sticky header eating half a short viewport.
- Absolute positioning to fake a layout that grid does properly.
