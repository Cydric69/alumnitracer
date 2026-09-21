# Learnings — `security-reviewer`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-11 — Reviewing this repo's own guard hooks under the dot-claude hooks directory
<!-- key:50ebbf8644ee -->

- **Trigger:** Reviewing this repo's own guard hooks under the dot-claude hooks directory
- **Lesson:** Position-anchored command regexes ((^|[;&|(]|&&)[[:space:]]*git) are bypassable by any wrapper that puts the verb mid-token: bash -c, sh -c, env, command, xargs, eval. Probe every anchored guard live with a harmless wrapped command (bash -c 'git stash list') before calling it sound. Second: hook commands in the settings file must use CLAUDE_PROJECT_DIR, never an absolute /Users/... path, or the guard is silently missing on every other clone. Third: modify-verb denylists must match whole words; unanchored 'dd ' / 'tee' / 'install' hit inside ordinary English.
- **Guard:** A hook-regex fixture suite asserting each guard denies both the bare and the wrapper-prefixed form, plus a grep check failing on /Users/ in the settings file
- **Promoted:** no

## 2026-09-11 — A Next.js server action is shared between a public page and the admin dashboard, and the only thing separating the two audiences is a caller-supplied filter argument (status/isActive)
<!-- key:f0bdea07d557 -->

- **Trigger:** A Next.js server action is shared between a public page and the admin dashboard, and the only thing separating the two audiences is a caller-supplied filter argument (status/isActive)
- **Lesson:** Treat every exported 'use server' function as a directly-invokable unauthenticated HTTP endpoint, argument values included. When one getter serves both a public page and an admin list, the visibility restriction must be hard-coded in the public path, never derived from a caller argument - even a zod-validated enum, because 'inactive' is a legal enum value. Also: a validation helper that returns an empty filter object on parse failure FAILS OPEN - the discarded filter includes the isActive:true the caller asked for, so a malformed field WIDENS the result set. Check the not-success branch of every safeParse that builds a query filter.
- **Guard:** A lint/grep verifier asserting every exported function in app/actions/**.ts either calls requireAdmin() as its first statement or is listed in an explicit PUBLIC_ACTIONS allowlist; plus a rule that no safeParse .success===false branch returns an empty query filter
- **Promoted:** no

## 2026-09-21 — A verify script under scripts/verify/ asserts a security invariant against a hand-copied reimplementation of the real function, linked to the source only by structural regexes
<!-- key:e1728f7e0cb5 -->

- **Trigger:** A verify script under scripts/verify/ asserts a security invariant against a hand-copied reimplementation of the real function, linked to the source only by structural regexes
- **Lesson:** Never accept a structural-regex link as proof the verifier covers the real code. Mutate the real source in a scratchpad, re-run the verifier's regexes against the mutated string, and confirm at least one goes red. Here all four stayed green while both public call sites were rewritten to hardcode allowInactive:true. The fix is to make the invariant importable: move the pure filter builder out of the 'use server' module into lib/validations/ so the verifier imports the real function instead of a copy. Second: in a Next.js App Router repo, a middleware.ts located inside app/ is NEVER executed - only the project root or src/. Check the file's LOCATION, not its contents, before concluding an auth gate exists.
- **Guard:** scripts/verify/content-filters.mjs importing the real buildContentFilters from lib/ rather than reimplementing it; plus a grep check failing when app/middleware.ts exists while root middleware.ts does not
- **Promoted:** no

