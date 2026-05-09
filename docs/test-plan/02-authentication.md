# Section 2 — Authentication

> Mirrors `docs/user-guide.md` §2.

Last aligned with code: 2026-05-09.

## Current implementation map

- Frontend sign-in form: `frontend/projects/the-upper-room/src/app/auth/sign-in/`
- Frontend PKCE flow: `pkce-auth-provider.ts`, `pkce.service.ts`, `auth-callback/auth-callback.ts`
- Backend auth endpoints: `backend/src/TheUpperRoom.Api/Auth/AuthController.cs`
- Token issuance: `backend/src/TheUpperRoom.Api/Auth/TokenService.cs`
- Current-user claim reader: `backend/src/TheUpperRoom.Api/Auth/CurrentUser.cs`
- Runtime users: `backend/src/TheUpperRoom.Infrastructure/Users/UsersDbContext.cs`

The UI submit path starts PKCE and redirects to `/__idp/authorize`. The direct `POST /api/v1/auth/sign-in` endpoint is currently only a credential-failure/rate-limit endpoint. The `/auth/exchange` endpoint validates a provided PKCE challenge and issues a JWT plus refresh cookie, but currently issues the JWT subject as `anonymous`; protected feature APIs require a seeded user id such as `admin`, `lead`, `member`, or `guest`.

Sign-up, invitation lookup, verify-email, and reset-password UI screens exist. Their backend endpoints are not currently implemented in `AuthController`; tests for those flows should mark backend integration as blocked unless the endpoint is stubbed by the test harness.

## Pre-conditions

- Backend and frontend running per `00-overview.md`.
- Browser storage cleared between auth sub-flows where noted.
- For API-level authorized requests, use a bearer token issued for one of the seeded user ids.

## Tests

### TC-2.1 — Sign-in form renders with correct fields and labels

**Steps**

1. Navigate to `/sign-in`.

**Verification**

- `data-testid="sign-in-card"` form renders.
- Heading is **"Sign in"**.
- Email field is labelled **"Email"** with `testId="sign-in-email"`.
- Password field is labelled **"Password"** with `testId="sign-in-password"` and `toggleTestId="sign-in-toggle-visibility"`.
- Submit button is **"Sign in"** with `testId="sign-in-submit"`.
- Links route to `/forgot-password` and `/sign-up`.
- Initial render makes no auth API call.

**Pass criteria**: labels, controls, links, and form accessibility match the template.

**Severity if failing**: High.

---

### TC-2.2 — Sign-in submit starts PKCE authorization

**Steps**

1. Route or stub `**/__idp/authorize**` so the browser does not leave the test.
2. On `/sign-in`, type any email/password.
3. Click **Sign in**.

**Verification**

- `PkceAuthProvider.signIn()` calls `PkceService.beginSignIn()`.
- Session storage contains transient PKCE `pkce.verifier`, `pkce.state`, and `pkce.nonce` values before redirect.
- Redirect URL is `/__idp/authorize` with `response_type=code`, `client_id=the-upper-room`, `redirect_uri=<origin>/auth/callback`, `code_challenge_method=S256`, `code_challenge`, `state`, and `nonce`.
- No password is sent to `/api/v1/auth/sign-in` from the UI path.

**Pass criteria**: submit starts PKCE and redirects to the IdP authorize URL with the required parameters.

**Severity if failing**: Critical.

---

### TC-2.3 — Auth callback exchanges code and stores token

**Steps**

1. In the browser, seed `sessionStorage.pkce.state` and `sessionStorage.pkce.verifier`.
2. Stub `POST /api/v1/auth/exchange` to return `{ "accessToken": "real-access-token" }`.
3. Navigate to `/auth/callback?code=auth-code-123&state=<matching-state>`.

**Verification**

- Callback consumes the stored verifier/state.
- Request body contains `code` and `codeVerifier`.
- Access token is stored through `AccessTokenStore`.
- Browser navigates to `/dashboard`.
- No JWT-like access token is written to `localStorage`.

**Backend note**

The live backend exchange contract also expects `expectedChallenge`; the current frontend callback does not send it. Use a route stub for this UI test or test the backend exchange directly with `code`, `codeVerifier`, and `expectedChallenge`.

**Pass criteria**: callback success path stores token in memory and lands on `/dashboard` when the exchange is stubbed successfully.

**Severity if failing**: Critical.

---

### TC-2.4 — Auth callback rejects missing or mismatched state

**Steps**

1. Seed `sessionStorage.pkce.state` with `expected`.
2. Navigate to `/auth/callback?code=auth-code&state=wrong`.

**Verification**

- Snackbar shows **"Sign-in failed. Please try again."**
- Browser returns to `/sign-in`.
- No exchange request is made.

**Pass criteria**: state mismatch cannot exchange a code.

**Severity if failing**: Critical.

---

### TC-2.5 — Direct sign-in rate limit: 5 attempts returns 429

**Steps**

1. POST five times to `/api/v1/auth/sign-in` with the same email.

**Verification**

- Attempts 1-4 return `401` with `{ "code": "auth.invalid_credentials" }`.
- Attempt 5 returns `429`, body `{ "error": "rate_limit_exceeded" }`, and header `Retry-After: 1800`.
- The bucket is an in-memory dictionary in `AuthController`; restart the API to reset it.

**Pass criteria**: 5th attempt is rate-limited.

**Severity if failing**: Critical.

---

### TC-2.6 — Eye toggle reveals password

