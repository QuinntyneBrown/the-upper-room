# BUG-001 — Sign-up, password-reset, and email-verification endpoints return 404

**Severity**: Critical
**Component**: backend
**Found in test**: TC-2.2 (Sign up), TC-2.4 (Forgot password — reset step), implicitly any "verify your email" flow
**User-guide refs**: §2.2, §2.3, §2.4
**Found**: 2026-05-09

## Description

The frontend posts to four authentication endpoints that don't exist in the backend. Every call from the sign-up, reset-password, or email-verification screens returns `404 Not Found`, so the entire account-creation and password-recovery story is unreachable.

## Reproduction

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"X"}' http://localhost:5255/api/v1/auth/sign-up
# → 404

curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"token":"x","newPassword":"x"}' http://localhost:5255/api/v1/auth/reset-password
# → 404

curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"token":"x"}' http://localhost:5255/api/v1/auth/verify-email
# → 404

curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{}' http://localhost:5255/api/v1/auth/verify-email/resend
# → 404
```

## Expected

User guide §2.2 promises an end-to-end sign-up flow ending in an email verification link. §2.4 promises a Forgot-password → email → Reset-password flow. The backend should expose:

- `POST /api/v1/auth/sign-up`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/verify-email/resend`

## Actual

Only the routes declared on `AuthController` exist (`backend/src/TheUpperRoom.Api/Auth/AuthController.cs:7`):

- `POST /api/v1/auth/sign-in`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/sign-out`
- `POST /api/v1/auth/exchange`

The four missing endpoints are called from:

- `frontend/projects/the-upper-room/src/app/auth/sign-up/sign-up.ts` — `POST /api/v1/auth/sign-up`
- `frontend/projects/the-upper-room/src/app/auth/reset-password/reset-password.ts` — `POST /api/v1/auth/reset-password`
- `frontend/projects/the-upper-room/src/app/auth/verify-email/verify-email.ts` — `POST /api/v1/auth/verify-email` and `.../resend`

## Suggested fix

Add the four endpoints to `AuthController` (or a dedicated controller). Each needs persistence: a Users table with hashed passwords, a verification-token table with TTLs, and email dispatch wired to the existing `EmailDispatcher`.
