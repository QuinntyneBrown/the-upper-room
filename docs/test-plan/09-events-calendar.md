# Section 9 — Events and Calendar

> Mirrors `docs/user-guide.md` §9.

## Pre-conditions

- Signed in.
- Backend `EventsController` (`backend/src/TheUpperRoom.Api/Events/EventsController.cs`) seeded with at least one event.

## Tests

### TC-9.1 — Events list renders

**Steps**

1. Navigate to `/events`.

**UI verification**

- Toolbar (`frontend/projects/the-upper-room/src/app/events/event-list/event-list.html:1-25`):
  - Heading **"Events"**.
  - Status select `data-testid="events-filter-status"` with options:
    - **"All statuses"** (value `""`)
    - **"Scheduled"**
    - **"Cancelled"**
    - **"Completed"**
  - View toggle button `data-testid="events-view-toggle"`. When in list mode, button shows `calendar_month` icon and `aria-label="Switch to calendar view"`. When in calendar mode, shows `list` icon and `aria-label="Switch to list view"`.
- Empty state: `tar-empty-state` with `data-testid="event-list-empty"`, `icon="event"`, `heading="No events yet"`, `body="Events will appear here once scheduled."`.
- Each event card `<article data-testid="event-card-{id}">`:
  - `event-card--cancelled` modifier when status is **Cancelled**.
  - Cancelled ribbon `<div data-testid="event-cancelled-ribbon">Cancelled</div>`.
  - Status chip `<span data-testid="event-status-chip-{id}" data-status="{status}">{status}</span>`.
  - Virtual or location indicator with appropriate Material icon `videocam` or `location_on`.
  - Title `<h2 data-testid="event-card-title">`.
  - Date string formatted via `formatDate(event.startAt)`.
  - RSVP line: `{count} / {capacity} RSVPs` if capacity, else `{count} RSVPs`.

**Behavior verification**

- API: `GET /api/v1/events?status=…`.

**Pass criteria**: structure exact.

**Severity if failing**: High.

---

### TC-9.2 — Status filter

**Steps**

1. Choose **Scheduled**, then **Cancelled**, then **Completed**.

**UI verification**

- List narrows accordingly.

**Behavior verification**

- API call includes `?status=Scheduled|Cancelled|Completed`.

**Pass criteria**: only matching events render per filter.

**Severity if failing**: High.

---

### TC-9.3 — Calendar view toggle

**Steps**

1. Click the view toggle.

**UI verification**

- View flips: list → calendar.
- Calendar wrapper `<div data-testid="events-calendar-view">` (`event-list.html:84`) renders `<app-calendar-month [events]="events()" (monthChange)="onCalendarMonthChange($event)" />`.

**Pass criteria**: toggle switches both ways.

**Severity if failing**: High.

---

### TC-9.4 — Calendar month navigation

**Steps**

1. In calendar view, click the next-month and previous-month chevrons (per `frontend/projects/the-upper-room/src/app/events/calendar-month/`).

**UI verification**

- Month label updates.
- `(monthChange)` event fires (verify via `EventList.onCalendarMonthChange`).
- Events for the visible month appear on the corresponding date cells.

**Behavior verification**

- API may re-fetch events for the new month range.

**Pass criteria**: navigation works, events repaint.

**Severity if failing**: High.

---

### TC-9.5 — Click event in calendar opens detail

**Steps**

1. Click an event in any date cell.

**UI verification**

- Navigates to `/events/{id}`.

**Pass criteria**: navigation occurs.

**Severity if failing**: Medium.

---

### TC-9.6 — Create event form

**Steps**

