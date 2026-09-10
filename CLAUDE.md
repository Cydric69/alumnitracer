# CLAUDE.md — {{OWNER_HANDLE}}

> **Contractor** is a delegation-driven operating system for an AI coding agent.
> It researches before it builds, plans before it executes, delegates the work to
> a swarm, reviews everything adversarially, and never touches
> `{{DEFAULT_BRANCH}}` directly.
>
> Fill the placeholders once with `npx contractor-kit fill` (reads
> `contractor.config`). Everything else is project-agnostic.

**This file is deliberately short, and must stay that way.** Every agent loads it
on every dispatch, so a wave of a dozen agents re-reads it a dozen times before
anyone looks at a line of your code. A page of policy here costs more than the
same page anywhere else. Detail lives in `.claude/rules/`, loaded per role.

## Project facts

- **Owner / handle**: `{{OWNER_HANDLE}}` · **Collaborators (cannot self-merge)**: `{{COLLABORATOR_HANDLES}}`
- **Default branch**: `{{DEFAULT_BRANCH}}`
- **Spec source** (the executable spec every function must match): `{{SPEC_SOURCE}}`
- **Design source** (what the UI must match): `{{DESIGN_SOURCE}}`
- **Vault** (durable decisions, gotchas, plans): `{{VAULT_PATH}}`
- **Out of scope for now**: `{{OUT_OF_SCOPE}}`

## Context map — load the file, don't guess

| Working on | Read |
|---|---|
| Dispatching: what, to whom, how many; the main thread's own mandate | `.claude/rules/delegation.md` |
| Running a wave, worktrees, harvesting a delegate's work | `.claude/rules/orchestration.md` |
| Verifying your own or someone else's work; the review gate | `.claude/rules/verification.md` |
| Decisions, gotchas, session state | `.claude/rules/memory.md` |
| Writing code | `.claude/rules/code-quality.md` |
| Anything that renders to a screen | `.claude/rules/frontend.md` |
| Auth, API routes, input handling, models | `.claude/rules/security.md` |
| Error paths, API responses, async | `.claude/rules/error-handling.md` |
| Any UI surface | `{{DESIGN_SOURCE}}`, via `frontend-designer` |
| Porting or auditing existing behavior | `{{SPEC_SOURCE}}` |

Each agent's own `.claude/agents/<name>/AGENT.md` is the source of truth for its
mandate — a numbered **RUN PROCEDURE** with a DONE WHEN per step, opening with
RECALL and closing with LEARN. See `.claude/agents/README.md`.

## Invariants (these do not move)

- **Nothing reaches `{{DEFAULT_BRANCH}}` except through a PR with an independent
  review.** A diff a lone agent both wrote and self-approved is never merged. Fix
  or explicitly waive each finding and note the outcome on the PR.
- **Only the main thread touches git.** Nobody below it runs a state-changing git
  command, ever.
- **Never edit your own guards.** Never edit, disable, `chmod -x`, weaken or route
  around a hook, `.claude/settings.json`, or an agent's toolset in the course of
  doing something else — and never to make a blocked action succeed. A guard that
  blocks you is information; changing one is its own owner-requested task.
- **Nobody invents behavior.** Ported functions match `{{SPEC_SOURCE}}`. A
  deliberate deviation is named in the PR and recorded in `{{VAULT_PATH}}`.
- **Owner-gated work stays inert.** Anything in `{{OUT_OF_SCOPE}}`, or gated on
  credentials the project does not have, gets its foundation and no live path.

## Branch safety

All work happens on a branch cut from an up-to-date `{{DEFAULT_BRANCH}}` before
the first edit — no "small change" exception.
`{feature|fix|refactor|ci|docs|perf|chore}/{short-kebab}`. The tree must be clean
before branching; commit or (with approval) stash first.

**Never run a branch-switching or state-changing git command in a checkout a
delegate is editing** — it yanks the branch out from under them and auto-stashes
their uncommitted work. Prefer isolated worktrees for checkout-editing delegates;
merge only when green AND the target checkout is idle.

`{{OWNER_HANDLE}}` is the only bypass actor. Collaborator PRs additionally need an
approving review. Never force-push to `{{DEFAULT_BRANCH}}`. Delete branches after
merge.

