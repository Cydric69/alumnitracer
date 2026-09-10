---
name: repairer/failure-analysis
description: Turn a production or CI failure into a diagnosis - logs, traces, timing, and the state you cannot reproduce locally.
agents: [repairer]
domains: [debugging, reliability]
triggers: [production error, incident, only in ci, cannot reproduce, intermittent, flaky, timeout, 500]
dependencies: [tester/failure-analysis]
conflicts: []
priority: 8
version: 1.0.0
---

# Failure analysis (repairer)

## When you cannot reproduce it

That is normal for production failures. Work from evidence instead:

1. **Collect**: the exact error and stack, the request id, the timestamp, the input, the
   user/tenant, the deploy version, and what else was happening at that moment.
2. **Look for the correlation**: does it affect one tenant, one region, one browser, one
   data shape, one time of day? The correlation usually names the cause.
3. **Reconstruct the state**, not the environment. Take the actual input from the log and
   run it locally. Most "unreproducible" bugs are reproducible with the real payload.

## The intermittent-failure shortlist

Ordered by how often it is actually the cause:

1. Concurrency — two things touching the same state (request + job, two tabs, retry).
2. Ordering — code that assumed a sequence that is not guaranteed.
3. Time — DST, timezone, expiry exactly at a boundary, a clock skew between services.
4. Data — one row with a null, an empty array, an unusual character, an enormous value.
5. Resource limits — memory, connections, file handles, rate limits under load.
6. Caching — a stale entry, a cold cache path never exercised in tests.
7. Network — a timeout, a partial response, a retry that duplicated an effect.

## Timeouts and slowness

A timeout is a symptom with a location: find whether the wait is CPU, a query, a lock, or an
external call. Add timing around each phase before theorising. A timeout "fixed" by raising
the limit will return under load.

## Logging you need next time

When the evidence was insufficient, part of the fix is better instrumentation: log the
request id, the input identifiers (not the payload, not secrets), the branch taken, and the
duration of each external call. Say explicitly in the report what you added and why.

## Report

Symptom, correlation found, mechanism (or the ranked hypotheses if unresolved), the fix or
the mitigation, and how you will know if it recurs.
