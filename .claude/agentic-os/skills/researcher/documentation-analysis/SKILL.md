---
name: researcher/documentation-analysis
description: Read documentation for what it actually guarantees - version scope, defaults, error behaviour, and the gaps between docs and code.
agents: [researcher, builder, analyst]
domains: [research]
triggers: [documentation, docs, readme, api reference, changelog, migration guide]
dependencies: []
conflicts: []
priority: 6
version: 1.0.0
---

# Documentation analysis

## What it is

Extracting the contract from documentation, and noticing where the documentation is
silent — silence is where bugs live.

## How to use it

1. **Pin the version.** Docs sites default to latest. Find the version selector, or read
   the docs shipped inside the installed package.
2. **Read in this order**: the signature, the parameter defaults, the return shape, the
   error/exception section, then the prose. Prose is the least reliable part.
3. **Hunt the silences**: What happens on empty input? On concurrent calls? Is the return
   value shared or copied? Is it sync or async? Is it retried? What is the timeout?
   Undocumented behaviour is not guaranteed behaviour — treat it as version-fragile.
4. **Read the changelog** between the version documented and the version installed.
   Deprecations and default changes hide there, not in the guide.
5. **Cross-check against the source.** For a small library, the source is the documentation.

## What to record

Signature and defaults, guarantees you may rely on, behaviour you observed but which is
undocumented (flag it), and the version everything applies to.

## Common mistakes

- Copying a code sample from a tutorial written for a major version behind.
- Treating a doc example's error handling as complete.
- Assuming a "beta"/"experimental" API is stable because it works today.
- Missing a peer-dependency requirement stated only in the install section.

## Verification

If a doc claim matters to the design, prove it with a five-line script before building
on it. Undocumented but verified beats documented but unverified.
