---
name: tester/edge-case-analysis
description: Systematically enumerate the inputs and states that break code - boundaries, emptiness, scale, concurrency, and hostility.
agents: [tester, builder, reviewer, repairer]
domains: [testing, quality]
triggers: [edge case, boundary, corner case, what if, empty, null, overflow, concurrent, unicode]
dependencies: []
conflicts: []
priority: 8
version: 1.0.0
---

# Edge-case analysis

## The checklist

Run it against every input and every state the code touches.

**Quantity**: zero · one · two · many · the maximum · one past the maximum · negative ·
exactly at the boundary (`<` vs `<=` is the most common off-by-one in production).

**Emptiness and absence**: empty string · whitespace-only · empty list · empty object ·
`null`/`None`/`undefined` · missing key · missing optional argument · a field that exists
but is `false`/`0`/`""` (falsy-vs-missing is a classic bug).

**Text**: unicode · emoji (multi-codepoint, so `len()` lies) · right-to-left · combining
accents · a name with an apostrophe · a 10,000-character string · leading/trailing space ·
newlines · HTML and SQL metacharacters · a string that looks like a number.

**Numbers**: 0 · negative · float precision (`0.1 + 0.2`) · very large · `NaN`/`Infinity` ·
integer division · rounding at `.5` · currency in the wrong unit.

**Time**: timezone boundaries · DST transitions (a local time that occurs twice, or never) ·
leap day · month-end arithmetic · a client clock ahead of the server · duration across
midnight · an expiry exactly now.

**Collections**: duplicates · unsorted input · self-reference · nested to depth · mutation
while iterating · order not guaranteed.

**State and concurrency**: two requests at once · retry of a request that already succeeded ·
the same user in two tabs · a job running twice · a partial write followed by a crash ·
an out-of-order webhook.

**Environment**: network failure mid-request · timeout · slow disk · permission denied ·
the file exists already · disk full · a dependency returning a 500 with an HTML body.

**Hostility**: an id belonging to another user · a path with `../` · an oversized payload ·
a script tag in a display name · a negative quantity in a cart.

## How to use it

Do not test all of them. Walk the list, note which apply to *this* code, and pick the ones
whose failure would be silent or expensive. Write those. Record the ones you consciously
skipped — that list is useful to a reviewer.

## The question that finds the rest

"What is the worst input a real user could plausibly produce?" Then: "what is the worst one
an attacker could?"