**Steps**

1. Type a password on `/sign-in`.
2. Click `data-testid="sign-in-toggle-visibility"`.

**Verification**

- Input type flips from `password` to `text`.
- Clicking again restores `password`.

**Pass criteria**: toggle works both ways.

**Severity if failing**: Medium.

---

### TC-2.7 — Sign-up form renders with correct fields

**Steps**

1. Navigate to `/sign-up`.

**Verification**

- Heading is **"Create your account"**.
- Email field has `testId="sign-up-email"`.
- Password field has `testId="sign-up-password"` and shows `<tar-password-strength>`.
- City field has `testId="sign-up-city"`.
- Terms checkbox has `testId="sign-up-terms"`.
- Submit button has `testId="sign-up-submit"` and is disabled until the computed `canSubmit()` rules are satisfied.

**State/API verification**

- `POST /api/v1/auth/sign-up` is not implemented by the current backend. A real integration run should file/block this as backend-missing unless the endpoint is intentionally stubbed.

**Pass criteria**: form UI and client-side enablement match current code.

**Severity if failing**: High.

---

### TC-2.8 — Password strength evaluation

**Steps**

1. On `/sign-up`, enter password samples and observe the meter.

| Input | Expected label |
| --- | --- |
| `abc` | **"Weak"** |
| `Hello123!` | **"Okay"** |
| `Password!23456` | **"Strong"** |

**Verification**

- The password strength component renders five bars.
- Labels and filled bar colors follow `evaluatePassword(...)` from the components library.

**Pass criteria**: weak/okay/strong samples evaluate as expected.

**Severity if failing**: Medium.

---

### TC-2.9 — Accept-invitation route pre-fills email and city read-only

**Steps**

1. Navigate to `/invitations/accept?token=<token>`.
2. Stub `GET /api/v1/invitations?token=<token>` to return `{ "email": "invited@example.com", "city": "Toronto" }`.

**Verification**

- Route uses the `SignUp` component.
- Email and city fields are populated from the response.
- Email and city fields are readonly when `fromInvitation()` is true.
- Duplicate-email sign-in link is hidden in invitation mode.

**State/API verification**

- `GET /api/v1/invitations` is not currently implemented by the backend; use a UI route stub or mark backend integration blocked.

**Pass criteria**: invitation UI branch reflects the fetched email/city.

**Severity if failing**: High.

---

### TC-2.10 — Expired invitation screen

**Steps**

1. Navigate to `/invitations/accept?token=<expired-token>`.
2. Stub the invitation lookup to fail.

**Verification**

- Expired branch renders `data-testid="invitation-expired"`.
- Text includes **"This invitation has expired."**
- Link `data-testid="invitation-request-new"` routes to `/sign-in`.

**Pass criteria**: invalid invitation renders the expired branch.

**Severity if failing**: Medium.

---

### TC-2.11 — Forgot-password page renders and submits

**Steps**

1. Navigate to `/forgot-password`.
2. Enter an email and submit.

**Verification**

- Email field has `data-testid="forgot-email"`.
- Submit button has `data-testid="forgot-submit"` and text **"Send reset link"**.
- `POST /api/v1/auth/forgot-password` returns `204 No Content` for the first three attempts.
- UI shows the generic sent confirmation even if the request fails, because errors are caught and converted to success display.

**Pass criteria**: confirmation appears and the first backend call returns 204.

**Severity if failing**: High.

---

### TC-2.12 — Forgot-password rate limit: 3 attempts/hour returns 429

**Steps**

1. POST four times to `/api/v1/auth/forgot-password` with the same email.

**Verification**

- Attempts 1-3 return `204 No Content`.
- Attempt 4 returns `429` with `{ "error": "rate_limit_exceeded" }`.
- Bucket is in-memory in `AuthController`.

**Pass criteria**: 4th call returns 429.

**Severity if failing**: Critical.

---

### TC-2.13 — Reset-password page

**Steps**

1. Navigate to `/reset-password?token=valid`.

**Verification**

- Heading is **"Reset password"**.
- New password field has `data-testid="reset-new-password"`.
- Confirm password field has `data-testid="reset-confirm-password"`.
- Submit button has `data-testid="reset-submit"`.

**State/API verification**

- `POST /api/v1/auth/reset-password` is not currently implemented by the backend; mark backend integration blocked unless stubbed.

**Pass criteria**: reset form renders and submits the documented body when stubbed.

**Severity if failing**: High.

---

### TC-2.14 — Reset-password mismatch shows confirm error

**Steps**

1. Enter different values in **New password** and **Confirm password**.
2. Click **Reset password**.

**Verification**

- Confirm field shows **"Passwords do not match."**
- No backend request is made.

**Pass criteria**: client-side mismatch guard blocks submit.

**Severity if failing**: High.

---

### TC-2.15 — Sign-out from avatar menu

**Steps**

1. Enter the app shell with a valid access token.
2. Click `data-testid="avatar-trigger"`.
3. Click `data-testid="avatar-menu-sign-out"`.

**Verification**

- Avatar menu uses `role="menu"` and contains **"Sign out"**.
- Frontend calls the sign-out service.
- Backend endpoint is `POST /api/v1/auth/sign-out`, guarded by `[RequireXsrf]`.
- Refresh cookie `tar.refresh` is deleted from path `/api/v1/auth`.

**Pass criteria**: sign-out closes the menu, clears refresh cookie state, and returns to a public route.

**Severity if failing**: Critical.
