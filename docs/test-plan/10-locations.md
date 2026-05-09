# Section 10 — Locations

> Mirrors `docs/user-guide.md` §10.

## Pre-conditions

- Signed in.
- Backend `LocationsController` (`backend/src/TheUpperRoom.Api/Locations/LocationsController.cs`) has at least one location.

## Tests

### TC-10.1 — Location list renders

**Steps**

1. Navigate to `/locations`.

**UI verification**

- Header `<header class="locations-header">` with `<h1>Locations</h1>` (`frontend/projects/the-upper-room/src/app/locations/location-list/location-list.html:1-3`).
- **New location** button `data-testid="locations-new-button"`, class `btn-primary`.
- Empty state: `tar-empty-state` with `data-testid="locations-empty-state"`, `icon="location_off"`, `heading="No locations yet"`, `body="Add your first venue or location."`.
- Grid `<div data-testid="locations-grid">`.
- Each card `<article data-testid="location-card">`:
  - Name `<h2 class="location-card__name">`.
  - Archived badge `<span class="location-card__archived-badge">Archived</span>` when `loc.archived`.
  - Address line `{street}, {city}` when present.
  - Capacity line `Capacity: {capacity}` when present.
  - **Delete** button `data-testid="location-delete"`, `btn-danger-text`.

**Behavior verification**

- API: `GET /api/v1/locations`.

**Pass criteria**: structure exact.

**Severity if failing**: High.

---

### TC-10.2 — Create location

**Steps**

1. Click **New location** → `/locations/new`.
2. Fill **Name** = `Community Hall`, optional Street/City/State/Country/Postal/Capacity.
3. Click **Create location**.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/locations/location-form/location-form.html`.
- Heading **"New Location"**.
- Fields with labels and `data-testid`s:
  - **Name *** required, `data-testid="location-name"`.
  - **Street**, `data-testid="location-street"`.
  - **City**, `data-testid="location-city"`.
  - **State / Province**, `data-testid="location-state"`.
  - **Country**, `data-testid="location-country"`.
  - **Postal Code**, `data-testid="location-postal-code"`.
  - **Capacity** number `min="1"`, `data-testid="location-capacity"`. Inline error `data-testid="location-capacity-error"`.
- Buttons: **Cancel** `data-testid="location-cancel"` (`btn-outlined`) and **Create location** `data-testid="location-submit"` (`btn-primary`).

**Behavior verification**

- API: `POST /api/v1/locations` with the form payload.
- Returns `201 Created` with location body.

**State/API verification**

- New row in `LocationsDbContext.Locations`.

**Pass criteria**: 201 response; record persists; navigation to list or detail.

**Severity if failing**: Critical.

---

### TC-10.3 — Validation: Name required

**Steps**

1. Submit with blank name.

**UI verification**

- `<p class="form-error">` shown under Name (`location-form.html:19-20`).
- Submit blocks until valid.

**Pass criteria**: client-side guard fires.

**Severity if failing**: High.

---

### TC-10.4 — Validation: Capacity must be ≥ 1

**Steps**

1. Type `0` or `-5` in **Capacity**.

**UI verification**

- `<p data-testid="location-capacity-error">` appears (`location-form.html:97-99`).

**Pass criteria**: error shows; submit blocked.

**Severity if failing**: Medium.

---

### TC-10.5 — View location detail

**Steps**

1. From list click a card.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/locations/location-detail/location-detail.html`.
- Header: name `<h1 class="location-detail__name">` and optional **Archived** chip.
- Map area: `<img data-testid="location-map-image">` when coordinates resolve to a map URL, otherwise `<div data-testid="location-map-placeholder">` with icon `map` and text **"No coordinates available"**.
- Address paragraph.
- Capacity paragraph.
- Events link: `<button data-testid="location-events-link">{n} events</button>` when count > 0, otherwise span with text **"0 events"** and `--none` modifier.
- Photos carousel: `<div class="location-detail__carousel">` with prev/next chevron buttons `data-testid="location-carousel-prev|next"` and image `data-testid="location-carousel-image"`.
- Photo upload label with `add_photo_alternate` icon and **"Add photo"** text; hidden input `data-testid="location-photo-input"` accepting `image/*`.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-10.6 — Delete location with confirmation

**Steps**

1. From list click **Delete** on a card.

**UI verification**

- Confirm dialog appears (rendered by `<tar-confirm-dialog />` in `app.html:3`). Title and body must clearly indicate the deletion target.

**Behavior verification**

- API: `DELETE /api/v1/locations/{id}` returns `204`.

**State/API verification**

- Location removed from `LocationsDbContext.Locations`.

**Pass criteria**: card disappears and `GET /api/v1/locations/{id}` returns `404`.

**Severity if failing**: Critical (data loss without confirmation).

---

### TC-10.7 — Photo carousel navigation

**Steps**

1. On a location with multiple photos, click the next chevron, then the previous.

**UI verification**

- Image source updates; `alt` text reads **"Photo {n} of {total}"** (`location-detail.html:62`).
- Buttons have `aria-label="Previous photo"` / `"Next photo"`.

**Pass criteria**: cycles through photos.

**Severity if failing**: Medium.

---

### TC-10.8 — Add photo

**Steps**

1. Click the **Add photo** label and pick an image.

**Behavior verification**

- File upload posts to the appropriate endpoint (`backend/src/TheUpperRoom.Api/Uploads/`).
- Photo appears in carousel.

**Pass criteria**: upload succeeds, photo added.

**Severity if failing**: Medium.

---

### TC-10.9 — Click "{n} events" navigates to events filtered by location

**Steps**

1. On a detail page with `eventCount > 0`, click `data-testid="location-events-link"`.

**UI verification**

- Routes to `/events?location={id}` (or similar). Verify `goToEvents()` in `location-detail.ts`.

**Pass criteria**: navigation occurs and filter applies.

**Severity if failing**: Medium.
