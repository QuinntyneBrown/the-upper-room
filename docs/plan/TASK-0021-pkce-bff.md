---
id: TASK-0021
title: PKCE flow + BFF token exchange
status: Draft
phase: A
depends_on: [TASK-0020]
traces_to: [L2-015]
estimated_context: large
---

# TASK-0021: PKCE + BFF

## Goal
Replace the mock auth with the OAuth 2.0 Authorization Code + PKCE flow, fronted by a backend-for-frontend (BFF) `POST /api/v1/auth/exchange` that owns the refresh token in an `HttpOnly` `SameSite=Strict` cookie. Access token lives only in memory.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/pkce.spec.ts`

**Page Object:** `pages/SignInPage.ts` (already exists), `pages/AuthCallbackPage.ts`.

**Scenarios:**
1. **Authorize redirect** — Clicking sign-in submits credentials → server returns redirect to IdP authorize URL with `response_type=code`, `code_challenge_method=S256`, `state`, `nonce`, `code_challenge` parameters all present (verified by inspecting `Location`).
2. **Callback success** — `/auth/callback?code=...&state=<matching>` triggers `POST /api/v1/auth/exchange`, server sets refresh-token cookie, frontend caches access in memory.
3. **State mismatch** — Returning with mismatched state shows error snackbar "Sign-in failed. Please try again." and redirects to `/sign-in`.
4. **No tokens in storage** — `localStorage` and `sessionStorage` contain no key whose value matches `eyJ...` (JWT-like).

### Backend Integration
- `TheUpperRoom.Api.Tests/Auth/ExchangeEndpointTests.cs` — verifier hash mismatch returns 400; proper exchange returns access token + sets refresh cookie with `HttpOnly`, `Secure`, `SameSite=Strict`.

## Implementation Outline
- `Application/Auth/Commands/ExchangeAuthorizationCode.cs` (MediatR).
- `Infrastructure/Auth/PkceVerifier.cs`.
- IdP can be a self-hosted IdentityServer or Duende dev tenant; document choice in ADR.

## Definition of Done
- [ ] All scenarios green.
- [ ] No tokens in client storage.
- [ ] Cookie attributes correct.
