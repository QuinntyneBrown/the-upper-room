# Section 11 — Profile and Settings

> Mirrors `docs/user-guide.md` §11.

## Pre-conditions

- Signed in.
- Backend has at least one user record for the signed-in user with multiple sessions.

## Tests

### TC-11.1 — Profile page renders

**Steps**

1. Click avatar → **Profile** (or navigate to `/profile`).

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/users/my-profile/my-profile.html`.
- Heading **"My profile"**.
- Avatar uploader: `<tar-avatar-uploader [user]="form()" (fileSelected)="onAvatarSelected($event)" />` — clicking the avatar triggers a file picker; file uploads automatically.
- Field rows:
  - **First name** `data-testid="profile-first-name"`
  - **Last name** `data-testid="profile-last-name"`
  - **Display name** `data-testid="profile-display-name"`
  - **Pronouns** `data-testid="profile-pronouns"`
  - **Title** `data-testid="profile-title"`
  - **City** `data-testid="profile-city"` (readonly when `!canEditCity()`)
  - **Timezone** `data-testid="profile-timezone"`
  - **Locale** `data-testid="profile-locale"`
- Form actions: `<tar-form-actions saveLabel="Save changes" cancelLabel="Cancel" saveTestId="profile-save" cancelTestId="profile-cancel">`. Save disabled until `isDirty()`.
- Sessions card `<app-sessions-card>`.

**Pass criteria**: all field labels exact; testIds present.

**Severity if failing**: High.

---

### TC-11.2 — Editing a field marks dirty

**Steps**

1. Change First name. Save button enables; Cancel button enables.
2. Click **Cancel** to revert.

**UI verification**

- `tar-form-actions` `[dirty]` binds to `isDirty()` — buttons enabled only when dirty.
- Cancel reverts to original values.

**Pass criteria**: dirty state correctly tracked.

**Severity if failing**: Medium.

---

### TC-11.3 — Save profile

**Steps**

1. Edit field, click **Save changes**.

**Behavior verification**

- Current frontend calls `PATCH /api/v1/users/me/profile`.
- Current backend only implements `GET /api/v1/users/me`; there is no profile read/update endpoint yet.
- Snackbar confirms save when the endpoint is stubbed or implemented.

**State/API verification**

- Mark backend integration blocked/failed unless the profile endpoint is intentionally stubbed.

**Pass criteria**: UI dirty/save state works; backend persistence is currently blocked.

**Severity if failing**: High.

---

### TC-11.4 — Avatar upload

**Steps**

1. Click avatar.
2. Pick an image file.

**UI verification**

- Image preview replaces previous avatar immediately (optimistic).
- On error, rolls back and snackbar shows the error message from the catalog.

**Behavior verification**

- API: `POST /api/v1/uploads` with multipart form field `file`.

**Pass criteria**: upload succeeds; avatar persists across reload.

**Severity if failing**: Medium.

---

### TC-11.5 — Sessions card lists active sessions

**Steps**

1. Scroll to **Active sessions**.

**UI verification**

- Section `<section data-testid="sessions-card">` (`frontend/projects/the-upper-room/src/app/users/sessions-card/sessions-card.html:1`).
- Heading **"Active sessions"**.
- Each row `<li data-testid="session-row-{id}">` showing:
  - Device name `<strong>{device}</strong>`.
  - Chip **"This device"** (`class="sessions-card__chip"`) when `s.current` is true.
  - Meta line: **`{location} · last seen {lastSeen}`**.
- When other sessions exist, `<tar-button testId="sessions-sign-out-others" variant="outlined">` shows text **"Sign out other sessions"**.

**Pass criteria**: rows match user's session set.

**Severity if failing**: High.

---

### TC-11.6 — Sign out other sessions

**Steps**

1. From a second browser sign in with the same user (creates another session).
2. In the original browser click **Sign out other sessions**.

**Behavior verification**

- Current frontend calls `POST /api/v1/users/me/sessions/revoke-others`.
- Current backend has no user sessions endpoints.

**State/API verification**

- Mark backend integration blocked/failed unless the sessions endpoints are intentionally stubbed.

**Pass criteria**: only current session remains; other browser is signed out on next interaction.

**Severity if failing**: Critical (security).

---

### TC-11.7 — Appearance: theme switching

**Steps**

1. Navigate to `/settings/appearance`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/settings/appearance/appearance.html`.
- Heading **"Appearance"**.
- Radiogroup `<div class="appearance__options" role="radiogroup" aria-label="Theme mode">`.
- Three options in this order: **system | light | dark** (`appearance.ts:12`, `modes: ThemeMode[] = ['system', 'light', 'dark']`).
- Each button: `data-testid="theme-option-{m}"`, `role="radio"`, `aria-checked` true for the active mode.

