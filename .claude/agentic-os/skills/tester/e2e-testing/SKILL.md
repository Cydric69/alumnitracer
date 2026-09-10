---
name: tester/e2e-testing
description: Few, deterministic, user-journey tests through the real stack - and the discipline to keep them from becoming a flaky tax.
agents: [tester]
domains: [testing, frontend]
triggers: [e2e, end-to-end, playwright, cypress, browser test, user journey, smoke test]
dependencies: [tester/test-design]
conflicts: []
priority: 6
version: 1.0.0
---

# End-to-end testing

## Scope

Cover the journeys whose failure is unacceptable: sign-up/sign-in, the core create flow,
checkout or the primary conversion, and one smoke path that proves the app boots and
renders. Three to eight tests for most products. Everything else belongs a level down.

## Determinism rules

1. **No fixed waits.** Use the framework's auto-waiting assertions
   (`expect(locator).toBeVisible()`); never `waitForTimeout`.
2. **Query by role and accessible name**, never by CSS class or nth-child. Structure changes;
   roles do not.
3. **Own your data.** Each test creates the account/records it needs via API or fixture, and
   tears them down. Never rely on state left by a previous run.
4. **Control the environment**: fixed clock where dates matter, seeded randomness, disabled
   animations, a stable viewport, and third-party scripts stubbed or blocked.
5. **One journey per test.** A test that does six things fails ambiguously and slowly.

## When a test flakes

A flaky e2e test is a defect in the test or a race in the app — both need fixing. Never
"fix" it with a retry count or a longer timeout as the first move; find out what is racing.
If it cannot be made deterministic quickly, delete it and cover the behaviour lower down.
A permanently-red or ignored suite is worse than no suite.

## Debug artefacts

Configure trace, video, and screenshot on failure. An e2e failure without artefacts costs
more to diagnose than the test saved.

## CI

Run against a production-like build, not the dev server. Keep the whole suite under a few
minutes; parallelise by file. Fail the build on failure — a suite that is allowed to fail
is documentation, not a test.

## Common mistakes

- Testing every form validation message through the browser.
- Logging in through the UI in every test instead of seeding a session.
- Asserting on text that the product team changes weekly.
- Sharing one account across parallel workers.
