---
name: tester/integration-testing
description: Test the seams - real components talking to each other, real database, real serialization - where most production bugs actually live.
agents: [tester, builder]
domains: [testing, backend]
triggers: [integration test, api test, database test, test the endpoint, contract test, seam]
dependencies: [tester/test-design]
conflicts: []
priority: 8
version: 1.0.0
---

# Integration testing

## Why it matters most

Unit tests verify your assumptions about a component. Integration tests verify the
assumptions two components make about *each other* — the mismatched field name, the
timezone difference, the nullable column, the changed status code. That is where real
outages come from.

## Scope

One integration test should cover a meaningful path: HTTP request → handler → service →
database → response. Use the real database (a test instance or a container), real
serialization, and the framework's test client. Stub only genuinely external, paid, or
non-deterministic dependencies — and stub them at the HTTP boundary so the serialization is
still exercised.

## Data lifecycle

Each test creates its own data and cleans up, or runs inside a transaction that is rolled
back. Never depend on data another test created or on a seeded fixture that drifts. Never
point tests at a shared or production database — a guarded runtime will block it, and it
would be wrong anyway.

## What to assert

- The status code *and* the body shape.
- The persisted state (query it back), not only the response.
- The error responses: 400 for bad input, 401 unauthenticated, 403 unauthorised, 404
  missing, 409 conflict — each with the defined error shape.
- Authorization: the same request as a different user must fail. This single test catches
  the most common serious vulnerability class.
- Side effects: was the job enqueued, the email queued, the audit row written?

## Contract tests

Where two services meet, pin the contract with a test on both sides using the same fixture
payload. A shared example file that both consumer and provider test against catches drift
without a full integration environment.

## Common mistakes

- Mocking the database so the test proves only that mocks return what they were told to.
- Asserting the response but never checking what was written.
- Tests that pass because the endpoint returns 200 with an error body.
- Leaking state between tests, producing order-dependent flakes.
- Testing thirty variations at the integration level that belong in unit tests — keep the
  suite fast enough that people run it.
