---
name: builder/anti-ai-slop
description: Detect and remove the tells that mark generated UI and copy as generic, templated, or machine-written - a quality gate that functioning code can still fail.
agents: [builder, design-critic, reviewer]
domains: [frontend, visual, design, quality]
triggers: [generic, ai slop, templated, boring, looks like every, cookie cutter, bland, copy, placeholder]
dependencies: []
conflicts: []
priority: 9
version: 1.0.0
---

# Anti-AI-slop

## What it is

A checklist-driven detector. Slop is not "ugly" — it is *undifferentiated*: output that
would be identical for a completely different product. A page can pass every test, meet
every requirement, and still fail this gate.

## When it applies

Before shipping any user-facing surface, and during design review. It complements
functional tests; it does not replace them.

---

## The visual tells

Score each; three or more means the surface needs work.

1. Centred hero: big headline, one grey subheading, two buttons side by side, gradient
   background blob behind.
2. A three- or four-column grid of identical cards, each an icon, a two-word title, and a
   one-sentence description of equal length.
3. Everything in a card. Cards inside cards. A card containing a grid of cards.
4. Uniform padding at every level — no space is bigger or smaller than any other on purpose.
5. Exactly one font size for all body text and one for all headings.
6. Purple/indigo-to-blue gradient, or the default Tailwind blue-600 as the only accent.
7. Drop shadow on every surface, all the same depth.
8. Pill-shaped tags scattered as decoration with no filter behaviour behind them.
9. Mixed icon styles, or emoji standing in for icons.
10. Symmetric layout throughout: everything centred, nothing off-axis, no full-bleed break.
11. Placeholder avatars, "Company Name", stock-photo silhouettes, sample chart data.
12. Section after section of the same rhythm: heading, paragraph, three items, repeat.

## The copy tells

- "Streamline your workflow", "Take your X to the next level", "Powerful yet simple",
  "Seamlessly integrate", "Unlock the power of", "in seconds", "built for modern teams".
- Feature names that describe a category, not this product ("Analytics", "Automation").
- Three benefits, always three, always parallel in structure and length.
- Em-dash-heavy, symmetrical, adjective-stacked sentences with no concrete noun in them.
- Buttons labelled "Learn more", "Get started", "Submit" instead of the actual verb.
- Empty states that say "No data" instead of telling the user what to do next.

## The code tells

- Every component accepts `className` and spreads props, with no real API.
- Tailwind classes copied verbatim from the docs example, unrelated to a token system.
- Duplicate helpers because the existing one was not searched for.
- Comments that restate the code (`// set the user`, `// loop through items`).
- Symmetric CRUD boilerplate for entities that do not need all four operations.
- A test file that asserts the component renders and nothing else.

---

## How to fix, not just detect

For each tell, the repair is specificity:

| Tell | Repair |
|---|---|
| Generic hero | Lead with the product's actual claim, in the user's words. Break symmetry: put the visual off-axis, or let the type be the whole hero. |
| Card grid | Ask what the items really are. Different importance → different sizes. Sequential → a list with real rhythm. Comparable → a table. |
| Uniform spacing | Apply a scale, then deliberately increase between groups and decrease within them. |
| One accent everywhere | Restrict the accent to the single primary action per view. |
| Placeholder content | Write the real content first, then lay it out. Design around the longest and the emptiest real case. |
| Generic copy | Replace every adjective with a fact. "Fast" → "renders 50k rows in under 200ms". |
| Three-benefit block | Say the one thing that is actually true and specific; drop the padding two. |

## The differentiation test

Cover the logo and the product name. Could this page belong to any of ten other products in
the category? If yes, nothing on it is specific. Find the one true, concrete, verifiable
thing about this product and let the design be built around that.

## Verification

Run through the visual tells (12), the copy tells (6), and the code tells (6). Report the
count and the three highest-impact fixes. A surface with zero tells and no personality is
still a fail — absence of slop is not presence of design (see builder/design-taste).
