# BUG-002 — `POST /api/v1/auth/sign-in` always returns 401

**Severity**: Critical
**Component**: backend
**Found in test**: TC-2.1 (Signing in)
**User-guide refs**: §2.1
**Found**: 2026-05-09

## Description

`AuthController.SignIn` has no successful code path. It does only rate-limit bookkeeping, then unconditionally returns `Unauthorized`. No credential store is consulted, no password hash is verified, no token is issued.

## Reproduction

```bash
curl -i -X POST http://localhost:5255/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"any@example.com","password":"anything"}'
# → HTTP/1.1 401 Unauthorized
# → {"code":"auth.invalid_credentials"}
```

This is true for *every* email/password combination, including the credentials previously documented in the user guide.

## Expected

Per user guide §2.1: "On success you are taken to the **Dashboard**." That implies the endpoint accepts at least one valid credential pair, verifies it against a user store, and returns a session/access token.

## Actual

`backend/src/TheUpperRoom.Api/Auth/AuthController.cs:24-46` — every code path through `SignIn` ends at:

```csharp
return Unauthorized(new { code = "auth.invalid_credentials" });
```

The injected `ITokenService _tokens` (constructor at line 20) is unused inside `SignIn`.

## Side effects

- Sign-in flow described in user guide §2.1 is non-functional via this endpoint.
- The frontend's mock auth provider (`MockAuthProvider`) was removed by `TASK-0212` (commit `9d9a431`), so there is no longer a frontend-side workaround either.
- The only path that issues a real JWT is `POST /api/v1/auth/exchange` — but see BUG-003.

## Suggested fix

Implement credential verification: look up the user by email, verify the hashed password (Argon2id or PBKDF2), and on success issue an access token via `_tokens.IssueAccessToken(userId)` and a refresh-token cookie like `Exchange` already does.
