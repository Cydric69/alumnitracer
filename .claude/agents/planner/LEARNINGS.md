# Learnings — `planner`

Append-only. Written by `.claude/agents/_lib/learn.sh`, read by this agent as
step 1 of every run. This file has no `name:` frontmatter, so Claude Code
treats it as a co-located doc and never loads it as an agent definition.

Do not hand-edit to delete an entry. An entry leaves this file exactly one way:
it gets **promoted** — into `AGENT.md`, a `.claude/rules/` file, or (best) an
executable guard — and the promotion is recorded in the entry.

## 2026-09-10 — Task said 'secure the auth flow'; reading showed the gate did not exist at all: app/middleware.ts sits inside app/ (Next only loads root middleware.ts/proxy.ts), dashboard layout is a client component with no check, and no server action authorizes. Also 3 unused auth implementations coexisted (zustand store, localStorage hook, server ProtectedLayout).
<!-- key:9f9e9bf1b5e1 -->

- **Trigger:** Task said 'secure the auth flow'; reading showed the gate did not exist at all: app/middleware.ts sits inside app/ (Next only loads root middleware.ts/proxy.ts), dashboard layout is a client component with no check, and no server action authorizes. Also 3 unused auth implementations coexisted (zustand store, localStorage hook, server ProtectedLayout).
- **Lesson:** Before sizing any auth task, grep for the gate file at the project ROOT (middleware.ts|proxy.ts) and grep app/actions for cookies()/auth calls; treat 'harden X' as 'does X run at all' first. Count parallel auth implementations and plan a deletion slice, not a fix slice, for the unused ones.
- **Guard:** scripts/classify-change.sh HEAVY_PATHS: proxy.ts middleware.ts app/api/auth/** services/authService.ts lib/auth/** app/actions/** models/User.ts; plus a scripts/verify check that fails when app/middleware.ts or app/proxy.ts exists
- **Promoted:** no

## 2026-09-21 — Brief said 'a verified patch script is waiting at <scratchpad path>' and 'a design spec already exists'; neither file existed (scratchpad is per-session, spec lived only in a prior chat). Also the checkout was on the PR branch, not main, and 'tsc | grep -v ^alumnitracer/' hid that next build itself type-checks the nested clone and fails on it first.
<!-- key:330ebad87e66 -->

- **Trigger:** Brief said 'a verified patch script is waiting at <scratchpad path>' and 'a design spec already exists'; neither file existed (scratchpad is per-session, spec lived only in a prior chat). Also the checkout was on the PR branch, not main, and 'tsc | grep -v ^alumnitracer/' hid that next build itself type-checks the nested clone and fails on it first.
- **Lesson:** Before planning: cat .git/HEAD; ls -la every path a brief hands over as 'ready'; and run the real gate (next build) not a filtered proxy for it. Treat any artifact referenced by scratchpad path as lost unless it is in the repo or vault.
- **Guard:** NONE-YET (a preflight that ls's every absolute path in the brief would catch the first; classify-change.sh could refuse when HEAD != default branch)
- **Promoted:** no

