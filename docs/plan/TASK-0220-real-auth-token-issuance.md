---
id: TASK-0220
title: Real auth token issuance in AuthController
status: Done
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0220: Real auth token issuance in AuthController

## Goal

Replace the hardcoded `"fake-access-token"` and `"fake-refresh-token"` values returned by `TheUpperRoom.Api/Auth/AuthController.cs` (lines 87 and 95) with real, signed tokens. Until this lands, every authenticated session in the system is using placeholder credentials.

## ATDD Process — REQUIRED

1. Write the failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest token-issuance flow that satisfies the tests.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Auth/AuthControllerTests.cs`

**Scenarios:**
1. Successful login returns a non-empty access token that is NOT the literal string `"fake-access-token"`.
2. Successful login sets a refresh-token cookie whose value is NOT the literal string `"fake-refresh-token"`.
3. Issued access token is parseable as a JWT and contains `sub`, `iat`, `exp` claims.
4. Issued access token's signature validates against the configured signing key.
5. Issuing two logins for different users returns two distinct access tokens.

### Playwright E2E

- Not required for this task (covered by sign-in e2e specs after token swap).

## Implementation Outline

- Add a `TokenService` that issues JWT access tokens (signed with HMAC-SHA256 by default) and opaque refresh tokens. Configure signing key via `JwtSettings:SigningKey` in `appsettings.json` (require non-empty in `Production`).
- Replace literal returns at lines 87 and 95 with calls into the new service.
- Issue tokens with reasonable expirations (access ~15 min, refresh ~7 days). Document any TODOs for future tightening as separate tasks rather than expanding this one.
- Add a `Production` startup guard: refuse to start if the signing key is missing.

## Definition of Done

- [ ] All listed integration tests pass.
- [ ] `dotnet build` and `dotnet test` green.
- [ ] `grep -rn "fake-access-token\|fake-refresh-token" backend/src` returns no matches.
- [ ] Production startup fails fast if `JwtSettings:SigningKey` is missing.
- [ ] Status updated to `Done`.

## Out of Scope

- Refresh-token rotation, revocation lists, mTLS, or full OAuth2 server implementation (file follow-ups if needed).
- Migration of existing session cookies (system has no production users yet).
