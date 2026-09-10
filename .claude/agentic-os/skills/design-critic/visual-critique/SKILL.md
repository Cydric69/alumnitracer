---
name: design-critic/visual-critique
description: Structured critique of a UI - ranked, specific findings with a concrete replacement for each, rather than opinion.
agents: [design-critic, reviewer]
domains: [visual, design, quality]
triggers: [critique, review the design, feedback on ui, does this look, design review, why does it look]
dependencies: [builder/design-taste, builder/anti-ai-slop]
conflicts: []
priority: 8
version: 1.0.0
---

# Visual critique

## What it is

A method for producing design feedback a builder can act on without a conversation.

## The pass order

Critique in the order that fixes cascade, because fixing hierarchy often dissolves ten
downstream complaints:

1. **Purpose** — what is this screen for, and does it show that first?
2. **Hierarchy** — first, second, third read. Is the ranking right and is it strong enough?
3. **Structure** — grouping, alignment, grid, rhythm between sections.
4. **Space** — is it a system, and does it vary meaningfully?
5. **Type** — families, scale steps, weights, measure, line height.
6. **Colour** — palette size, accent discipline, contrast.
7. **Components** — do cards/borders/shadows carry meaning or fill space?
8. **States** — hover, focus, loading, empty, error.
9. **Content** — is the copy specific to this product?
10. **Motion** — purposeful or decorative?

## Finding format

Every finding has three parts:

```
[severity] What is wrong (specific, with the element named)
Why it fails (the principle, one clause)
Instead: the concrete replacement (values, not adjectives)
```

Severity: **blocking** (ships wrong: illegible, inaccessible, or misleading),
**significant** (visibly mediocre; a user would notice something is off),
**polish** (a refinement, do it if time allows).

Bad finding: "The spacing feels off."
Good finding: "[significant] Section padding is 24px between every block, so the pricing
table reads as part of the FAQ. Why: uniform space destroys grouping. Instead: 96px between
top-level sections, 24px within a section, 8px between a label and its value."

## Rules

- Maximum five blocking findings. If everything is blocking, nothing is.
- Never critique what the user explicitly chose and reaffirmed.
- Accessibility findings outrank aesthetic ones, always.
- If the design is good, say so and stop. Manufactured findings destroy the signal.
- Judge against the product's stated personality, not your own preference.

## Verification

Hand the critique to a builder. If they can implement every finding without asking a
question, the critique is done.
