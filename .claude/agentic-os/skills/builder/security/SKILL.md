---
name: builder/security
description: Build without the standard vulnerability classes - injection, broken authorization, secret exposure, unsafe deserialization, and dependency risk.
agents: [builder, reviewer, repairer]
domains: [security, backend, frontend]
triggers: [security, auth, authoriz, token, password, injection, xss, csrf, secret, encrypt, permission, upload]
dependencies: [shared/evidence]
conflicts: []
priority: 10
version: 1.0.0
---

# Security

## Trust boundaries

Untrusted: request bodies, query params, headers, cookies, file uploads, webhook payloads,
third-party API responses, anything from the database that a user once wrote, and any
filename or path a user influenced. Validate at the boundary; keep the parsed value inside.

## The classes that actually bite

**Injection.** Parameterised queries only. Never build SQL, shell commands, or file paths by
concatenation. For shell, pass an argument list, never a string. For paths, resolve and
check that the result is still inside the intended directory.

**Broken authorization.** Authentication says who; authorization says what they may touch.
Check ownership on the *resource*, at the data-access layer, on every operation — including
read. IDs in URLs are user-controlled: `GET /invoices/123` must verify 123 belongs to the
caller. This is the most common real-world vulnerability and the easiest to miss in review.

**XSS.** Escape by default; frameworks do this until you use `dangerouslySetInnerHTML`,
`v-html`, or `innerHTML`. If you must render HTML, sanitise with a maintained library and
an allowlist. Never build a URL from user input without checking the scheme
(`javascript:` is a valid-looking href).

**CSRF.** State-changing requests need a token or `SameSite=Lax/Strict` cookies. A JSON API
with cookie auth and no CSRF protection is exploitable.

**Secrets.** Never in source, never in a client bundle, never in a log line, never in an
error returned to the user. Read from the environment. `.env` stays out of git — check
`.gitignore` before creating one. If a secret was ever committed, it is compromised: say so
and tell the user to rotate it.

**Unsafe deserialization.** No `pickle`, `yaml.load`, `eval`, or `Function()` on untrusted
input. Use `yaml.safe_load`, `JSON.parse`, and a schema.

**File uploads.** Validate type by content, not extension. Cap size. Store outside the web
root with a generated name. Never execute or `include` an uploaded file.

**Timing and enumeration.** Compare secrets with a constant-time function. Do not reveal
whether an account exists through different messages or response times.

## Crypto

Use the platform's library. Argon2/bcrypt/scrypt for passwords, never a raw hash. A CSPRNG
for tokens (`secrets`, `crypto.randomUUID`). Never invent a scheme, never reuse an IV,
never roll your own JWT verification — and always verify `alg`, expiry, and audience.

## Dependencies

Prefer none. If one is needed: check it is maintained, check the transitive count, and pin
it. Run the ecosystem's audit command and report real findings (not the noise).

## Verification

For every change: what is the untrusted input, where is it validated, what is the blast
radius if the validation is wrong? Test the negative cases explicitly — wrong user, missing
token, oversized payload, path traversal string, script tag in a name field.

## Reporting

Describe vulnerability classes and fixes. Do not write a working exploit, and never include
a step-by-step extraction path in a report.
