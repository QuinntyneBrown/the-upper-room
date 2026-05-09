# Section 3 — Navigation (Finding Your Way Around)

> Mirrors `docs/user-guide.md` §3.

## Pre-conditions

- Signed in as `test@example.com`.
- On `/dashboard`.

## Tests

### TC-3.1 — Top bar layout (left → right)

**Steps**

1. Inspect the top bar (`<header data-testid="top-bar">`, `frontend/projects/the-upper-room/src/app/shell/app-shell/app-shell.html:12`).

**UI verification**

- Children in order:
  1. `tar-icon-button` with `icon="menu"`, `ariaLabel="Open navigation"`, `data-testid="drawer-toggle"` (lines 13-19).
  2. App name span: text **"The Upper Room"**, class `app-shell__app-name` (line 20).
  3. Spacer `<span class="app-shell__spacer">` (line 21).
  4. `<tar-city-switcher />` (line 22).
  5. `<tar-notification-bell />` (line 23).
  6. Avatar wrapper containing `tar-icon-button` with `icon="account_circle"`, `ariaLabel="Account menu"`, `data-testid="avatar-trigger"` (lines 25-30).
- On scroll, header gains class `app-shell__top-bar--elevated` (line 12, `[class.…]="didScroll"`).

**Behavior verification**

- Clicking the menu icon sets `drawerOpen()` true (`toggleDrawer()`).
- Clicking the avatar opens the menu (`avatarMenuOpen()` toggles).

**Pass criteria**: order, icons, aria-labels match exactly.

**Severity if failing**: High.

---

### TC-3.2 — Drawer opens, drawer scrim closes it

**Steps**

1. Click the menu (`data-testid="drawer-toggle"`).
2. Click anywhere on the dimmed overlay (`data-testid="drawer-scrim"`, `app-shell.html:58`).

**UI verification**

- `<nav data-testid="drawer">` toggles class `app-shell__drawer--open` (line 53).
- `aria-hidden` flips: `false` when open, `true` when closed (line 52).
- Pressing **Esc** while drawer focused also closes it (line 54).

**Pass criteria**: drawer opens and closes via every documented mechanism.

**Severity if failing**: High.

---

### TC-3.3 — Avatar menu Sign-out item

**Steps**

1. Click avatar trigger.
2. Verify dropdown.

**UI verification**

- Container `<div class="app-shell__avatar-menu" role="menu">` (`app-shell.html:32`).
- Single item: button text **"Sign out"** with `role="menuitem"` and `data-testid="avatar-menu-sign-out"` (lines 33-41).

**Behavior verification**: see `TC-2.15`.

**Pass criteria**: text exact; role and testid present.

**Severity if failing**: High.

---

### TC-3.4 — Breadcrumbs render below top bar

**Steps**

1. Navigate to `/contacts`.
2. Inspect breadcrumb container `<nav data-testid="breadcrumbs">` (`app-shell.html:61-68`).

**UI verification**

- `aria-label="Breadcrumb"` (line 61).
- Each crumb is an `<a>` with `aria-current="page"` on the last item only (line 63).
- Slash separator `<span aria-hidden="true">/</span>` between crumbs (line 65).
- Example expected for `/contacts`: links **Home** › **Contacts** (or whatever `crumbs()` returns from the route data — verify from the breadcrumb signal in `app-shell.ts`).

**Pass criteria**: visible chain matches the URL; `aria-current` only on the last.

**Severity if failing**: Medium.

---

### TC-3.5 — Skip-to-main-content link appears on first Tab

**Steps**

1. Click into the page once to set focus on body, then press **Tab** as the first keyboard action after page load.

**UI verification**

- Anchor `<a data-testid="skip-link" class="app-shell__skip-link" href="#main">` (`app-shell.html:8`) becomes visible (it is `position: absolute` off-screen until focused per the SCSS).
- Activating it (Enter) calls `skipToMain($event)` and focuses `<main id="main" tabindex="-1">` (line 70).
- Text: **"Skip to main content"**.

**Pass criteria**: visible on focus; activates focus on `<main>`.

**Severity if failing**: Medium (a11y).

---

### TC-3.6 — App name acts as a return-to-dashboard affordance

**Steps**

1. Navigate away to `/contacts`.
2. Click the **The Upper Room** text in the top bar.

**UI verification**

- The current code has the title as a plain `<span class="app-shell__app-name">` (`app-shell.html:20`) — not a link. **[unverified — user guide §3.1 says "click it to return to the dashboard" but the rendered element has no click handler / routerLink. Either the implementation needs to add navigation, or the user guide needs adjustment. File a defect.]**

**Pass criteria**: clicking should navigate to `/dashboard` per the user guide.

**Severity if failing**: Medium (UX deviation from documentation).

---

### TC-3.7 — City switcher renders, opens, lists cities

**Steps**

1. Click the city switcher (`data-testid="city-switcher-trigger"`, `frontend/projects/domain/src/lib/cities/city-switcher/tar-city-switcher.html:3`).

**UI verification**

- Trigger shows the current city name `currentLabel()` (line 4).
- Menu opens: `<ul data-testid="city-switcher-menu" role="menu">` (line 7).
- Each city is `<li data-testid="city-switcher-option-{slug}" role="menuitem">` with the city `name` and a checkmark when current (lines 8-13).
- Final item **"All cities (read-only)"** (`data-testid="city-switcher-option-all"`, line 14-16).
- Switcher hides entirely when `canSwitch()` is false (line 1).

**Pass criteria**: menu structure and labels match.

**Severity if failing**: High.

---

### TC-3.8 — Switching city re-scopes data

**Steps**

1. Open `/contacts` while on city `Toronto` — observe contacts list (e.g. "Alice" per seed in `backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs:25`).
2. Switch to `Halifax` (the seed has `Bob` in `Halifax`).
3. Observe that the list now shows `Bob` and not `Alice`.

**UI verification**

- The list updates without a full page reload.
- A snackbar may confirm the city change — check for `tar-snackbar` rendering (`app.html:2`).

**Behavior verification**

- API: `GET /api/v1/contacts` is re-issued. Server-side filtering by `user.City` happens at `ContactsController.cs:50-51`.

**Database verification**

- `_store` (`ContactsController.cs:23-27`): two seeded contacts. The list reflects only the active-city subset for non-admin users.

**Pass criteria**: list scope changes per active city.

**Severity if failing**: Critical.

---

### TC-3.9 — All-cities banner appears in read-only mode

**Steps**

1. From the city switcher choose **All cities (read-only)**.

**UI verification**

- `<tar-banner testId="city-switcher-all-banner" severity="warning" message="Switch to a single city to make changes." [dismissible]="false" />` (`tar-city-switcher.html:22`).
- Banner severity color uses warning token; banner is not dismissible.

**Pass criteria**: banner present and non-dismissible while in all-cities scope.

**Severity if failing**: High.

---

### TC-3.10 — Footer

**Steps**

1. Scroll to bottom of any page.

**UI verification**

- `<footer data-testid="footer" class="app-shell__footer">© The Upper Room</footer>` (`app-shell.html:74`).

**Pass criteria**: footer text exactly **"© The Upper Room"**.

**Severity if failing**: Low.
