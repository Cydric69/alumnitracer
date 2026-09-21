# Learnings — `code-reviewer`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-10 — A committed agent-config JSON carries hook commands with an absolute /Users/<name>/... path, while sibling entries in the same file use the portable $CLAUDE_PROJECT_DIR form.
<!-- key:0f9ab54ccee9 -->

- **Trigger:** A committed agent-config JSON carries hook commands with an absolute /Users/<name>/... path, while sibling entries in the same file use the portable $CLAUDE_PROJECT_DIR form.
- **Lesson:** On any scaffolding or config PR, grep added lines for an absolute home path FIRST: git diff main...BRANCH | grep -E '^\+.*/(Users|home)/[a-z]+/'. Installer-generated config is machine-local by default; it breaks every other clone silently because a failed hook does not fail the build.
- **Guard:** A pre-commit or CI grep over committed agent JSON and CLAUDE.md for '/Users/|/home/[a-z]' exiting nonzero — cheaper and never forgotten, unlike a reviewer turn.
- **Promoted:** no

## 2026-09-21 — A new verify/guard script asserts a security invariant against a hand-written MIRROR of the real function, linked to the source only by structural regexes over the file text.
<!-- key:cb0d59b54e84 -->

- **Trigger:** A new verify/guard script asserts a security invariant against a hand-written MIRROR of the real function, linked to the source only by structural regexes over the file text.
- **Lesson:** Never accept a guard script's green exit as evidence the invariant holds. Mutation-test the guard itself: reintroduce the exact vulnerability into the REAL source, rerun the script, and require a nonzero exit. A mirrored implementation tests the mirror; source regexes only catch the one spelling of the regression the author imagined. Demand the script import the real function (transpile the actions module, or extract the builder into the schema module it already transpiles).
- **Guard:** CI step that applies a known-bad patch to the guarded source and asserts the guard exits nonzero - a guard with no mutation test is decoration.
- **Promoted:** no

## 2026-09-21 — A diff hand-writes a Tailwind arbitrary transition property list (transition-[a,b]) to replace a named utility like transition-transform, and the reviewer reasons about it from CSS-spec knowledge instead of the generated stylesheet.
<!-- key:a91dde35a0d3 -->

- **Trigger:** A diff hand-writes a Tailwind arbitrary transition property list (transition-[a,b]) to replace a named utility like transition-transform, and the reviewer reasons about it from CSS-spec knowledge instead of the generated stylesheet.
- **Lesson:** Never review a Tailwind class change by reasoning about plain CSS. Tailwind v4 changed which PROPERTY its utilities emit: translate-x-* now sets the standalone 'translate' property, not 'transform', which is why the built-in .transition-transform expands to 'transform, translate, scale, rotate'. An arbitrary list that names only 'transform' silently animates nothing. Compile the exact class string before judging it: symlink node_modules into the scratchpad, write the classes into in.html, use an input CSS of '@import "tailwindcss" source(none); @source "./in.html";' (the --content flag is ignored and auto-detection will scan the real project, masking the result), run npx @tailwindcss/cli, and read the emitted declarations. The same build also settles cascade-order questions (lg: variants land in a later @media block, so lg:visible does beat .invisible) and preflight questions ([hidden] is display:none !important, so the hidden attribute is safe). Also check v4 selector changes for side effects: space-y-* is now ':where(.space-y-N > :not(:last-child))' and no longer excludes [hidden], so switching a conditionally-rendered child to an always-rendered hidden one adds a gap that did not exist before.
- **Guard:** A build-time check: compile the project's CSS and assert that every element carrying a translate-* utility also carries a transition-property list containing 'translate'. Cheaper interim guard: a lint/grep rule banning arbitrary 'transition-[...]' lists that name 'transform' without 'translate'. NONE-YET installed.
- **Promoted:** no

