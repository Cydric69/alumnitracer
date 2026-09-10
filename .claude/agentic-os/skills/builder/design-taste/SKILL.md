---
name: builder/design-taste
description: The product-design quality standard - editorial hierarchy, intentional whitespace, a restrained visual system, coherent type and iconography, and a specific product personality.
agents: [builder, design-critic]
domains: [frontend, visual, design]
triggers: [design, ui, landing page, redesign, look, visual, styling, beautiful, taste, brand, layout, hero]
dependencies: [builder/anti-ai-slop, builder/accessibility, builder/responsive-design]
conflicts: []
priority: 9
version: 1.0.0
---

# Design taste

## What it is

The reusable standard for interfaces that look designed rather than assembled. It is a
capability, not a style: the same method produces a bank dashboard and a music app.

## When it applies

Any user-facing surface: marketing pages, app screens, dashboards, emails, onboarding.

## When it does not apply

Internal tools where speed of iteration genuinely outranks polish (say so out loud), and
non-visual work. It never overrides accessibility or correctness.

---

## 1. Decide the personality before touching CSS

Write one sentence: *"This should feel ___, like ___, for ___."* Then pick three adjectives
and their opposites (calm not busy; precise not playful; dense not airy). Every later
decision resolves against that sentence. Without it, you will default to the same
purple-gradient SaaS page as everyone else.

Anchor to something real: the product's domain, its existing brand, a physical reference
(a Swiss timetable, a museum wall label, a terminal, a fashion editorial). Specificity is
what makes an interface look intentional.

## 2. Editorial hierarchy

One idea per screen gets to be loudest. Establish it with **scale contrast**: if the hero
headline is 56px, the body should be 16-18px — a ratio near 3:1. Timid contrast (32px vs
20px) reads as amateur.

Rank every element: primary (one), secondary (two or three), tertiary (everything else).
Anything that is not primary gets quieter — smaller, lighter weight, lower contrast, or
further down. Two elements competing for first place means neither wins.

## 3. Whitespace is a material

- Space is not "padding I forgot to remove". Use a scale (4/8/12/16/24/32/48/64/96/128) and
  never a value outside it.
- **Uneven space carries meaning**: 8px between a label and its input, 48px between form
  sections. Uniform 16px everywhere flattens the structure into a list.
- Vertical rhythm between sections should be *generous* — 96-160px on desktop for marketing
  pages. Cramped sections are the single fastest way to look cheap.
- Proximity groups. Related things sit close; unrelated things get real distance. This does
  more than any border or card ever will.

## 4. Typography

- **Two families maximum**, and one is often enough. Pair by contrast of category, not
  similarity (a geometric sans with a high-contrast serif; never two humanist sans).
- Set a scale and use only its steps: e.g. 12, 14, 16, 20, 24, 32, 48, 64. Arbitrary sizes
  are visible even when the viewer cannot name why.
- Line height inverse to size: ~1.6 for body, ~1.1-1.25 for display. Tighten tracking on
  large text (`-0.02em`), never on small text.
- Measure 45-75 characters. Full-width paragraphs are unreadable at any font size.
- Weight for hierarchy before size: 500 vs 700 says more than 16px vs 17px.
- Use real punctuation: curly quotes, en dashes in ranges, non-breaking spaces before units.

## 5. A restrained colour system

- One dominant neutral family (a warm or cool grey with a *tint*, never pure `#808080`),
  one accent, and semantic colours for success/warning/danger. That is the whole palette.
- The accent is for the primary action and nothing else. If everything is accent-coloured,
  nothing is.
- Backgrounds are rarely pure white or pure black. `#FAFAF9` or `#0B0B0C` sits better and
  reads as chosen.
- Build tokens as CSS custom properties on `:root`, redefine them for dark mode, and never
  hard-code a hex in a component.
- Check every pairing for contrast before shipping.

## 6. Surfaces, borders, depth

Prefer separation by **space** first, then a **1px hairline border** (`rgba(0,0,0,0.08)`),
then a **subtle tonal shift**. Shadow is the last resort and should be nearly invisible:
`0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)`. Multi-layer soft shadows read as
expensive; one hard `0 4px 6px rgba(0,0,0,0.3)` reads as a 2015 template.

Radius is a system value, and large elements need proportionally larger radii than small
ones (a 4px radius on a 400px card looks like an accident).

## 7. Iconography

One family, one weight, one metaphor style. Do not mix outline and filled, or Lucide and
Font Awesome, or icons and emoji. Icons sit on the text baseline, sized to the cap height
(usually 1em-1.25em), optically aligned rather than mathematically aligned. Icon-only
buttons always have an accessible name.

## 8. Composition

Break the symmetry. A 12-column grid with everything centred at 8 columns is the default
that makes pages interchangeable. Try: an asymmetric split (7/5), a full-bleed element
against a constrained one, an off-centre focal point, content that overlaps a boundary.
Alignment should be visible — pick edges and hold them across sections.

Density is a decision: a data product should be dense (and then whitespace goes *between
groups*, not inside rows); a marketing page should be sparse.

## 9. Content is design

Placeholder copy produces placeholder design. Write the real headline, the real empty
state, the real error, the real button verb ("Create invoice", not "Submit"). Design the
long-name case, the zero case, the 10,000-row case, and the error case — those are where
real products live and where template designs collapse.

## 10. Motion and interaction

Every interactive element has hover, focus-visible, active, disabled, and loading states.
Transitions are 120-250ms with a natural easing curve. Motion explains a change of state;
it never decorates. Respect `prefers-reduced-motion`. See builder/motion and
builder/interaction-design.

---

## Anti-patterns

Reject on sight: generic SaaS hero with a centred headline, a subheading, two buttons and a
gradient blob · card-in-card-in-card · a three-column feature grid of icon + title +
one-line description · purple-to-blue gradients as a substitute for a palette · heavy drop
shadows on everything · gratuitous glassmorphism · mixed icon sets · emoji as iconography ·
"Lorem ipsum" or "Streamline your workflow" copy · decorative dashboard sparklines with no
data · a rainbow of button colours · centred body text · 14px grey-on-grey as the only text
style · animation triggered on every scroll.

## Verification

1. Squint at it: does one thing dominate? Is the grouping legible as shapes?
2. Print it in greyscale: does the hierarchy survive without colour?
3. Count: font families (≤2), font sizes (from the scale), hues (≤3 plus semantic), shadow
   depths (≤2), radii (≤3).
4. Read the copy aloud: could it belong to any other product? Rewrite until it could not.
5. Check the four states of every async surface, and the accessibility floor.
6. Ask: what specific decision here would a template not have made? If there is no answer,
   the design is not done.
