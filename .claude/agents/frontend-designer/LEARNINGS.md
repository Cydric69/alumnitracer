# Learnings — `frontend-designer`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-10 — scripts/verify/contrast.mjs --self-test passes but its standing table is empty on this repo: the parser expects HSL-triple custom properties (--card: 0 0% 100%) and app/globals.css defines every token in oklch().
<!-- key:fe0e3ea4dc5c -->

- **Trigger:** scripts/verify/contrast.mjs --self-test passes but its standing table is empty on this repo: the parser expects HSL-triple custom properties (--card: 0 0% 100%) and app/globals.css defines every token in oklch().
- **Lesson:** Do not report 'contrast.mjs does not run'. It runs; it just cannot read oklch tokens. Compute ratios with the same WCAG 2.1 relative-luminance math on the hex values, state that the script could not read the live tokens, and file the oklch parser gap as the enforcement item.
- **Guard:** Extend contrast.mjs with an oklch() parser so this repo's tokens are actually readable — until then NONE-YET.
- **Promoted:** no

## 2026-09-10 — app/page.tsx:150 opens a div commented 'Newspaper Masthead' carrying border-b-4 border-black, but it does not close until :939 — it wraps the entire page including the footer.
<!-- key:2db0975d8a4f -->

- **Trigger:** app/page.tsx:150 opens a div commented 'Newspaper Masthead' carrying border-b-4 border-black, but it does not close until :939 — it wraps the entire page including the footer.
- **Lesson:** Verify container nesting by matching the closing tag before trusting a wrapper's comment or its border classes; the audit reported a 4px rule under the masthead that actually renders under the footer.
- **Guard:** NONE-YET — a JSX depth linter would catch a wrapper whose comment names a section far smaller than its span.
- **Promoted:** no

## 2026-09-21 — Tailwind v4 repo: focus-visible:outline-none compiles to ONLY '--tw-outline-style:none; outline-style:none'. Confirmed by compiling with @tailwindcss/cli@4 (v4.3.3). v3's forced-colors fallback moved to .outline-hidden, which emits '@media (forced-colors:active){outline:2px solid transparent;outline-offset:2px}'.
<!-- key:f20bc1396b0d -->

- **Trigger:** Tailwind v4 repo: focus-visible:outline-none compiles to ONLY '--tw-outline-style:none; outline-style:none'. Confirmed by compiling with @tailwindcss/cli@4 (v4.3.3). v3's forced-colors fallback moved to .outline-hidden, which emits '@media (forced-colors:active){outline:2px solid transparent;outline-offset:2px}'.
- **Lesson:** In any Tailwind v4 project, treat focus-visible:outline-none paired with a box-shadow ring as a Windows High Contrast Mode failure: box-shadow is not painted in forced-colors, so the control has zero focus indicator. Always specify focus-visible:outline-hidden instead. Verify by compiling the exact utility string rather than trusting v3 knowledge.
- **Guard:** A lint rule banning 'outline-none' in className when the project's tailwindcss major is >=4 — grep -rn 'focus-visible:outline-none' app components should return zero.
- **Promoted:** no

## 2026-09-21 — shadcn Button base class in this repo supplies focus rings via 'focus-visible:ring-ring/50 focus-visible:ring-[3px]'; app/globals.css:104 sets --ring: oklch(0.708 0 0).
<!-- key:dfc552cc4948 -->

- **Trigger:** shadcn Button base class in this repo supplies focus rings via 'focus-visible:ring-ring/50 focus-visible:ring-[3px]'; app/globals.css:104 sets --ring: oklch(0.708 0 0).
- **Lesson:** MEASURED: --ring resolves to #a1a1a1 (2.59:1 on white); at /50 alpha composited on white it is #d0d0d0 = 1.54:1, and on gray-100 1.48:1 — both far below the 3:1 non-text floor. Any shadcn Button (especially variant='ghost', where the companion focus-visible:border-ring is inert because ghost has no border-width) has an effectively invisible focus ring. Do not accept the shadcn default as 'has a focus ring'. Reference passing values on white: ring-gray-900 17.75:1, ring-gray-800 14.68:1, ring-black 21:1.
- **Guard:** Fix --ring at the token level in app/globals.css rather than per-component; then a contrast.mjs oklch parser could assert --ring vs --background >= 3:1. Until the parser lands, NONE-YET.
- **Promoted:** no