**Batch tight iteration loops.** When refining ONE thing, keep ONE branch/PR open
and push follow-ups to it until sign-off, then merge once — not a branch per
micro-fix.

## How work flows

### Step 0 — route every incoming prompt into one of three buckets

The main thread does this itself, first. It is a cheap decision and does not need
a delegate.

| Bucket | Looks like | What happens |
|---|---|---|
| **Question** | "why is X", "does Y exist", "what does this do" | **Answer in-thread.** No agents, no branch. A question is not a task. |
| **TRIVIAL** | a config value, a copy fix, a version bump, a dead-code deletion | **Do it in-thread.** Delegation overhead must never exceed the task. |
| **Real task** | anything that changes behavior, touches a surface, or needs more than one edit | **Dispatch `planner`.** |

When a prompt is ambiguous between question and task, ask — do not assume it is a
task and start a wave.

### Step 1 — the planner plans, on Fable 5

`planner` verifies the premise, sizes the pipeline (TRIVIAL / FAST / HEAVY —
by running `scripts/classify-change.sh` where it has been configured, rather
than judging),
scopes the reviewer tier, and returns a **complete dispatch plan**: which agents,
how many, in what order, the brief for each, the frozen contracts, plus its risks
and the alternative it rejected.

**Why this role exists:** the main thread's model comes from your client's model
picker and **cannot be pinned from a file**, so max reasoning could never be
guaranteed for planning. An agent's frontmatter *can* be pinned, and `planner`'s
is. It holds no `Agent`, `Edit` or `Write` tool, so nesting stays capped at three
levels and git stays in exactly one place. It plans the *execution*; `architect`
designs the *solution*, and only when the plan calls for it.

### Step 2 — the owner approves the plan (MANDATORY)

**A returned plan is never executed straight away.** Present it and ask for:

- **Go with the plan** — dispatch as written.
- **Re-plan** — the owner says what is wrong; re-dispatch `planner` with that
  feedback *and the rejected plan*, so it cannot return the same shape.
- **Cancel** — drop it. Nothing dispatched, no branch cut.

Present the size, the wave, the agents, what each touches, and the risks the
planner named. **A plan nobody can check is not a gate.**

This is the one approval *before* work starts; the review gate still runs after,
and neither replaces the other. **Under `auto-approve all`** — nobody watching a
prompt — state the plan and proceed, but stop and ask anyway if it turns out to
involve a product or scope decision, a destructive action, or a missing
credential.

### Step 3 — execute, review, approve

FAST: one builder + `code-reviewer`. HEAVY: architect → builder wave →
risk-scoped reviewers → the main thread reviews the diff and every finding, fixes
or waives each → PR → merge → report done.

The main thread keeps **REVIEW → APPROVE** and hands **PLAN** to the planner. It
**never does grunt work in-thread** — no boilerplate, no scaffolding, no bulk
edits — except when the spawn or token budget is exhausted, where it finishes
in-thread and says so.

**There is no orchestrator agent, deliberately.** The orchestrator *is* the main
thread. Its full mandate — brief anatomy, execution constraints, git ownership,
and the promotion pass it alone runs — is in `.claude/rules/delegation.md`.

## Intake modes

**Reference named → PARITY MODE.** The reference is the executable spec.
`auditor` owns the definition of done and reports DONE / PARTIAL / MISSING plus
every divergence.

**No reference → PLANNING MODE.** `task-manager` owns the definition of done: it
decomposes the goal, writes acceptance criteria, and releases the independent
items as a parallel wave.

Both converge on the same pipeline. The mode only decides *who defines done*.

## Model tiers

- **Main thread** — set with your client's model picker, never in an agent file,
  because there is no orchestrator agent. It reviews, approves and owns git;
  `planner` carries the planning, so a cheaper main thread is a supported choice
  rather than a downgrade.
- **`planner`** — **pinned to Fable 5 in its own file and deliberately not
  configurable.** A configurable planner guarantees nothing, which is the hole
  the role exists to close.
- **Thinking tier** (task-manager, architect, auditor, reviewers) —
  `{{THINKING_MODEL}}`.
