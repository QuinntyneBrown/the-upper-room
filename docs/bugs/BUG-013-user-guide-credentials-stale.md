# BUG-013 — User-guide credentials block is stale (mock auth provider was removed)

**Severity**: High
**Component**: docs (`docs/user-guide.md`)
**Found in test**: TC-2.1 (Sign in)
**Found**: 2026-05-09

## Description

`docs/user-guide.md` §2.1 lists local-development credentials:

```
**Email:** test@example.com
**Password:** Password!23456
```

These were valid when `MockAuthProvider` accepted them client-side. `MockAuthProvider` was removed earlier today by `TASK-0212` (commit `9d9a431` — "TASK-0212: remove MockAuthProvider and localhost redirectUri fallback"). With the mock provider gone, these credentials no longer authenticate the user anywhere — and the backend's `/api/v1/auth/sign-in` endpoint cannot authenticate them either (see BUG-002).

## Reproduction

1. Open the running app at `http://localhost:4300/sign-in`.
2. Enter `test@example.com` / `Password!23456`.
3. Click **Sign in**.
4. Observe: `auth.invalid_credentials` error; user is not signed in.

## Expected

The user guide should document credentials that actually work in the running development build, or document the OIDC / IdP redirect flow used in development.

## Actual

The credentials in §2.1 are stale and misleading. They were committed by me earlier in this session (commit `380ed6c`) before `TASK-0212` landed — they were valid at the time of writing but are not valid now.

## Suggested fix

Wait until BUG-001/002/003 are resolved (or a documented dev sign-in path is restored), then update §2.1 with the correct credentials or the correct flow. In the interim, replace the credentials block with:

> **Local sign-in is currently broken** (see `docs/bugs/BUG-002-sign-in-always-401.md`). Use the test-only token issuance path described in `backend/tests/TheUpperRoom.Api.Tests/TestAuthExtensions.cs` if you need to exercise authenticated APIs.
