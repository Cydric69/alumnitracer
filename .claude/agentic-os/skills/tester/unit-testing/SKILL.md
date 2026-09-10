---
name: tester/unit-testing
description: Fast, isolated tests of single behaviours - structure, assertions, and the discipline that keeps them meaningful.
agents: [tester, builder]
domains: [testing]
triggers: [unit test, pytest, jest, vitest, assertion, mock, stub, test function]
dependencies: [tester/test-design]
conflicts: []
priority: 7
version: 1.0.0
---

# Unit testing

## Shape

```
def test_<behaviour>_<condition>():
    # arrange - the minimum setup, explicit about what matters
    # act     - one call
    # assert  - one logical outcome, with a message that names the expectation
```

Fast (milliseconds), isolated (no shared state, no order dependence), deterministic (no
real clock, no real randomness, no network).

## Assertions

- Assert the value, not the type. `assert result == 42`, not `assert isinstance(result, int)`.
- Assert the whole shape when it is small: `assert parse(x) == {"a": 1, "b": 2}` catches
  fields you forgot; three separate field assertions do not.
- Include the case in the failure output — most runners print the diff if you compare
  values directly rather than wrapping in `assert bool(...)`.
- Test error paths with the specific exception type and message pattern, not a bare `raises`.

## Isolation

Reset module-level state between tests. Freeze the clock rather than sleeping. Seed
randomness. If a test needs the filesystem, use the runner's tmp fixture and never a
hard-coded path.

## Parameterisation

Table-driven tests are the right tool for the same behaviour across many inputs
(`@pytest.mark.parametrize`, `test.each`). Name each case so the failure output identifies
it. Do not parameterise across *different* behaviours — that hides intent.

## Common mistakes

- One test with fifteen assertions; the first failure hides the other fourteen.
- `assert result` on a truthy value that would also pass for `"error"`.
- Tests that call a private function directly, freezing an implementation detail.
- Copy-pasted tests where the assertion was not updated (they pass, and prove nothing).
- Sleeping to wait for async work.

## Verification

Run the single test in isolation and as part of the suite — both must pass. Then break the
code it covers and confirm it fails with a message you would understand at 3am.
