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
- Heading **"My profile"** (line 3).
- Avatar uploader: `<tar-avatar-uploader [user]="form()" (fileSelected)="onAvatarSelected($event)" />` (line 5) — clicking the avatar triggers a file picker; file uploads automatically.
- Field rows (lines 7-66):
  - **First name** `data-testid="profile-first-name"`
  - **Last name** `data-testid="profile-last-name"`
  - **Display name** `data-testid="profile-display-name"`
  - **Pronouns** `data-testid="profile-pronouns"`
  - **Title** `data-testid="profile-title"`
  - **City** `data-testid="profile-city"` (readonly when `!canEditCity()`)
  - **Timezone** `data-testid="profile-timezone"`
  - **Locale** `data-testid="profile-locale"`
- Form actions: `<tar-form-actions saveLabel="Save changes" cancelLabel="Cancel" saveTestId="profile-save" cancelTestId="profile-cancel">` (lines 67-75). Save disabled until `isDirty()`.
- Sessions card `<app-sessions-card>` (line 78).

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

- API: `PUT /api/v1/users/me` (or equivalent). Status `200`.
- Snackbar confirms save.

**Database verification**

- User record updated; audit entry `EntityType="User"`, `Action="Update"`.

**Pass criteria**: persisted; snackbar shown.

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

- API: `POST /api/v1/users/me/avatar` (verify in `backend/src/TheUpperRoom.Api/Uploads/`).

**Pass criteria**: upload succeeds; avatar persists across reload.

**Severity if failing**: Medium.

---

### TC-11.5 — Sessions card lists active sessions

**Steps**

1. Scroll to **Active sessions**.

**UI verification**

- Section `<section data-testid="sessions-card">` (`frontend/projects/the-upper-room/src/app/users/sessions-card/sessions-card.html:1`).
- Heading **"Active sessions"** (line 3).
- Each row `<li data-testid="session-row-{id}">` showing:
  - Device name `<strong>{device}</strong>`.
  - Chip **"This device"** (`class="sessions-card__chip"`) when `s.current` is true (line 20).
  - Meta line: **`{location} · last seen {lastSeen}`** (line 23).
- When other sessions exist, `<tar-button testId="sessions-sign-out-others" variant="outlined">` shows text **"Sign out other sessions"** (lines 5-12).

**Pass criteria**: rows match user's session set.

**Severity if failing**: High.

---

### TC-11.6 — Sign out other sessions

**Steps**

1. From a second browser sign in with the same user (creates another session).
2. In the original browser click **Sign out other sessions**.

**Behavior verification**

- API: `DELETE /api/v1/users/me/sessions/others` (or equivalent).
- Other session(s) become invalid; they receive 401 on next request and are redirected to `/sign-in`.

**Database verification**

- `UserSessions` collection: rows for non-current sessions removed (or marked revoked).

**Pass criteria**: only current session remains; other browser is signed out on next interaction.

**Severity if failing**: Critical (security).

---

### TC-11.7 — Appearance: theme switching

**Steps**

1. Navigate to `/settings/appearance`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/settings/appearance/appearance.html`.
- Heading **"Appearance"** (line 1).
- Radiogroup `<div class="appearance__options" role="radiogroup" aria-label="Theme mode">` (line 2).
- Three options in this order: **system | light | dark** (`appearance.ts:12`, `modes: ThemeMode[] = ['system', 'light', 'dark']`).
- Each button: `data-testid="theme-option-{m}"`, `role="radio"`, `aria-checked` true for the active mode (lines 4-15).

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
- Heading `<h1>Notification Preferences</h1>` (line 1).
- Push enable/disable button (lines 3-13): when not subscribed, button text **"Enable push notifications"** (`data-testid="push-enable-button"`); when subscribed, **"Disable push notifications"** (`data-testid="push-disable-button"`). Both `btn-outlined`.
- Table `<table class="np__table">`:
  - Headers: **Notification | In-app | Email | Push | (blank)** (lines 17-23).
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

1. On `/settings/notifications`, look for a digest-frequency control. **[unverified — `tar-notification-preferences.html` does not include a digest-frequency control. The user guide §11.4 mentions "Pick a digest frequency if available." Verify intent before failing.]**

**Pass criteria (when implemented)**: choice persists and reflects in subsequent emails.

**Severity if failing**: Low.
