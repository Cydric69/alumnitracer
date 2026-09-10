---
name: researcher/source-evaluation
description: Rank sources by reliability and detect the failure modes of each - including AI-generated and outdated content.
agents: [researcher, analyst]
domains: [research]
triggers: [source, reliable, citation, blog, stack overflow, tutorial, is it true]
dependencies: []
conflicts: []
priority: 6
version: 1.0.0
---

# Source evaluation

## Reliability ladder

1. **The running system** — what the installed code actually does. Highest authority.
2. **Source of the dependency** in `node_modules` / `site-packages` / vendor dir.
3. **Official docs for the installed version**, and the changelog.
4. **Maintainer statements** in issues, PRs, RFCs — check the date and whether it shipped.
5. **High-quality third-party writing** with runnable examples and a stated version.
6. **Q&A answers** — check the date, the accepted answer's comments, and the version.
7. **Tutorials and content-farm posts** — treat as hints to verify, never as authority.

## Red flags

- No version anywhere in the article.
- Code that does not compile against the current API.
- "Best practices" with no trade-off discussed.
- Generic AI-written padding: symmetric bullet lists, no specifics, no error handling,
  examples that never touch a real API.
- Benchmarks without the workload, hardware, or method.
- An answer that solves a slightly different problem than the one asked.

## Conflicting sources

When two sources disagree, the tie-break is always: run it. Failing that, prefer the one
that names its version and shows its method. Report the conflict rather than picking
silently.

## Reporting

Cite as: source, version, date, and whether you verified it. "Verified locally" outranks
every other citation you can give.

## Common mistakes

- Citing a source you found via a summary, without opening it.
- Averaging two contradictory sources into a wrong middle answer.
- Treating popularity (stars, upvotes) as correctness.
