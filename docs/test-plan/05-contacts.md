# Section 5 — Contacts

> Mirrors `docs/user-guide.md` §5.

## Pre-conditions

- Signed in as a user with at least `Contact:Read`. For create/edit/delete tests use a user with `Contact:Create` (per route guard at `frontend/projects/the-upper-room/src/app/app.routes.ts:65-70`).
- Backend `_store` (`backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs:23`) seeded with `c1=Alice (Toronto)` and `c2=Bob (Halifax)`.

## Tests

### TC-5.1 — Contact list renders

**Steps**

1. Navigate to `/contacts`.

**UI verification**

- Toolbar:
  - Search input: `<input data-testid="contacts-search" type="search" placeholder="Search contacts…">` (`frontend/projects/the-upper-room/src/app/contacts/contact-list/contact-list.html:2-9`). Note the placeholder uses an ellipsis `…` not three dots.
  - Filter chip: `<button data-testid="contacts-filter-archived">` text **"Archived"** (lines 10-18).
  - Create button (when `canCreate()`): text **"New contact"**, `data-testid="contacts-new-button"` (lines 19-23).
- Grid: `<div data-testid="contacts-grid" class="contact-grid">` (line 41) when not empty.
- Each card: `<div data-testid="contact-card-{name}">` showing avatar (`<tar-avatar [size]="48">`), name, optional title/org, primary phone/email, tag chips, plus an "extra tag count" pill `+N` when more than the visible limit (lines 43-65).

**Behavior verification**

- API: `GET /api/v1/contacts?search=&page=&size=` (`ContactsController.cs:43-65`).

**Database verification**

- Active-city contacts visible. As admin (`X-Test-User-Id: admin`), all contacts visible (`ContactsController.cs:49-51`).

**Pass criteria**: at least the active-city contacts shown; toolbar and grid markup match.

**Severity if failing**: High.

---

### TC-5.2 — Empty state

**Steps**

1. Sign in as a user whose city has no contacts (or temporarily clear the dictionary via API restart).

**UI verification**

- Wrapper `<div data-testid="contacts-empty-state">` (`contact-list.html:27`).
- `tar-empty-state` props: `icon="person_add"`, `heading="No contacts yet"`, `body="Add your first contact to get started."` (lines 28-32).
- Slot button **"New contact"** when `canCreate()` (lines 33-37).

**Pass criteria**: exact icon, heading, body text.

**Severity if failing**: Medium.

---

### TC-5.3 — Search filters list

**Steps**

1. Type **"Ali"** into the search input.

**UI verification**

- List filters to contacts matching the substring (case-insensitive).
- Search debounced/throttled — verify only one network request fires after typing settles.

**Behavior verification**

- API: `GET /api/v1/contacts?search=Ali` returns `Alice`. Server filtering at `ContactsController.cs:53-54`.

**Database verification**

- `Alice` is in the active city (Toronto) — confirm `_store` (`ContactsController.cs:25`).

**Pass criteria**: only matches displayed.

**Severity if failing**: High.

---

### TC-5.4 — Archived chip toggles archived contacts

**Steps**

1. Click **Archived** chip.

**UI verification**

- Chip gains `filter-chip--active` class (`contact-list.html:14`).
- Cards include those with `archived=true`. Each archived card has `contact-card--archived` styling (line 43).

**Behavior verification**

- The current `ContactsController` does **not** persist an `Archived` flag. **[unverified — store has no archived field; archive endpoint is presumably TODO. Verify against backlog before failing.]**

**Pass criteria (when implemented)**: archived contacts visible only when chip active.

**Severity if failing**: High.

---

### TC-5.5 — Desktop paginator

**Steps**

1. Resize to ≥ 768px (md breakpoint, `_mixins.scss:10`).
2. Seed enough contacts that `totalPages() > 1` (e.g. via repeated POSTs).

**UI verification**