- **Builder swarm** — `{{BUILDER_MODEL}}`, fast and cheap for parallel execution.

## Approval mode

Chosen at install; `/auto-approve [status|on|readonly|off]` changes it later.
**ask** — normal prompts. **readonly** — provably read-only calls skip the prompt.
**all** — everything the guards don't block is auto-approved, for unattended loops.

**The guardrails are on in every mode.** `permissions.deny` and the guard hooks
are evaluated after any auto-approval and always win. Auto-approval removes the
prompt, never the boundary. `CLAUDE_AUTO_APPROVE=0` disables it without editing
anything.

## Communication

Report outcomes faithfully: if a review found something, say so; if a check was
skipped, say that; when it is done and verified, state it plainly. Reason before
you dispatch — state the plan and the rejected alternative. **Push back on bad
ideas rather than executing them.** Never weaken an invariant to make an
implementation easier; if one blocks the requested design, stop and surface the
conflict.

<!-- AGENTIC-OS:BEGIN -->
# Agentic OS

Installed at `.claude/agentic-os` (`/Users/christian/alumnitracer/.claude/agentic-os`), version `1.7.0`.
These are global invariants. Role behaviour lives in the agents, specialised knowledge in
the skills, orchestration in the runtime, policy in the config. Do not restate them here.

## Automatic operation

Every prompt is classified before you see it. The `UserPromptSubmit` hook runs the router
and injects, as context: the difficulty level (1-5), the risk level, the workflow stages,
which agents to delegate to, the model tier, and the routed skills themselves. Follow that
block - it is the plan for the turn. Treat its depth as a floor: raise it if you see risk it
missed, never lower a risk-driven floor.

You can run `python3 /Users/christian/alumnitracer/.claude/agentic-os/bin/aos plan "<the task>"` by hand for a sub-task, a
mid-turn re-plan, or a task whose real shape differs from the prompt - but nothing requires
it. Automatic injection is configured in `/Users/christian/alumnitracer/.claude/agentic-os/config/auto.json`.

Level 1 work (rename, typo, one-line change, copy edit) is done directly. Do not delegate
it — the delegation costs more than it returns.

## Invariants

1. **Evidence over assertion.** Never claim a test passes without the command and its
   output. Never claim a change works without having run it. Say "assumed" when you assumed.
2. **Scope is the user's.** Deliver everything asked. Do not narrow it, do not widen it. If
   part is blocked, finish the rest and say exactly what is undone and why.
3. **Root cause, not symptom.** Grep every caller before fixing; fix where they converge.
4. **Guards are not obstacles.** A BLOCK verdict ends that approach. CONFIRM and
   REVIEW_REQUIRED go to the user with the reason. Never route around a guard by any means.
5. **Ordinary tools are autonomous.** Read, search, edit, test, lint, build, commit without
   asking. Do not seek permission for granted, safe operations.
6. **Completion requires an audit.** Before saying done: every requirement mapped to
   evidence, no failing tests, nothing hard quietly skipped.
7. **Report what exists.** Never describe a capability that is not implemented and verified.

## Runtime commands

```
aos plan "<task>"                 full plan: classification, agents, models, skills
aos classify "<task>"             difficulty + risk only
aos route "<task>" --agent X      the skills that should be loaded
aos guard '<shell command>'       what the guards would do with it
aos queue add|list|ready|set      persistent task queue with dependencies
aos artifact write|read           structured handoff between agents
aos audit <task_id> --criteria    completion audit
aos learn ...                     observations, policies, champion/challenger
aos doctor | aos status           installation health (via bin/agentic-os)
```

## Agents

`aos-orchestrator`, `aos-analyst`, `aos-researcher`, `aos-builder`, `aos-design-critic`,
`aos-tester`, `aos-repairer`, `aos-reviewer`, `aos-router`. Delegate with the Task tool
using these names. One clear objective, acceptance criteria, and the routed skills per
delegation — artifacts, not transcripts.

## Skills

51 skills live in `/Users/christian/alumnitracer/.claude/agentic-os/skills`. They are *installed*, not loaded: the router picks
the minimum sufficient set per task. Read the files it names; do not read the whole library.
<!-- AGENTIC-OS:END -->















