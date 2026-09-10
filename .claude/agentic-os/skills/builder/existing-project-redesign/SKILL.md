---
name: builder/existing-project-redesign
description: Upgrade the visual quality of a live product without breaking it - audit first, tokenise, then migrate surface by surface.
agents: [builder, design-critic, analyst]
domains: [frontend, visual, design]
triggers: [redesign, revamp, modernize, refresh, make it look better, existing site, improve the ui, facelift]
dependencies: [builder/design-taste, builder/anti-ai-slop, builder/accessibility]
conflicts: []
priority: 8
version: 1.0.0
---

# Existing-project redesign

## The rule that saves the project

**Audit before you touch anything.** A redesign that starts by rewriting a component is how
working products break. The first deliverable is a written audit, not a diff.

## 1. Audit

Inventory what exists:

- Every colour used (grep hex values and Tailwind colour classes) — count them. Real
  projects typically have 40+ where 8 would do.
- Every font size and family. Every border radius. Every shadow.
- Component duplication: how many button implementations are there? Modals? Card variants?
- The styling mechanism(s) in use — and whether more than one is in play.
- Accessibility state: contrast failures, missing focus styles, keyboard traps.
- The slop tells from builder/anti-ai-slop, counted per surface.

Write it up with counts. The audit is what justifies the work and bounds it.

## 2. Decide the target

Personality sentence, then a token set: colour, type scale, space scale, radii, shadows,
motion durations. This is a small file, and everything downstream references it.

## 3. Tokenise before restyling

Introduce the tokens as CSS custom properties (or the framework's theme config) and map the
*existing* values onto them first. Nothing changes visually at this step, but every
subsequent change becomes one edit instead of two hundred.

## 4. Migrate in priority order

1. Global type and colour tokens (largest visible improvement per line changed).
2. The shared primitives: button, input, card, link, heading.
3. The highest-traffic screen.
4. Everything else, screen by screen.

Ship each step. A half-migrated app with a coherent primitive layer is fine; a half-rewritten
component tree is not.

## 5. Do not break behaviour

- Keep component APIs stable. If a prop must change, keep the old one working and deprecate.
- Do not "fix" behaviour while restyling. Log it, do it separately.
- Do not swap the styling framework mid-redesign unless that *is* the project.
- Screenshot the affected pages before and after; diff them yourself.
- Run the existing test suite after each step. Update snapshot tests deliberately, reading
  the diff — not with a blanket `-u`.

## Common mistakes

- Starting with the hero section and never finishing the app, leaving two visual languages.
- Introducing a component library alongside the existing one, doubling the surface.
- Deleting "unused" CSS that a server-rendered template still references.
- Changing spacing globally and breaking dense data screens that relied on the old density.
- Improving the look while regressing contrast or focus visibility.

## Verification

Before/after screenshots per screen, the audit's counts recomputed (colours, sizes, shadows
should all drop sharply), the full test suite, and a keyboard pass on the migrated screens.
