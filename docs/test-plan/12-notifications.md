# Section 12 — Notifications

> Mirrors `docs/user-guide.md` §12.

## Pre-conditions

- Signed in.
- Some notifications enqueued for the user (e.g. trigger via creating an event with attendees, or seed via `MailStore` in `backend/src/TheUpperRoom.Api/Notifications/MailStore.cs`).

## Tests

### TC-12.1 — Notification bell with badge

**Steps**

1. View the top bar.

**UI verification**

- Container `<div class="notification-bell">` (`frontend/projects/domain/src/lib/notifications/notification-bell/tar-notification-bell.html:1`).
- Trigger `<button data-testid="notification-bell" aria-label="Notifications">` (lines 2-13) with `notifications` Material icon.
- When `unreadCount() > 0`, `<span data-testid="notification-badge">` shows `badgeLabel()` (line 11) — typically the unread count or `9+` if capped.

**Pass criteria**: bell visible; badge present iff unread count > 0.

**Severity if failing**: High.

---

### TC-12.2 — Open menu

**Steps**

1. Click the bell.

**UI verification**

- Menu opens: `<div data-testid="notification-menu" role="dialog" aria-label="Notifications">` (`tar-notification-bell.html:16`).
- Header **"Notifications"** (line 18).
- Tabs `role="tablist"` (line 21):
  - **Unread** `data-testid="notification-tab-unread"` (lines 22-30).
  - **All** `data-testid="notification-tab-all"` (lines 31-39).
  - Active tab carries `aria-selected="true"`.

**Pass criteria**: menu opens with tabs and exact labels.

**Severity if failing**: High.

---

### TC-12.3 — Empty state

**Steps**

1. Mark all read; switch to **Unread** tab.

**UI verification**

- `<div data-testid="notification-empty">` (`tar-notification-bell.html:44`).
- Icon `notifications_off`, text **"You're all caught up"** (line 46).

**Pass criteria**: copy and icon exact.

**Severity if failing**: Low.

---

### TC-12.4 — Notification rows

**Steps**

1. With unread notifications, open the menu.

**UI verification**

- Each row `<button data-testid="notification-row">` (`tar-notification-bell.html:51`).
- Unread rows have `notification-bell__row--unread` modifier (line 53).
- Severity icon `notification-bell__row-icon--{severity}`:
  - **Warning** → `warning` icon.
  - **Success** → `check_circle`.
  - default (Info) → `info` (line 58).
- Title, body, and time (`{createdAt | date:'shortTime'}`) visible.

**Pass criteria**: each row matches its severity icon and read state.

**Severity if failing**: Medium.

---

### TC-12.5 — Click row navigates and marks read

**Steps**

1. Click an unread notification row.

**UI verification**

- Menu closes (typical pattern); URL navigates to the linked entity (e.g. `/boards/{id}` for board mentions).
- Badge count decrements; row no longer marked unread next time the menu opens.

**Behavior verification**

- API: `POST /api/v1/notifications/{id}/read` (or equivalent in `backend/src/TheUpperRoom.Api/Notifications/NotificationsController.cs`).

**Pass criteria**: navigation + read state persists.

**Severity if failing**: High.

---

### TC-12.6 — Mark all read

**Steps**

1. Click **Mark all as read** in the footer (`data-testid="notification-mark-all-read"`, `tar-notification-bell.html:73`).

**UI verification**

- Badge disappears; all rows lose unread modifier.

**Behavior verification**

- API: `POST /api/v1/notifications/read-all`.

**Pass criteria**: all rows read; badge cleared.

**Severity if failing**: High.

---

### TC-12.7 — Settings link from menu

**Steps**

1. Click **Notification settings** in the footer (`data-testid="notification-settings-link"`, `tar-notification-bell.html:78`).

**UI verification**

- Routes to `/settings/notifications` (line 81). See §11.9 for verification of the destination page.

**Pass criteria**: navigation succeeds.

**Severity if failing**: Medium.

---

### TC-12.8 — Real-time arrival (optional)

**Steps**

1. Trigger a new notification from another user/session (e.g. mention the current user on a card).
2. Observe the bell.

**UI verification**

- Within a short window (websocket / polling) the badge increments; opening the menu shows the new row at the top.

**Pass criteria**: notification appears without requiring page reload.

**Severity if failing**: Medium (depends on the polling/push implementation).