**Behavior verification**

- Clicking **light** sets `<html data-theme="light">` and persists `localStorage.theme="light"` (compare to bootstrap script `index.html:57-70`).
- Clicking **dark** sets `data-theme="dark"`.
- Clicking **system** removes `data-theme` (or defers to OS preference).

**Pass criteria**: each click takes effect immediately and persists across reload.

**Severity if failing**: High.

---

### TC-11.8 — Appearance persistence and FOUC

**Steps**

1. Choose **dark**, reload the page.

**UI verification**

- Page renders dark instantly — no white flash. The synchronous bootstrap script in `index.html:57-70` reads `localStorage.theme` before first paint.

**Pass criteria**: no flash; theme survives refresh.

**Severity if failing**: Medium.

---

### TC-11.9 — Notification preferences page

**Steps**

1. Navigate to `/settings/notifications`.

**UI verification**

- Component: `frontend/projects/domain/src/lib/notifications/notification-preferences/tar-notification-preferences.html`.
- Heading `<h1>Notification Preferences</h1>`.
- Push enable/disable button: when not subscribed, button text **"Enable push notifications"** (`data-testid="push-enable-button"`); when subscribed, **"Disable push notifications"** (`data-testid="push-disable-button"`). Both `btn-outlined`.
- Table `<table class="np__table">`:
  - Headers: **Notification | In-app | Email | Push | (blank)**.
  - Each row `<tr data-testid="pref-row-{code}">` with checkbox per channel (`data-testid="pref-toggle-inApp|email|push"`) and a **Saved** indicator (`data-testid="pref-saved"`) shown briefly after a change.

**Behavior verification**

- API: `GET /api/v1/notifications/preferences` returns the set; toggling fires `PATCH /api/v1/notifications/preferences/{code}` body `{ inApp/email/push: bool }`.
- Per user guide §11.4: "Changes save automatically" — verify each toggle persists without an explicit Save button.

**Pass criteria**: each toggle saves and shows the **Saved** flash.

**Severity if failing**: High.

---

### TC-11.10 — Push enable triggers permission prompt

**Steps**

1. Click **Enable push notifications**.

**UI verification**

- Browser shows native permission prompt for notifications (best-effort verification — depends on origin and user gesture).
- On allow, button switches to **Disable push notifications**.

**Behavior verification**

- API: `POST /api/v1/notifications/push/subscribe` with the subscription details.

**Pass criteria**: subscription posted; UI flips.

**Severity if failing**: Medium.

---

### TC-11.11 — Digest frequency picker

**Steps**

1. On `/settings/notifications`, look for a digest-frequency control.

**Current code verification**

- `tar-notification-preferences.html` does not include a digest-frequency control.
- Notification preferences currently expose in-app, email, and push toggles per notification code.

**Pass criteria**: current implementation has no digest-frequency picker. Mark blocked/failed if digest frequency is required.

**Pass criteria (when implemented)**: choice persists and reflects in subsequent emails.

**Severity if failing**: Low.
