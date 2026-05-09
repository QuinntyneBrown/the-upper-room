# Section 14 — Admin Features

> Mirrors `docs/user-guide.md` §14.

## Pre-conditions

- Two test users: one `SystemAdmin` (e.g. header `X-Test-User-Id: admin`) and one regular user.
- Admin pages are guarded by `roleGuard` (`frontend/projects/the-upper-room/src/app/app.routes.ts:96-119`).

## Tests

### TC-14.1 — RBAC: admin pages hidden for non-admins

**Steps**

1. Sign in as a non-admin user.
2. Attempt to navigate directly to `/admin/users`, `/admin/cities`, `/admin/tags`, `/admin/audit`.

**UI verification**

- Each navigation routes to `/forbidden` via the `roleGuard` (`app.routes.ts:99, 105, 111, 117`).
- The `Forbidden` component renders.
- Side drawer / nav: admin entries hidden when the user lacks `SystemAdmin` (verify in `app-shell` nav data — currently the drawer is empty per `app-shell.html:54-55`; if/when populated, RBAC must filter out admin links).

**Pass criteria**: every admin path redirects to forbidden for non-admins.

**Severity if failing**: Critical (privilege escalation).

---

### TC-14.2 — Tags admin renders

**Steps**

1. Sign in as admin and navigate to `/admin/tags`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/tags/tag-list/tag-list.html`.
- Heading **"Tags"** (line 4).
- Create form (lines 6-23):
  - **Tag name** field, `data-testid="tag-name"`, error slot `data-testid="tag-error-name"`.
  - **Color** select, `data-testid="tag-color"`.
  - **Add tag** button, `data-testid="tag-create"`, `tar-button variant="filled"`.
- Tag groups: `<section data-testid="tag-group-{color}">` with the color label as heading (lines 26-28).
- Each chip `<div data-testid="tag-chip-{id}" data-color="{color}">` containing label, **Edit** (`data-testid="tag-edit-{id}"`) and **Delete** (`data-testid="tag-delete-{id}"`, `color="warn"`) buttons (lines 30-67).

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-14.3 — Create a tag

**Steps**

1. Type **"Priority"** in name, pick a color, click **Add tag**.

**Behavior verification**

- API: `POST /api/v1/tags` body `{ name, color }`.
- Response includes new tag with id.

**Database verification**

- Tag added to in-memory tag store.
- Audit row: `EntityType="Tag"`, `Action="Create"`.

**Pass criteria**: chip appears under correct color group.

**Severity if failing**: High.

---

### TC-14.4 — Edit tag color

**Steps**

1. Click **Edit** on any tag.
2. Change color via the inline select `data-testid="tag-edit-color-{id}"` (line 38).
3. Click **Save** (`data-testid="tag-save-edit-{id}"`).

**Behavior verification**

- API: `PATCH /api/v1/tags/{id}` body `{ color }`.
- Audit row: `Action="Update"`.

**Pass criteria**: chip moves to the new color group.

**Severity if failing**: High.

---

### TC-14.5 — Delete tag with cascade

**Steps**

1. Pre-condition: assign a tag to a Contact/Partner/Card.
2. Click **Delete** on the tag.

**Behavior verification**

- API: `DELETE /api/v1/tags/{id}` returns `204`.
- Per user guide §14.1: tag is also removed from every entity referencing it.

**Database verification**

- Tag gone from store.
- Affected Contact/Partner/Card no longer reference the tag id (verify by GET on those entities).
- Audit row: `EntityType="Tag"`, `Action="Delete"` (and arguably one Update per affected entity).

**Pass criteria**: tag removed everywhere.

**Severity if failing**: Critical (data integrity).

---

### TC-14.6 — Cities admin renders

**Steps**

1. Navigate to `/admin/cities`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/cities/cities-admin/cities-admin.html`.
- Heading **"Cities"** (line 3).
- **New city** button `data-testid="cities-new"` with `add` icon, `tar-button variant="filled"` (lines 4-6).
- Create form (when `creating()`, lines 9-36):
  - **Name** field `data-testid="cities-name"` with hint **"Slug preview: {slug}"** (line 13).
  - **Country** field `data-testid="cities-country"` (lines 18-23).
  - Form error `<p data-testid="cities-form-error">` (line 25).
  - Form actions with Save (`saveTestId="cities-save"`).
- Table `<table class="cities-admin__table">` with headers **Name | Slug | Country | Status | (actions)** (lines 38-46).
- Each row `<tr data-testid="city-row-{slug}">` with archive button `data-testid="city-archive-{slug}"` when active.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-14.7 — Slug preview

**Steps**

1. Click **New city**.
2. Type **"New York"** in **Name**.

**UI verification**

- Hint under the name field shows **"Slug preview: new-york"** (or whatever `slugPreview()` computes — verify in `cities-admin.ts`).

**Pass criteria**: slug updates as name typed.

**Severity if failing**: Medium.

---

### TC-14.8 — Create a city

**Steps**

1. Fill name + country, click **Save**.

**Behavior verification**

- API: `POST /api/v1/cities`.
- Audit row `EntityType="City"`, `Action="Create"`.

**Database verification**

