---
name: builder/performance
description: Measure before optimising, fix the actual bottleneck, and prove the improvement with numbers.
agents: [builder, reviewer, repairer]
domains: [performance, frontend, backend]
triggers: [slow, performance, optimize, latency, bundle size, memory, profil, n+1, cache]
dependencies: [shared/evidence]
conflicts: []
priority: 7
version: 1.0.0
---

# Performance

## The rule

No optimisation without a measurement. A change that makes code harder to read and saves
nothing measurable is a net loss.

## Method

1. **Define the metric and the target.** "p95 endpoint latency under 200ms", "LCP under
   2.5s", "the report finishes in under a minute". Vague speed goals never terminate.
2. **Measure the current value** with a repeatable command. Record it.
3. **Profile to find where the time goes** — do not guess. Use the platform's profiler
   (browser Performance panel, `cProfile`/`py-spy`, `pprof`, `EXPLAIN ANALYZE`).
4. **Fix the top item only**, then re-measure. Bottlenecks move; batched "optimisations"
   hide which one worked.
5. **Report before → after** with the command that produced both.

## The usual suspects, in the order they usually matter

**Backend:** N+1 queries · a missing index on a filtered column · work done per-request
that could be cached or precomputed · serialising a whole table into JSON · blocking I/O
inside a loop · a synchronous external call on the request path.

**Frontend:** oversized unoptimised images · a render-blocking bundle · re-rendering a
large tree on every keystroke · a list without virtualisation · layout thrash from reading
and writing DOM geometry in a loop · a heavy dependency imported for one function.

## Caching rules

Cache only after measuring, and answer three questions first: what invalidates it, what is
the worst staleness a user can see, and what happens on a cold cache. An unanswered
invalidation question means the cache will produce a correctness bug, not a speed win.

## Common mistakes

- Micro-optimising a loop that runs 10 times while a 400ms query sits above it.
- Adding `memo` everywhere, increasing memory and complexity for no measured gain.
- Benchmarking in development mode, or once, without warm-up.
- Confusing throughput with latency, or average with p95.

## Verification

Re-run the exact measurement command from step 2. Include both numbers in the report. If
the improvement is under noise, revert the change.