1. Click **New event**.
2. Navigate to `/events/new`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/events/event-form/event-form.html`.
- Heading: **"New Event"** when `eventId()` falsy, **"Edit Event"** otherwise.
- Section **"Basics"**:
  - **Title \*** required, placeholder **"Event title"**.
  - **Description** textarea, placeholder **"What's this event about?"**.
- Section **"When"**:
  - **Start \*** datetime-local input.
  - **End \*** datetime-local input; error **"End time must be after start time."** when invalid.
  - **Timezone** select listing `timezones` array.
- Section **"Where"**:
  - **Location** search `data-testid="event-form-location-search"`, placeholder **"Search venues…"**.
  - Dropdown of results `data-testid="event-form-location-result-{id}"`.
  - Checkbox **"Virtual event"**.
  - When virtual, label **"Virtual URL"** with input type `url`, placeholder **"https://…"**.
- Section **"Who"**:
  - **Capacity** number input, min 1, placeholder **"Unlimited"**.
  - Checkbox **"Requires approval"**.
- Section **"Recurrence"**:
  - Repeat select with options **None | Daily | Weekly | Monthly**.
- Section **"Tags"**: chips with × removal and an inline add input placeholder **"Add tag…"**.
- Submit button: text **"Create Event"** (or **"Save Changes"** when editing), `data-testid="event-form-submit"`, disabled when `!canSubmit()`.
- Sidebar preview `<aside data-testid="event-form-preview">` showing live title, start/end times, timezone, location (or "Virtual" / "Location TBD").

**Behavior verification**

- API: `POST /api/v1/events`.

**Pass criteria**: every label/placeholder/section heading exact.

**Severity if failing**: Critical.

---

### TC-9.7 — Validation: end time before start

**Steps**

1. Set Start to a value, set End earlier than Start.

**UI verification**

- End field gains `form-field__input--error` class (`event-form.html:69`).
- Error text **"End time must be after start time."**.
- Submit disabled.

**Pass criteria**: error displays and submit blocked.

**Severity if failing**: High.

---

### TC-9.8 — Edit recurring event scope dialog

**Steps**

1. Open `/events/{id}/edit` for an event in a recurring series.
2. Change a field and trigger save.

**UI verification**

- Dialog `<div data-testid="recurrence-edit-dialog">` (`event-form.html:2-13`).
- Title: **"Edit recurring event"**.
- Body: **"Which events do you want to change?"**.
- Three buttons:
  - **"This event only"** (`data-testid="recurrence-edit-single"`, `btn-filled`).
  - **"This and following events"** (`data-testid="recurrence-edit-following"`, `btn-tonal`).
  - **"Entire series"** (`data-testid="recurrence-edit-series"`, `btn-outlined`).

**Pass criteria**: dialog appears for recurring; choice scopes the update accordingly.

**Severity if failing**: High.

---

### TC-9.9 — Event detail page

**Steps**

1. Navigate to `/events/{id}`.

**UI verification**

- Hero (`event-detail.html:2-31`):
  - Cover image when set; gradient overlay.
  - Status chip `<span data-testid="event-status-chip">`.
  - Virtual indicator with `videocam` icon.
  - Title `<h1 data-testid="event-detail-title">`.
  - Share button `<button data-testid="event-share-button" aria-label="Share event">` with `share` icon.
- Body:
  - **About** section if description present, text in `<p data-testid="event-description">`.
  - **Location** section if location present, with `location_on` icon.
  - Sidebar `event-detail-card` with start/end and optional timezone label `data-testid="event-timezone-label"`.
  - RSVP card `data-testid="event-rsvp-card"`:
    - Display **"{count} / {capacity} RSVPs"** or **"{count} RSVPs"**.
    - Status text `data-testid="rsvp-status"` when user has RSVPed; if **Waitlisted** show **`(#{position})`**.
    - Three buttons: **Going** (`btn-filled`, `data-testid="rsvp-button-yes"`), **Maybe** (`btn-tonal`, `data-testid="rsvp-button-maybe"`), **Can't go** (`btn-outlined`, `data-testid="rsvp-button-no"`).
  - Pending approvals panel for organizers `data-testid="rsvp-panel"` with **Pending Approvals** heading; each row has **Approve** (`btn-filled`) and **Deny** (`btn-outlined`) buttons.
  - Attendees grid `data-testid="event-attendees-grid"` with avatars and an overflow **+N** button (`data-testid="event-attendees-more"`).
  - **Add to calendar** button `data-testid="event-add-to-calendar"` with `calendar_add_on` icon.
  - **Cancel event** button when organizer and not yet cancelled, `data-testid="event-cancel-button"`, with `cancel` icon.

**Pass criteria**: every label, icon, and conditional block matches.

**Severity if failing**: High.

---

### TC-9.10 — RSVP toggling

**Steps**

1. Click **Going**.
2. Click **Going** again to remove or pick **Can't go**.

**UI verification**

- Active button shows `btn-filled--active` (or per-variant active modifier).
- `data-testid="rsvp-status"` updates to **Going / Maybe / Cancelled** etc.

**Behavior verification**

- API: `POST /api/v1/events/{id}/rsvp` (see `EventRsvpController.cs`).

**State/API verification**

- `EventsDbContext.Rsvps` row for the event/current user is created or updated.

**Pass criteria**: state toggles, count updates.

**Severity if failing**: High.

---

### TC-9.11 — Cancel event dialog

**Steps**

1. As organizer click **Cancel event**.

**UI verification**

- Dialog `<div data-testid="event-cancel-dialog">` (`event-detail.html:188`).
- Title **"Cancel event"**.
- Close `×` icon button.
- Textarea label **"Message to attendees (optional)"**, `data-testid="event-cancel-message"`, placeholder **"Let attendees know why…"**.
- Buttons: **"Keep event"** (`btn-outlined`) and **"Yes, cancel"** (`data-testid="event-cancel-confirm"`, `btn-filled`, error-color background).

**Behavior verification**

- API: `POST /api/v1/events/{id}/cancel` (`EventCancelController.cs`).
- Per user guide: attendees with RSVPs are notified.

**State/API verification**

- Event status set to `Cancelled`. Notifications enqueued (verify in `MailStore` and `Notifications`).

**Pass criteria**: status updates; ribbon appears on event card; notifications fire.

**Severity if failing**: Critical.

---

### TC-9.12 — Add to calendar (.ics export)

**Steps**

1. Click **Add to calendar**.

**UI verification**

- Browser triggers download of `.ics` file (or opens it in default app).

**Behavior verification**

- API: `GET /api/v1/events/{id}/ics` (`EventIcsController.cs`) returns `200` with `Content-Type: text/calendar` and a valid VCALENDAR body.

**Pass criteria**: file downloads, contains `BEGIN:VCALENDAR` … `END:VCALENDAR` plus event details.

**Severity if failing**: High.

---

### TC-9.13 — Attendees overflow dialog

**Steps**

1. On an event with > N attendees (the avatar grid limit), click the **+N** overflow.

**UI verification**

- Dialog `<div data-testid="event-attendees-dialog">` (`event-detail.html:229`) with title **"Attendees"**.
- Each entry `<div data-testid="attendee-list-{id}">` shows avatar, name, RSVP status.

**Pass criteria**: full list visible; close `×` works.

**Severity if failing**: Medium.

---

### TC-9.14 — Pending RSVP approval

**Steps**

1. As organizer of an event with `requiresApproval=true`, sign in as another user and RSVP.
2. As organizer view detail.

**UI verification**

- Pending request appears in `data-testid="rsvp-panel"` (`event-detail.html:111`).
- **Approve** button `data-testid="rsvp-approve-{id}"`; **Deny** `data-testid="rsvp-deny-{id}"`.

**Behavior verification**

- Approve / Deny call backend RSVP endpoints.

**Pass criteria**: approval state persists.

**Severity if failing**: High.

---

### TC-9.15 — Live preview pane updates as form changes

**Steps**

1. On `/events/new` type a title.
2. Set a start time.

**UI verification**

- Preview title updates immediately (`data-testid="event-preview-title"`, `event-form.html:214`); empty title shows **"Untitled Event"**.
- Start time updates `data-testid="event-preview-start-time"`.
- Location preview shows `locationName()` or **"Virtual"** or **"Location TBD"**.

**Pass criteria**: preview is reactive.

**Severity if failing**: Medium.
