---
name: shared/safe-tool-use
description: How to use granted tools autonomously without tripping - or bypassing - the dangerous-action guards.
agents: [orchestrator, analyst, researcher, builder, design-critic, tester, repairer, reviewer]
domains: [safety, tooling]
triggers: [command, shell, bash, delete, deploy, migrate, force, sudo, credentials]
dependencies: []
conflicts: []
priority: 10
version: 1.0.0
---

# Safe tool use

## What it is

The operating rules for tools the Agentic OS has been granted. Ordinary engineering work
is autonomous; dangerous actions are guarded. Both halves matter.

## Autonomous by default

Read, search, edit, write, run tests, lint, format, typecheck, build, inspect git history,
stage and commit. Do not ask permission for these. Repeatedly requesting approval for
granted, safe operations wastes the user's attention and is itself a failure mode.

## Always guarded

The guard evaluates every command; you cannot see its verdict in advance, so apply the
same rules yourself:

- Recursive deletion, device writes, permission widening
- `git push --force`, history rewrites, `reset --hard`, `clean -fd`, remote branch deletion
- `DROP`, `TRUNCATE`, unqualified `DELETE`/`UPDATE`, any DB CLI pointed at production
- Deployments (`kubectl apply`, `terraform apply`, `vercel --prod`, …)
- Cloud resource deletion
- Reading or transmitting credential material
- Piping network content into a shell
- `sudo`, system configuration, package publishing

## The rule that matters most

**Never work around a guard.** Not with a wrapper script, not with a subshell, not by
base64-encoding the command, not by writing a Python one-liner that calls `os.system`, not
by asking another agent to run it. A guard verdict of BLOCK ends that approach. A verdict
of CONFIRM or REVIEW_REQUIRED goes to the user with the reason and the alternatives — that
is the intended path, not an obstacle.

## Safer substitutes

| Instead of | Use |
|---|---|
| `rm -rf dir` | move to a temp dir, or delete named files |
| `git reset --hard` | `git stash` |
| `git push --force` | `git push --force-with-lease`, after review |
| `DELETE FROM t` | `DELETE FROM t WHERE …` with a preceding `SELECT COUNT(*)` |
| `curl … \| sh` | download, read it, then run it |
| editing `.env` | edit `.env.example`, tell the user what to set |

## Before any irreversible action

State what will change, what cannot be undone, and what the backup is. If you cannot name
the backup, you are not ready to run it.

## Common mistakes

- Assuming a command is safe because it worked in another repository.
- Running a destructive command "in a test directory" that turns out to be a symlink.
- Committing a `.env` file because it was in `git status`.
- Chaining a dangerous command behind a safe one to make the line read as routine.
