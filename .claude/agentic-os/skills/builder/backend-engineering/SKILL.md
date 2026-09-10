---
name: builder/backend-engineering
description: Server, API, and data-layer changes - contracts, validation, transactions, idempotency, and failure behaviour.
agents: [builder, reviewer, repairer]
domains: [backend, api, data]
triggers: [api, endpoint, server, database, query, migration, backend, route, handler, sql, orm, queue]
dependencies: [shared/evidence, builder/security]
conflicts: []
priority: 8
version: 1.0.0
---

# Backend engineering

## When it applies

Anything behind the network boundary: HTTP handlers, jobs, queues, schema, data access.

## Non-negotiables

1. **Validate at the boundary.** Parse untrusted input into a typed shape at the edge
   (zod/pydantic/serde/struct tags) and work with the parsed value inside. Never trust a
   client-supplied id, limit, sort field, or role.
2. **Parameterised queries only.** String-built SQL is a defect regardless of the input's
   apparent origin.
3. **Transactions around multi-statement invariants.** A write that must not half-apply is
   in a transaction, and the transaction does not contain network calls.
4. **Explicit error semantics.** Every handler returns a defined shape for 4xx and 5xx.
   Do not leak stack traces, SQL, or internal ids to the client.
5. **Idempotency for anything retried**: webhooks, jobs, payment operations. Use a natural
   key or an idempotency token, and make the second call a no-op, not a duplicate.
6. **Pagination has a hard cap.** `limit` is clamped server-side; unbounded list endpoints
   are outages waiting for a large tenant.

## Data layer

- Migrations are forward-only and reversible in effect: add column → backfill → switch reads
  → drop later. Never a destructive migration in the same deploy as the code that needs it.
- Index what you filter and sort on; check the query plan for anything on a hot path.
- N+1 queries are the default outcome of ORMs. Look for the loop; use the eager-load API.
- Store timestamps in UTC with timezone awareness; format at the edge.
- Money is integer minor units or decimal, never float.

## Failure behaviour

Timeouts on every outbound call. Retries only for idempotent operations, with backoff and
a cap. A dependency being down degrades one feature, not the whole request path. Log the
failure with enough context to find it (ids, not full payloads — and never secrets).

## Common mistakes

- Auth check in the route but not in the shared service the route calls (and other callers
  skip the route). Enforce authorization where the data is accessed.
- Returning the full ORM object, exposing fields the API never meant to publish.
- `SELECT *` into a response shape that then changes when a column is added.
- Doing work in a request that belongs in a job, and blocking the response on it.
- Reading config at import time so tests cannot override it.

## Verification

Exercise the endpoint with a real request (curl/httpie/test client): happy path, missing
field, wrong type, unauthorised, and oversized input. Check the query count and the plan
for the hot path.
