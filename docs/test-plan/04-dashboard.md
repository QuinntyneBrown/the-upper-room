# Section 4 — Dashboard

> Mirrors `docs/user-guide.md` §4.

## Pre-conditions

- Signed in.
- Backend `GET /api/v1/dashboard` returns a valid `DashboardDto` (see contract in `frontend/projects/the-upper-room/src/app/dashboard/dashboard.ts:31-36`).

## Tests

### TC-4.1 — Dashboard route reachable

**Steps**

1. Navigate to `/dashboard` (after sign-in this is the default landing).

**UI verification**

- Route entry: `frontend/projects/the-upper-room/src/app/app.routes.ts:63` (`{ path: 'dashboard', component: Dashboard }`).
- Component template: `frontend/projects/the-upper-room/src/app/dashboard/dashboard.html`.

**Behavior verification**

- API: `GET /api/v1/dashboard` issued on init (`dashboard.ts:58`). Status `200` with the DTO body.

**Pass criteria**: dashboard renders without console error.

**Severity if failing**: Critical.

---

### TC-4.2 — Welcome header

**Steps**

1. Inspect the header area.

**UI verification**

- `<h1 data-testid="dashboard-welcome">` text **"Welcome, {firstName}"** (`dashboard.html:4`).
- `firstName` matches the value in the response DTO.
- Typography token: heading uses `--md-sys-typescale-headline-medium` or `large` — verify Computed `font-family` resolves to `Roboto`.

**Pass criteria**: name interpolation correct.

**Severity if failing**: High.

---

### TC-4.3 — Stat cards render with correct icons and labels

**Steps**

1. Inspect the four stat cards.

**UI verification**

- Container `class="dashboard__stats"` (`dashboard.html:7`).
- Stat definitions in `dashboard.ts:38-43`:

| `id` | `data-testid` | Icon | Label |
| --- | --- | --- | --- |
| `contacts` | `stat-card-contacts` | `contacts` | **"Contacts"** |
| `partners` | `stat-card-partners` | `handshake` | **"Partners"** |
| `upcoming-events` | `stat-card-upcoming-events` | `event` | **"Upcoming Events"** |
| `open-ideas` | `stat-card-open-ideas` | `lightbulb` | **"Open Ideas"** |

- Each card: icon (`<span class="material-symbols-outlined stat-card__icon">`), count (`stat-count-{id}`), label.
- Icons use Material Symbols Rounded font (loaded per TC-1.3).

**Pass criteria**: all four cards present in this exact order with the documented icons and labels; counts match the DTO `stats`.

**Severity if failing**: High.

---

### TC-4.4 — Upcoming Events widget

**Steps**

1. Inspect `<div data-testid="dashboard-upcoming-events">` (`dashboard.html:20`).

**UI verification**

- Heading **"Upcoming Events"**.
- Link **"View calendar"** routes to `/events`, `data-testid="dashboard-view-calendar"`.
- When `upcomingEvents.length === 0`: text **"No upcoming events."**.
- Otherwise list of `<a data-testid="upcoming-event-{id}" routerLink="/events/{id}">` items with:
  - Calendar icon `calendar_month`.
  - Title from `ev.title`.
  - Meta: `formatDate(ev.startAt)` and (if location) ` · {location}`.
- Date format: `Intl.DateTimeFormat` with options `{ weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }` (`dashboard.ts:64-67`).

**Pass criteria**: empty state vs populated state both render correctly; link routes work.

**Severity if failing**: High.

---

### TC-4.5 — Tasks on My Boards widget

**Steps**

1. Inspect `<div data-testid="dashboard-my-boards">` (`dashboard.html:40`).

**UI verification**

- Heading **"Tasks on My Boards"**.
- Link **"View boards"** routes to `/boards`.
- Empty state text **"No assigned tasks."**.
- Each board group: `<div data-testid="board-group-{boardId}">` containing the board title and a list of card titles.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-4.6 — Stat counts equal API DTO values

**Steps**

1. Capture the response of `GET /api/v1/dashboard` in DevTools › Network.
2. Compare each rendered count to `stats.contacts`, `stats.partners`, `stats.upcomingEvents`, `stats.openIdeas`.

**State/API verification**

- The DTO is computed server-side; counts derive from `_store` lengths in the various controllers (e.g. `ContactsController.StoreCount(user)` at `ContactsController.cs:29-32`).
- For non-admin users, counts should reflect only the user's `City`.

**Pass criteria**: every count matches the DTO; DTO matches store contents for the active city.

**Severity if failing**: High.

---

### TC-4.7 — Click an upcoming event navigates to detail

**Steps**

1. Click any item under **Upcoming Events**.

**UI verification**

- URL becomes `/events/{id}`.
- Event-detail page renders (`frontend/projects/the-upper-room/src/app/events/event-detail/event-detail.html`).

**Pass criteria**: navigation occurs.

**Severity if failing**: High.
