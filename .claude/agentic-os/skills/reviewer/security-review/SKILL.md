---
name: reviewer/security-review
description: Review a change for the vulnerability classes that actually ship - authorization, injection, secrets, and unsafe handling of untrusted input.
agents: [reviewer]
domains: [review, security]
triggers: [security review, vulnerability, exploit, auth check, injection, secrets, permissions, audit]
dependencies: [builder/security]
conflicts: []
priority: 10
version: 1.0.0
---

# Security review

## Scope trigger

Do a full pass whenever the diff touches: authentication, authorization, user input, file
paths, uploads, subprocess or shell, SQL or query building, serialization, templates,
redirects, cookies/sessions, crypto, secrets/config, CORS, or a dependency addition.

## The checklist

**Authorization** (the most commonly missed): every data access checks ownership or role,
at the data layer — not only in the route. Ask for each new query: whose data can this
return, and what stops it returning someone else's? IDs from the client are attacker-controlled.

**Injection**: no string-built SQL, shell, path, or template. Arguments passed as lists.
Paths resolved and confined. ORM `raw`/`literal` uses reviewed individually.

**Untrusted input**: validated at the boundary with a schema; length and type bounded;
never trusted after passing through the database.

**Output**: escaped by default; every `dangerouslySetInnerHTML`/`v-html`/`innerHTML`
justified and sanitised; URLs scheme-checked; no user content in a `Content-Disposition`
or header without encoding.

**Secrets**: nothing in source, bundle, log, error response, or test fixture. New `.env`
entries are gitignored. A committed secret is a rotate-now finding, reported as blocking.

**Sessions and tokens**: expiry checked, signature verified with a pinned algorithm,
audience checked, cookies `HttpOnly`+`Secure`+`SameSite`, logout invalidates server-side.

**Errors**: no stack traces, SQL, or internal identifiers returned to the client. No
different response for "user does not exist" vs "wrong password".

**Dependencies**: new package justified, maintained, pinned; transitive count noted.

## Reporting

Name the vulnerability class, the file:line, the impact ("any authenticated user can read
any other user's invoices"), and the fix. Do not include a working exploit or a
step-by-step extraction path. Blocking severity for anything exploitable by a normal user.

## Do not

Do not weaken a finding because the code "is internal only" or "will be behind a flag" —
say the mitigation exists and keep the finding.
