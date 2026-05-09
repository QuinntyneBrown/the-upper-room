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
  - Heading **"Events"** (line 3).
  - Status select `data-testid="events-filter-status"` (lines 5-14) with options:
    - **"All statuses"** (value `""`)
    - **"Scheduled"**
    - **"Cancelled"**
    - **"Completed"**
  - View toggle button `data-testid="events-view-toggle"` (lines 15-23). When in list mode, button shows `calendar_month` icon and `aria-label="Switch to calendar view"`. When in calendar mode, shows `list` icon and `aria-label="Switch to list view"`.
- Empty state: `tar-empty-state` with `data-testid="event-list-empty"`, `icon="event"`, `heading="No events yet"`, `body="Events will appear here once scheduled."` (lines 28-34).
- Each event card `<article data-testid="event-card-{id}">` (line 39):
  - `event-card--cancelled` modifier when status is **Cancelled**.
  - Cancelled ribbon `<div data-testid="event-cancelled-ribbon">Cancelled</div>` (line 44).
  - Status chip `<span data-testid="event-status-chip-{id}" data-status="{status}">{status}</span>` (lines 53-57).
  - Virtual or location indicator with appropriate Material icon `videocam` or `location_on` (lines 58-66).
  - Title `<h2 data-testid="event-card-title">` (line 69).
  - Date string formatted via `formatDate(event.startAt)` (line 71).
  - RSVP line: `{count} / {capacity} RSVPs` if capacity, else `{count} RSVPs` (lines 73-77).

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
- Calendar wrapper `<div data-testid="events-calendar-view">` (`event-list.html:84`) renders `<app-calendar-month [events]="events()" (monthChange)="onCalendarMonthChange($event)" />` (line 85).

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
- Heading: **"New Event"** when `eventId()` falsy, **"Edit Event"** otherwise (line 17).
- Section **"Basics"** (line 21):
  - **Title \*** required (lines 22-31), placeholder **"Event title"**.
  - **Description** textarea (lines 33-43), placeholder **"What's this event about?"**.
- Section **"When"** (line 47):
  - **Start \*** datetime-local input (lines 51-59).
  - **End \*** datetime-local input (lines 61-75); error **"End time must be after start time."** (line 73) when invalid.
  - **Timezone** select listing `timezones` array (lines 78-90).
- Section **"Where"** (line 94):
  - **Location** search `data-testid="event-form-location-search"`, placeholder **"Search venues…"** (lines 95-106).
  - Dropdown of results `data-testid="event-form-location-result-{id}"` (line 111).
  - Checkbox **"Virtual event"** (lines 120-123).
  - When virtual, label **"Virtual URL"** with input type `url`, placeholder **"https://…"** (lines 125-135).
- Section **"Who"** (line 140):
  - **Capacity** number input, min 1, placeholder **"Unlimited"** (lines 141-153).
  - Checkbox **"Requires approval"** (lines 154-157).
- Section **"Recurrence"** (line 161):
  - Repeat select with options **None | Daily | Weekly | Monthly** (lines 164-175).
- Section **"Tags"** (line 180): chips with × removal and an inline add input placeholder **"Add tag…"** (lines 182-196).
- Submit button: text **"Create Event"** (or **"Save Changes"** when editing), `data-testid="event-form-submit"` (lines 200-208), disabled when `!canSubmit()`.
- Sidebar preview `<aside data-testid="event-form-preview">` showing live title, start/end times, timezone, location (or "Virtual" / "Location TBD") (lines 212-230).

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
- Error text **"End time must be after start time."** (line 73).
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
- Title: **"Edit recurring event"** (line 4).
- Body: **"Which events do you want to change?"** (line 5).
- Three buttons (lines 7-9):
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
  - Status chip `<span data-testid="event-status-chip">` (line 11).
  - Virtual indicator with `videocam` icon (lines 14-18).
  - Title `<h1 data-testid="event-detail-title">` (line 20).
  - Share button `<button data-testid="event-share-button" aria-label="Share event">` with `share` icon (lines 22-29).
- Body (lines 33-184):
  - **About** section if description present (lines 36-40), text in `<p data-testid="event-description">`.
  - **Location** section if location present, with `location_on` icon (lines 42-50).
  - Sidebar `event-detail-card` with start/end and optional timezone label `data-testid="event-timezone-label"` (lines 54-67).
  - RSVP card `data-testid="event-rsvp-card"` (line 69):
    - Display **"{count} / {capacity} RSVPs"** or **"{count} RSVPs"**.
    - Status text `data-testid="rsvp-status"` when user has RSVPed; if **Waitlisted** show **`(#{position})`**.
    - Three buttons (lines 86-105): **Going** (`btn-filled`, `data-testid="rsvp-button-yes"`), **Maybe** (`btn-tonal`, `data-testid="rsvp-button-maybe"`), **Can't go** (`btn-outlined`, `data-testid="rsvp-button-no"`).
  - Pending approvals panel for organizers `data-testid="rsvp-panel"` with **Pending Approvals** heading (lines 110-133); each row has **Approve** (`btn-filled`) and **Deny** (`btn-outlined`) buttons.
  - Attendees grid `data-testid="event-attendees-grid"` (line 137) with avatars and an overflow **+N** button (`data-testid="event-attendees-more"`).
  - **Add to calendar** button `data-testid="event-add-to-calendar"` with `calendar_add_on` icon (lines 162-170).
  - **Cancel event** button when organizer and not yet cancelled, `data-testid="event-cancel-button"`, with `cancel` icon (lines 173-181).

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

**Database verification**

- `EventAttendees` collection (in-memory) updated.

**Pass criteria**: state toggles, count updates.

**Severity if failing**: High.

---

### TC-9.11 — Cancel event dialog

**Steps**

1. As organizer click **Cancel event**.

**UI verification**

- Dialog `<div data-testid="event-cancel-dialog">` (`event-detail.html:188`).
- Title **"Cancel event"** (line 195).
- Close `×` icon button (line 196-198).
- Textarea label **"Message to attendees (optional)"**, `data-testid="event-cancel-message"`, placeholder **"Let attendees know why…"** (lines 201-211).
- Buttons (lines 213-220): **"Keep event"** (`btn-outlined`) and **"Yes, cancel"** (`data-testid="event-cancel-confirm"`, `btn-filled`, error-color background).

**Behavior verification**

- API: `POST /api/v1/events/{id}/cancel` (`EventCancelController.cs`).
- Per user guide: attendees with RSVPs are notified.

**Database verification**

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

- Dialog `<div data-testid="event-attendees-dialog">` (`event-detail.html:229`) with title **"Attendees"** (line 235).
- Each entry `<div data-testid="attendee-list-{id}">` shows avatar, name, RSVP status (lines 241-254).

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

- Preview title updates immediately (`data-testid="event-preview-title"`, `event-form.html:214`); empty title shows **"Untitled Event"** (line 215).
- Start time updates `data-testid="event-preview-start-time"` (line 218).
- Location preview shows `locationName()` or **"Virtual"** or **"Location TBD"** (line 227).

**Pass criteria**: preview is reactive.

**Severity if failing**: Medium.