- Paginator `<nav data-testid="contacts-paginator" aria-label="Contacts pagination">` (`contact-list.html:78-92`).
- Page-info span (`data-testid="contacts-page-info"`).
- Buttons: `‹ Prev`, numbered pages, `Next ›`. Active page has `paginator__btn--active` class.

**Pass criteria**: clicking page numbers fetches `?page=N&size=…`.

**Severity if failing**: High.

---

### TC-5.6 — Mobile load-more

**Steps**

1. Resize to xs (375px).
2. Have enough contacts for `hasMore() === true`.

**UI verification**

- Sentinel `<div #scrollSentinel class="scroll-sentinel">` for IntersectionObserver (`contact-list.html:72`).
- Button `<button data-testid="contacts-load-more">Load more</button>` (line 74).

**Behavior verification**

- Tapping **Load more** issues `GET /api/v1/contacts?page=2&size=…` and appends rather than replacing.

**Pass criteria**: list grows; previous items remain.

**Severity if failing**: High.

---

### TC-5.7 — Floating action button (mobile)

**Steps**

1. Resize to xs.
2. Verify `<button data-testid="contacts-fab" aria-label="New contact">` (`contact-list.html:98`).

**UI verification**

- FAB renders with a `+` glyph in `<span class="fab__icon">+</span>` (line 99).
- Position: fixed bottom-right per `.fab` SCSS.

**Pass criteria**: FAB visible; aria-label correct.

**Severity if failing**: Medium.

---

### TC-5.8 — Create contact happy path

**Steps**

