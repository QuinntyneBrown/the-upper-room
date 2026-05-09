# Section 2 — Authentication

> Mirrors `docs/user-guide.md` §2.

## Pre-conditions

- Backend running with the in-memory mock auth provider.
- Frontend at `http://localhost:4200`.
- Cleared cookies and `localStorage` for the host between sub-flows where noted.

## Tests

### TC-2.1 — Sign-in form renders with correct fields and labels

**Steps**

1. Navigate to `/sign-in` (or click **Sign in** from `/`).

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/auth/sign-in/sign-in.html:1`.
- Heading: `<h1 id="sign-in-title" class="sign-in__title">Sign in</h1>` (line 9).
- Email field: `<tar-text-field label="Email" type="email" autocomplete="email" testId="sign-in-email">` (line 11-20). Label visible: **"Email"**.
- Password field: `<tar-password-field label="Password" autocomplete="current-password" testId="sign-in-password" toggleTestId="sign-in-toggle-visibility">` (line 22-29). Label visible: **"Password"**.
- Eye toggle button rendered by `tar-password-field`, `data-testid="sign-in-toggle-visibility"`.
- Submit button: text **"Sign in"** (line 42), `tar-button variant="filled"`, full width (`[fullWidth]="true"`).
- Two links below: **"Forgot password?"** → `/forgot-password` (line 46), **"Create account"** → `/sign-up` (line 47).
- Form has `aria-labelledby="sign-in-title"` (line 7).
- Typescale: heading uses `--md-sys-typescale-headline-small` (24px/32px Roboto 400) per `_tokens.scss:115` — confirm via Computed.

**Behavior verification**

- No network calls on initial render.

**Database verification**: N/A.

**Pass criteria**: every label/placeholder/button exactly matches; both links route correctly.

**Severity if failing**: High.

---

### TC-2.2 — Sign-in success → redirect to dashboard

**Steps**

1. On `/sign-in`, type `test@example.com` and `Password!23456`.
2. Click **Sign in**.

**UI verification**

- Submit button briefly disables (`[disabled]="submitting()"`, `sign-in.html:40`).
- After success URL becomes `/dashboard` (per `sign-in.ts:36`, `router.navigateByUrl('/dashboard')`).

**Behavior verification**

- API: `POST /api/v1/auth/sign-in` body `{ "email": "test@example.com", "password": "Password!23456" }`. With the mock provider this returns success and the access-token store is populated.
- (Note: the live `AuthController.SignIn` in `backend/src/TheUpperRoom.Api/Auth/AuthController.cs:24-51` always returns `401` with `{ "code": "auth.invalid_credentials" }` because the mock auth provider on the frontend short-circuits — verify the success path through the frontend `AUTH_PROVIDER` injection at `frontend/projects/the-upper-room/src/app/auth/sign-in/sign-in.ts:15`.)

**Database verification**

- `AuditStore.Entries` (`backend/src/TheUpperRoom.Api/Audit/AuditStore.cs:6`) contains an entry with `EntityType="Session"`, `Action="Login"` only when going through `POST /api/v1/auth/exchange` (PKCE flow, `AuthController.cs:90`). For the mock-provider path, no audit row is written client-side; this is acceptable.

**Pass criteria**: lands on `/dashboard`; access token present in memory (verify `frontend/projects/the-upper-room/src/app/auth/access-token-store.ts`).

**Severity if failing**: Critical.

---

### TC-2.3 — Sign-in failure shows `auth.invalid_credentials` message

**Steps**

1. On `/sign-in`, type `wrong@example.com` and any password.
2. Click **Sign in**.

**UI verification**

- Inline error appears: `<p data-testid="sign-in-error-form" class="sign-in__form-error" role="alert">` (`sign-in.html:32`).
- Message text: **"The email or password is incorrect."** (mapped from `auth.invalid_credentials` via `frontend/projects/the-upper-room/src/app/interceptors/error-catalog.ts:5`).

**Behavior verification**

- API: `POST /api/v1/auth/sign-in` returns `401` body `{ "code": "auth.invalid_credentials" }` (`AuthController.cs:50`).
- `mapErrorToMessage(401, 'auth.invalid_credentials')` → "The email or password is incorrect." (`error-catalog.ts:34`).

**Database verification**: N/A (failed sign-in does not persist).

**Pass criteria**: exact message displays; user remains on `/sign-in`.

**Severity if failing**: High.

---

### TC-2.4 — Empty email shows "Email is required"

**Steps**

1. Leave email blank, type any password.
2. Click **Sign in**.

**UI verification**

- Email field error slot shows **"Email is required"** (`sign-in.ts:29`, `emailError.set('Email is required')`).
- Form-level error not shown.

**Behavior verification**: no API call.

**Pass criteria**: client-side guard fires before HTTP.

**Severity if failing**: Medium.

---

### TC-2.5 — Sign-in rate limit: 5 attempts → 429

**Steps**

1. POST 5 times in quick succession to `/api/v1/auth/sign-in` with `{"email":"x@example.com","password":"x"}` (e.g. via `curl` or DevTools fetch).

**Behavior verification**

- Attempts 1–4 return `401` with `{ "code": "auth.invalid_credentials" }`.
- Attempt 5 returns `429` with body `{ "error": "rate_limit_exceeded" }` and header `Retry-After: 1800` (`AuthController.cs:43-47`).
- Bucket logic in `AuthController.cs:103-116` — window 15 minutes, lock 30 minutes.
- Subsequent attempts within 30 min continue to return `429` (`IsLocked` check at `AuthController.cs:34-38`).

**UI verification (frontend rendition)**

- Frontend maps `429 → "Too many requests."` per `error-catalog.ts:18, 29` (no specific code = fallback by status).

**Database verification**: bucket is in-memory `_signInBuckets` dictionary (`AuthController.cs:12`). Restart API to reset.

**Pass criteria**: 5th attempt returns 429 with `Retry-After: 1800`.

**Severity if failing**: Critical (auth abuse).

---

### TC-2.6 — Eye toggle reveals password

**Steps**

1. On `/sign-in` type `Password!23456`.
2. Click the eye icon (`data-testid="sign-in-toggle-visibility"`).

**UI verification**

- Input `type` flips from `password` to `text`. Plaintext visible.
- Click again → back to `password`. Behavior implemented in `frontend/projects/components/src/lib/password-field/`.

**Pass criteria**: toggle works both ways.

**Severity if failing**: Medium.

---

### TC-2.7 — Sign-up form renders with correct fields

**Steps**

1. Navigate to `/sign-up`.

**UI verification**

- Heading: **"Create your account"** (`frontend/projects/the-upper-room/src/app/auth/sign-up/sign-up.html:12`).
- Email field: label **"Email"**, `data-testid="sign-up-email"` (line 15-25).
- Password field: label **"Password"**, autocomplete `new-password` (line 34-40).
- Password strength meter component `<tar-password-strength>` immediately under password (line 41).
- City field: label **"City"**, `data-testid="sign-up-city"` (line 44-50).
- Checkbox: text **"I accept the terms and privacy policy"**, `data-testid="sign-up-terms"` (line 52-58).
- Submit button: text **"Create account"**, `data-testid="sign-up-submit"` (line 60-68), disabled when `canSubmit()` is false.

**Pass criteria**: every field/label exactly matches.

**Severity if failing**: High.

---

### TC-2.8 — Password strength evaluation

**Steps**

1. On `/sign-up` enter password values and observe the strength meter (5 bars + label).

| Input | Expected score | Label | Bar color token |
| --- | --- | --- | --- |
| (empty) | 0 | (no label) | n/a |
| `abc` | 1 | **"Weak"** | `--md-sys-color-error` |
| `Password1` | 3 | **"Okay"** | `--md-sys-color-secondary` |
| `Password!23456` | 5 | **"Strong"** | `--md-sys-color-tertiary` |

(See evaluator and color logic in `frontend/projects/components/src/lib/password-strength/password-strength.ts:17-30`.)

**UI verification**

- 5 bars rendered (`password-strength.html:2`, `[0,1,2,3,4]`).
- Filled bars use the correct token color.
- Label text matches.

**Pass criteria**: at least one weak/okay/strong sample evaluates to the expected label.

**Severity if failing**: Medium.

---

### TC-2.9 — Accept-invitation route pre-fills email and city read-only

**Steps**

1. Navigate to `/invitations/accept?email=invited@example.com&city=Toronto&token=abc` (or whatever query params the link uses).

**UI verification**

- Same form as `/sign-up` (route shares the `SignUp` component, see `frontend/projects/the-upper-room/src/app/app.routes.ts:52`).
- Email field has `[readonly]="fromInvitation()"` (`sign-up.html:23`) — input not editable.
- City field has `[readonly]="fromInvitation()"` (line 48).
- The "Sign in" link shown only when there's a duplicate-email error and not from invitation (line 26-30) — hidden in invitation mode.

**Behavior verification**

- Clicking **"Create account"** submits with the prefilled email/city.

**Pass criteria**: email and city are read-only; submission works.

**Severity if failing**: High.

---

### TC-2.10 — Expired invitation screen

**Steps**

1. Navigate to `/invitations/accept` with an expired/invalid token.

**UI verification**

- Component renders the **expired** branch (`sign-up.html:2-9`):
  - Heading **"This invitation has expired."**
  - Body **"Ask your city lead to send you a new one."**
  - Link **"Request a new invite"** routing to `/sign-in`, `data-testid="invitation-request-new"`.

**Pass criteria**: full text matches.

**Severity if failing**: Medium.

---

### TC-2.11 — Forgot-password page renders and submits

**Steps**

1. Navigate to `/forgot-password`.

**UI verification**

- Heading **"Forgot password"** (`frontend/projects/the-upper-room/src/app/auth/forgot-password/forgot-password.html:3`).
- Email field: label **"Email"**, placeholder **"Email"**, `data-testid="forgot-email"` (line 4-12).
- Button **"Send reset link"**, `data-testid="forgot-submit"` (line 13-15).

**Behavior verification**

- After submit, confirmation message appears: **"If an account exists for {email}, a reset link has been sent."** (`forgot-password.html:18`).
- API: `POST /api/v1/auth/forgot-password` returns `204 No Content` on first 3 attempts (`AuthController.cs:53-72`).

**Database verification**: per-email bucket in `_forgotBuckets` (`AuthController.cs:13`).

**Pass criteria**: confirmation shown; 204 returned.

**Severity if failing**: High.

---

### TC-2.12 — Forgot-password rate limit: 3 attempts/hour → 429

**Steps**

1. POST 4 times to `/api/v1/auth/forgot-password` with the same email within an hour.

**Behavior verification**

- Attempts 1–3 → `204 No Content`.
- Attempt 4 → `429` with body `{ "error": "rate_limit_exceeded" }` (`AuthController.cs:65-66`).

**Pass criteria**: 4th call returns 429.

**Severity if failing**: Critical (abuse vector).

---

### TC-2.13 — Reset-password page

**Steps**

1. Navigate to `/reset-password?token=valid` (mock).

**UI verification**

- Heading **"Reset password"** (`frontend/projects/the-upper-room/src/app/auth/reset-password/reset-password.html:10`).
- Field 1: label **"New password"**, `data-testid="reset-new-password"` (line 11-17).
- Field 2: label **"Confirm password"**, `data-testid="reset-confirm-password"` (line 18-26).
- Submit button text: **"Reset password"**, `data-testid="reset-submit"` (line 27-29).

**With expired token** (e.g. `?token=expired`):

- Renders heading **"This reset link has expired."**, body **"Please request a new one."**, link **"Forgot password"** routing to `/forgot-password` (`reset-password.html:3-7`).

**Pass criteria**: both branches render correctly.

**Severity if failing**: High.

---

### TC-2.14 — Reset-password mismatch shows confirm error

**Steps**

1. Enter different values in **New password** and **Confirm password**.
2. Click **Reset password**.

**UI verification**

- Confirm field error slot (`errorTestId="reset-error-confirm"`, `reset-password.html:23`) shows the mismatch message defined by `confirmError()` in `reset-password.ts`.

**Pass criteria**: error displays; submit blocked.

**Severity if failing**: High.

---

### TC-2.15 — Sign-out from avatar menu

**Steps**

1. Sign in successfully (`TC-2.2`).
2. In the top bar click the avatar button (`data-testid="avatar-trigger"`, `frontend/projects/the-upper-room/src/app/shell/app-shell/app-shell.html:25`).
3. Click **Sign out** (`data-testid="avatar-menu-sign-out"`, line 33).

**UI verification**

- Menu opens (`role="menu"`, line 32).
- Item visible: **"Sign out"** (line 41).
- After click, navigates to `/sign-in` (or `/`).

**Behavior verification**

- API: `POST /api/v1/auth/sign-out` → `204 No Content` (`AuthController.cs:74-80`).
- Cookie `tar.refresh` deleted from path `/api/v1/auth` (`AuthController.cs:78`).
- Endpoint requires the `X-XSRF-TOKEN` header (attribute `[RequireXsrf]`, `AuthController.cs:75`). Verify the frontend sends the matching XSRF cookie value.

**Database verification**: N/A.

**Pass criteria**: cookie cleared, redirected to public route.

**Severity if failing**: Critical.
