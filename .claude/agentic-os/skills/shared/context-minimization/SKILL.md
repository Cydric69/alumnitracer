---
name: shared/context-minimization
description: Pass the minimum sufficient context between agents - specification, relevant files, acceptance criteria, evidence - never whole transcripts.
agents: [orchestrator, analyst, researcher, builder, design-critic, tester, repairer, reviewer]
domains: [process, efficiency]
triggers: [context, handoff, delegate, summarize, pass along]
dependencies: []
conflicts: []
priority: 7
version: 1.0.0
---

# Context minimization

## What it is

A budget discipline. Every token of context you pass to another agent costs money and
attention, and irrelevant context actively degrades the receiving agent's focus.

## What to pass

1. The task statement, as specified (not as originally chatted about).
2. Acceptance criteria.
3. The list of relevant files, with a one-line reason each.
4. Prior agents' structured artifacts — status, summary, files changed, failures, risks.
5. Constraints that are not discoverable from the code (deadlines, product decisions).

## What not to pass

- The conversation transcript.
- Whole files when a function or a `path:line` range would do.
- Tool output that has already been summarized into an artifact.
- Skills the receiving agent will route for itself.
- Your own reasoning narrative. The conclusion and its evidence are enough.

## How to use it

Before delegating, write the brief and then delete every line that the receiving agent
could obtain for itself in one tool call. What survives is the brief.

For file context, prefer: `path` + why it matters + the specific symbol. The agent can read it.

## Common mistakes

- Pasting a 400-line file to ask about one function.
- Forwarding the full failing-test output when the assertion line is what matters.
- Re-explaining the codebase to an agent that can grep.
- Summarizing so hard that the acceptance criteria lose their specifics — minimization is
  not vagueness. Keep every number, name, and path.

## Verification

The receiving agent should never have to ask "what was I given this for?" If its first
action is to re-read something you pasted, you pasted the wrong thing.
