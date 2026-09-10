---
name: researcher/technical-research
description: Answer a specific technical question with sourced, version-correct findings and a stated confidence.
agents: [researcher, analyst, builder]
domains: [research]
triggers: [research, how does, best practice, which library, compare, investigate, api]
dependencies: [shared/evidence]
conflicts: []
priority: 7
version: 1.0.0
---

# Technical research

## What it is

Bounded investigation that ends with a decision, not a survey.

## How to use it

1. **Write the question so it has an answer.** "Should we use X?" becomes "Does X support
   streaming responses in the version we have installed, and at what cost in bundle size?"
2. **Check the installed version first.** `cat package.json`, `pip show <pkg>`,
   `cargo tree`. Most wrong answers about libraries are answers about a different version.
3. **Go to the source in this order:** this repo → the installed package's own code →
   official docs for that exact version → release notes/changelog → issues → the web.
4. **Verify locally when it is cheap.** A ten-line script that proves the API behaves as
   documented is worth more than three corroborating blog posts.
5. **Stop when the question is answered.** Additional reading past the decision point is
   procrastination with a research shape.

## Reporting

For each finding: claim, source (with version), whether you verified it locally,
confidence, and what would change your answer. End with a single recommendation and the
strongest argument against it.

## Common mistakes

- Answering from training memory about a fast-moving library. Check.
- Comparing options on features nobody asked for.
- Reporting "X is popular" as a technical argument.
- Missing that the project already depends on something that solves this.

## Example

Question: "Can we do server-sent events with the installed HTTP client?"
Checked: `package.json` → `axios@1.6`. Axios' XHR adapter does not stream in the browser;
`fetch` does natively. Verified with a six-line script against a local SSE endpoint.
Recommendation: use `fetch` + `ReadableStream` (already available, zero new dependencies).
Against: no automatic retry — needs ~15 lines of reconnect logic.