- New city in `Cities` collection (verify in `backend/src/TheUpperRoom.Api/Cities/`).

**Pass criteria**: row appears in table; available in city pickers.

**Severity if failing**: High.

---

### TC-14.9 — Archive a city

**Steps**

1. Click **Archive** on a city row.

**UI verification**

- Status column flips to **"Archived"** (line 53).
- Per user guide §14.2: archived cities no longer appear in city pickers — verify by opening any place that has a city dropdown (sign-up, profile).

**Behavior verification**

- API: `POST /api/v1/cities/{id}/archive` (or PATCH).
- Audit row `Action="Archive"`.

**Pass criteria**: status reflects; pickers exclude.

**Severity if failing**: High.

---

### TC-14.10 — Users admin: list and search

**Steps**

1. Navigate to `/admin/users`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/users/user-list/user-list.html`.
- Heading **"Users"** (line 3).
- Toolbar (lines 9-29): search field `data-testid="user-search"` (placeholder **"Search users"**) and role-filter chips `data-testid="user-filter-{role}"`.
- **Invite user** button `data-testid="user-invite"` with `person_add` icon (lines 4-6).
- Empty state `data-testid="user-empty"` icon `contacts`, heading **"No users found"**, body **"Try adjusting your filters or invite a new user."** (lines 32-37).
- Table headers: **Name | Email | Role | City | Status | Last sign-in** (lines 41-48).
- Each row `<tr data-testid="user-row-{email}">` (line 53).
- Paginator `<footer data-testid="user-paginator">` with **Page size:** label, select `data-testid="user-page-size"` options 25/50/100, plus **{total} total** (lines 69-82).

**Pass criteria**: every header and label exact.

**Severity if failing**: High.

---

### TC-14.11 — Open user detail drawer

**Steps**

1. Click any user row.

**UI verification**

- `<tar-user-detail-drawer>` opens (`user-list.html:93-98`) with the selected user's details.
- Drawer should expose role and status edit controls (verify exact field set in the drawer template).

**Pass criteria**: drawer opens with selected user.

**Severity if failing**: High.

---

### TC-14.12 — Invite a new user

**Steps**

1. Click **Invite user**.
2. In `<tar-invite-user-dialog>` enter an email, choose a role and city.
3. Click **Send invitation**.

**Behavior verification**

- API: `POST /api/v1/users/invitations` body `{ email, role, city }`.
- Inline `inviteEmailError()` (`user-list.html:86`) renders if API returns validation error (e.g. duplicate).
- Email enqueued in `MailStore` (`backend/src/TheUpperRoom.Api/Notifications/MailStore.cs`).

**Database verification**

- New `Invitation` record (in-memory or via `InvitationConfiguration` entity).

**Pass criteria**: invitation persists; recipient can use the link to land on `/invitations/accept`.

**Severity if failing**: Critical.

---

### TC-14.13 — Audit log renders

**Steps**

1. Navigate to `/admin/audit`.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/admin/audit-log/audit-log.html`.
- Heading **"Audit Log"** (line 2).
- Filter row (lines 5-38):
  - **Actor** input `data-testid="audit-filter-actor"`, placeholder **"Actor"**.
  - **Entity type** input `data-testid="audit-filter-entity-type"`, placeholder **"Entity type"**.
  - **Action** select `data-testid="audit-filter-action"` with options including **"All actions"** when value is empty (line 29).
  - **Apply** button `data-testid="audit-filter-apply"`, `btn-primary` (lines 32-37).
- Empty state `<p data-testid="audit-log-empty">No audit entries found.</p>` (line 41).
- Table `<table data-testid="audit-log-table">` with headers **Timestamp | Actor | Entity Type | Entity ID | Action** (lines 45-51).
- Pagination footer with **Previous** (`data-testid="audit-page-prev"`), **Page {n}**, and **Next** (`data-testid="audit-page-next"`) (lines 66-83).

**Pass criteria**: layout exact.

**Severity if failing**: High.

---

### TC-14.14 — Audit log filtering

**Steps**

1. Type a filter value (actor) and click **Apply**.

**Behavior verification**

- API: `GET /api/v1/admin/audit?actor=…&entityType=…&action=…&page=…&size=…` (verify in `backend/src/TheUpperRoom.Api/Audit/AuditController.cs`).
- Underlying source is the static list `AuditStore.Entries` (`backend/src/TheUpperRoom.Api/Audit/AuditStore.cs:6`) populated by `AuditStore.Record(...)` calls throughout other controllers.

**Database verification**

- After performing some mutations elsewhere (e.g. creating a contact) the corresponding row appears here with `EntityType="Contact"`, `Action="Create"` etc.

**Pass criteria**: filtered results match; empty state appears for a no-match query.

**Severity if failing**: High.

---

### TC-14.15 — Audit log pagination

**Steps**

1. With more than `pageSize` entries, click **Next** then **Previous**.

**UI verification**

- **Previous** disabled when `page() === 1`; **Next** disabled when `page() * pageSize >= total()` (`audit-log.html:71, 79`).
- Page label updates: **"Page {n}"**.

**Pass criteria**: pagination controls behave correctly at boundaries.

**Severity if failing**: Medium.