1. Click **New contact** to navigate to `/contacts/new`.
2. Fill in **First name** = `Charlie`, optional fields as desired.
3. Click **Save**.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/contacts/contact-create/contact-create.html`.
- Save bar: heading **"New Contact"** (line 4), buttons **Cancel** (line 5) and **Save** (line 6) using `tar-button variant="filled"`.
- Field rows include First name (required, `testId="contact-first-name"`), Last name, Pronouns, Title, Organization, Display name override.
- Sections: **Tags** (`tar-tag-selector`), **Phones**, **Emails**, **Addresses** with `Add phone` / `Add email` / `Add address` buttons (lines 100, 127, 139). Each Add button has `variant="outlined"`, `icon="add"`.
- Phone placeholder: **"+1 416 555 0100"** (line 78). Email placeholder: **"email@example.com"** (line 110).
- Unsaved-dot indicator `<span data-testid="contact-unsaved-dot">` toggles `unsaved-dot--visible` when `isDirty()` true (line 3).

**Behavior verification**

- API: `POST /api/v1/contacts` body `{ firstName: "Charlie", … }` (`ContactsController.cs:82-97`).
- Returns `201 Created` with `Location: /api/v1/contacts/{id}` and the contact body (line 96).
- Frontend navigates to `/contacts/{id}`.

**Database verification**

- `_store[id]` (`ContactsController.cs:94`) populated with id (8-char Guid prefix), name (joined first+last unless DisplayName provided), city = current user's city.
- `AuditStore.Entries` (`AuditStore.cs:6`) has new entry: `EntityType="Contact"`, `EntityId=<new id>`, `Action="Create"`, `AfterJson` populated (line 95 of `ContactsController.cs`).

**Pass criteria**: 201 response, store mutation, audit row, navigation.

**Severity if failing**: Critical.

---

### TC-5.9 — Create contact validation: First name required

**Steps**

1. Navigate to `/contacts/new`.
2. Leave **First name** blank.
3. Click **Save**.

**UI verification**

- Inline error visible at `data-testid="contact-error-first-name"` (line 19).

**Behavior verification**

- API: `POST /api/v1/contacts` with empty `firstName` returns `422 Unprocessable Entity` with body `{ "error": "First name is required." }` (`ContactsController.cs:88-89`).

**Pass criteria**: 422 response handled with inline error; submit re-enabled.

**Severity if failing**: High.

---

### TC-5.10 — View contact detail

**Steps**

1. From `/contacts` click a card (e.g. Alice).

**UI verification**

- Header: avatar (`<tar-avatar [size]="96">`), name `<h1>`, optional subtitle `{title} @ {org}` (`contact-detail.html:2-9`).
- Action buttons in `<div class="contact-header__actions">` (lines 10-19): `<tar-share-button />`, **Edit** anchor (`/contacts/{id}/edit`), **Archive** OR **Restore**, **Delete** (`btn-danger`).
- Tab bar with three tabs: **Overview**, **Notes**, **Activity** (`data-testid="contact-tab-overview|notes|activity"`, lines 22-26).
- Overview panel:
  - Phones section heading **"Phones"** with `tel:` links per phone, optional **Primary** badge.
  - Emails section heading **"Emails"** with `mailto:` links.
  - Sidebar: **"Tags"** card (when tags present), **"Linked Partners"** card (placeholder "No partners linked yet.").
- Notes tab loads `<tar-notes [subjectType]="'Contact'" [subjectId]="contactId" />`.
- Activity tab placeholder text: **"Activity coming soon."** (line 82).

**Pass criteria**: every visible string matches.

**Severity if failing**: High.

---

### TC-5.11 — Edit contact updates name

**Steps**

1. From detail click **Edit** (`data-testid="contact-edit-button"`).
2. Change first name to `Alicia`. Click **Save**.

**Behavior verification**

- API: `PUT /api/v1/contacts/{id}` (`ContactsController.cs:99-117`) returns `200 OK` with updated `Contact`.
- Or `PATCH /api/v1/contacts/{id}` for partial update (`ContactsController.cs:119-138`).

**Database verification**

- `_store[id].Name` mutated (`ContactsController.cs:113`).
- Audit row added with `Action="Update"`, both `BeforeJson` and `AfterJson` populated (line 115).

**Pass criteria**: detail page shows new name; audit entry present.

**Severity if failing**: High.

---

### TC-5.12 — Archive contact

**Steps**

1. Open detail.
2. Click **Archive** (`data-testid="contact-archive-button"`).

**UI verification**

- Button label flips to **Restore** (`data-testid="contact-restore-button"`, `contact-detail.html:16`).
- Card on list view gets `contact-card--archived` styling (visible only when Archived chip is on).

**Behavior verification**

- The frontend calls a PATCH to set `archived=true`. **[unverified — backend `Contact` entity has no Archived field in the in-memory `ContactMutable` (`ContactsController.cs:15-21`); confirm whether archival is wired before validating server side.]**

**Pass criteria**: button toggles label; entity reachable via Archived filter.

**Severity if failing**: High.

---

### TC-5.13 — Delete contact

**Steps**

1. On detail click **Delete** (`data-testid="contact-delete-button"`).
2. Confirm in the dialog (`tar-confirm-dialog` rendered from `app.html:3`).

**Behavior verification**

- API: `DELETE /api/v1/contacts/{id}` returns `204 No Content` (`ContactsController.cs:140-153`).

**Database verification**

- `_store` no longer contains the id (`ContactsController.cs:151`).
- Audit row: `Action="Delete"`, `BeforeJson` is the contact JSON (line 150).

**Pass criteria**: contact gone from list; audit row present.

**Severity if failing**: Critical.

---

### TC-5.14 — Permission guard on `/contacts/new`

**Steps**

1. Sign in as a user **without** `Contact:Create` permission.
2. Navigate directly to `/contacts/new`.

**UI verification**

- Routed to `/forbidden` (`app.routes.ts:48`) by `permissionGuard` (`app.routes.ts:68`).
- `Forbidden` component renders.

**Pass criteria**: route blocked; user lands on `/forbidden`.

**Severity if failing**: Critical (RBAC).

---

### TC-5.15 — Card primary phone/email selection

**Steps**

1. Inspect a card whose contact has multiple phones with one marked `primary`.

**UI verification**

- Card displays the phone marked `primary` (helper `primaryPhone(contact)` in `contact-list.ts`).
- Same for email (`primaryEmail`).

**Pass criteria**: only the primary value is shown when multiple exist.

**Severity if failing**: Medium.
