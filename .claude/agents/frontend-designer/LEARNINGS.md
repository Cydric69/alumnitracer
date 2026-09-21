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

