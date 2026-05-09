# Section 6 — Partners

> Mirrors `docs/user-guide.md` §6.

## Pre-conditions

- Signed in.
- Backend partner data is still an in-memory static list in `PartnersController`, seeded with `p-seed = Grace Church`.
- Partner-contact links are still an in-memory static list in `PartnerContactsController`.

## Tests

### TC-6.1 — Partner list renders

**Steps**

1. Navigate to `/partners`.

**UI verification**

- Toolbar (`frontend/projects/the-upper-room/src/app/partners/partner-list/partner-list.html:1-24`):
  - Search: `<input data-testid="partners-search" type="search" placeholder="Search partners…">`.
  - Archived chip: text **"Archived"**, `data-testid="partners-filter-archived"`.
  - **New partner** button when `canCreate()`, `data-testid="partners-new-button"`.
- Grid: `<div data-testid="partners-grid">`.
- Each card `<div data-testid="partner-card-{name}">`:
  - Logo `<img>` if `partner.logo` else letter avatar `<span class="partner-card__initial">{first letter}</span>`.
  - Name.
  - Website host via `websiteDomain(partner.website)` — verify URL is stripped to host.
  - Contact count: `{n} contact` or `{n} contacts` per pluralization.
  - Tag chips with overflow `+N` chip.
- Archived cards have `partner-card--archived` modifier class.

**Behavior verification**

- API: `GET /api/v1/partners?search=&archived=`.
- The backend currently does not implement `page` or `size` for partners.

**Pass criteria**: structure, copy, plural form match.

**Severity if failing**: High.

---

### TC-6.2 — Empty state

**Steps**

1. Sign in to a city with no partners.

**UI verification**

- `<div data-testid="partners-empty-state">` (`partner-list.html:27`).
- `tar-empty-state` props: `icon="domain_disabled"`, `heading="No partners yet"`, `body="Add your first partner to get started."`.
- Button **"New partner"**.

**Pass criteria**: exact strings.

**Severity if failing**: Medium.

---

### TC-6.3 — Floating action button (mobile)

**Steps**

1. Resize to xs.

**UI verification**

- `<button data-testid="partners-fab" aria-label="New partner">` (`partner-list.html:80`) with `+` glyph.

**Pass criteria**: visible.

**Severity if failing**: Medium.

---

### TC-6.4 — Search filters list

**Steps**

1. Type a partner name fragment.

**UI verification**

- List filters; search input value bound to `searchQuery()` (`partner-list.html:8`).

**Behavior verification**: API fetched with `?search=…`.

**Pass criteria**: matching cards only.

**Severity if failing**: High.

---

### TC-6.5 — Create partner

**Steps**

1. Click **New partner** → `/partners/new`.
2. Fill **Name** = `Acme Inc`, **Website** = `https://acme.example`.
3. Click **Save**.

**UI verification**

- Save bar: heading **"New Partner"** (`partner-create.html:4`), unsaved-dot (`partner-unsaved-dot`), Cancel and **Save** buttons.
- Section heading **"Basic info"**.
- Name field: label **"Name *"** (asterisk denotes required), `data-testid="partner-name"`, `autocomplete="organization"`. Inline error slot `data-testid="partner-error-name"`.
- Website field: label **"Website"**, placeholder **"https://example.org"**, `data-testid="partner-website"`, type `url`. When valid, an external-link icon appears: `<a data-testid="partner-visit-link" target="_blank">` opening in new tab. Icon `open_in_new`.
- Form banner area `<div data-testid="partner-form-banner">` shown when `formBanner()` set.

**Behavior verification**

- API: `POST /api/v1/partners` with body containing `name` (and optional `website`, `logo`, `tags`).
- Success returns `201 Created`; navigate to `/partners/{id}`.

**State/API verification**

- New partner is stored in the in-memory `PartnersController` static collection until API restart.
- Current backend does not write partner audit entries.

**Pass criteria**: static store mutates and navigation happens.

**Severity if failing**: Critical.

---

### TC-6.6 — Logo upload

**Steps**

1. On `/partners/new`, confirm whether a logo upload control is present.

**Current code verification**

- `partner-create.html` does not render a logo upload control.
- `CreatePartnerRequest` can carry a `logo` value, but the current `PartnerDto` response does not expose a logo property.

**Pass criteria**: current implementation has no create-time logo upload. Mark blocked/failed if logo upload is a product requirement.

**Severity if failing**: Medium.

---

### TC-6.7 — Partner detail header

**Steps**

1. Click any partner card.

**UI verification**

- Header `<header data-testid="partner-detail-header">` (`partner-detail.html:4`).
- Avatar: `<img data-testid="partner-logo">` when logo, otherwise `<span data-testid="partner-letter-avatar">` with first letter.
- Name `<h1 data-testid="partner-detail-name">`.
- Website link `<a data-testid="partner-website-link" target="_blank" rel="noopener noreferrer">` with `open_in_new` icon and host domain text.
- Action buttons: **Edit** anchor (`btn-outlined`, `data-testid="partner-edit-button"`), **Archive** OR **Restore**, **Delete** (`btn-danger`, opens delete dialog).
- Tab bar `<nav class="partner-tabs" role="tablist">` with Overview / Contacts / Activity.

**Pass criteria**: structure exact.

**Severity if failing**: High.

---

### TC-6.8 — Overview tab content

**Steps**

1. On detail, ensure Overview is selected.

**UI verification**

- Description: `<div data-testid="partner-description">` (`partner-detail.html:111`). When empty, class `partner-description--empty` and text **"No description yet."**.
- Addresses section heading **"Addresses"** when present.
- Social links section heading **"Social links"** when present; each rendered as `<a data-testid="social-chip-{platform}" target="_blank" rel="noopener noreferrer">`.

**Pass criteria**: copy and conditional rendering correct.

**Severity if failing**: Medium.

---

### TC-6.9 — Contacts tab links a contact

**Steps**

1. Click **Contacts** tab.
2. Click **Link contact** (in `<app-partner-contacts-tab>`, `partner-contacts-tab.html`).
3. In the dialog (`<app-link-contact-dialog>` per `frontend/projects/the-upper-room/src/app/partners/link-contact-dialog/link-contact-dialog.html`), search for a contact, select, set role, click **Link**.

**UI verification**

- Dialog: heading **"Link contact"**.
- Search field: label **"Search contacts"**, placeholder **"Type a name…"**, `data-testid="link-contact-search"`.
- Result items `<li data-testid="link-contact-result-{name}">`.
- Role field: label **"Role"**, placeholder **"e.g. Primary Contact"**, `data-testid="link-contact-role"`.
- Buttons: **Cancel** (`data-testid="link-contact-cancel"`, `btn-outlined`) and **Link** (`data-testid="link-contact-confirm"`, `btn-filled`, disabled until a contact is selected).
- Inline error: `<div data-testid="link-contact-error">` when API returns conflict etc.

**Behavior verification**

- API: `POST /api/v1/partners/{partnerId}/contacts` (`backend/src/TheUpperRoom.Api/Partners/PartnerContactsController.cs`) with body `{ contactId, role }`.

**State/API verification**

- Link is added to `PartnerContactsController`'s in-memory static `_links` list.
- The created linked-contact display name is currently synthesized as `Contact {contactId}`.

**Pass criteria**: link appears in contacts tab; dialog closes.

**Severity if failing**: High.

---

### TC-6.10 — Unlink a contact

**Steps**

1. Inside Contacts tab, click the unlink/remove button next to a linked contact.

**UI verification**

- Per user guide §6.3: an `×` button beside the contact's name removes the link. Verify in `partner-contacts-tab.html` for exact `data-testid` and confirm dialog (if any).

**Behavior verification**

- API: `DELETE /api/v1/partners/{partnerId}/contacts/{contactId}` (verify in `PartnerContactsController.cs`).

**Pass criteria**: contact removed from the partner's list; the contact entity itself remains.

**Severity if failing**: High.

---

### TC-6.11 — Edit partner

**Steps**

1. From detail click **Edit** (`data-testid="partner-edit-button"`) → `/partners/{id}/edit`.
2. Change name, save.

**Behavior verification**

- API: `PUT /api/v1/partners/{id}`.
- Current backend does not write partner audit entries.

**Pass criteria**: detail shows updated value.

**Severity if failing**: High.

---

### TC-6.12 — Archive partner

**Steps**

1. On detail click **Archive** (`data-testid="partner-archive-button"`).

**UI verification**

- Button flips to **Restore** (`data-testid="partner-restore-button"`).
- Card on list shows `partner-card--archived` class.

**Pass criteria**: state toggles.

**Severity if failing**: High.

---

### TC-6.13 — Delete partner with name-confirmation

**Steps**

1. On detail click **Delete** (`data-testid="partner-delete-button"`).
2. Dialog opens with title **"Delete partner?"** (`partner-detail.html:44`).
3. Body: **"Type {name} to confirm permanent deletion."**.
4. Type the partner's name into `data-testid="confirm-typed-input"`.
5. Confirm button (`btn-danger`, text **Delete**) becomes enabled when text matches `p.name`.
6. Click **Delete**.

**Behavior verification**

- API: `DELETE /api/v1/partners/{id}`.
- Current backend removes only the partner from the static partner list. Partner-contact links are stored separately in `PartnerContactsController` and are not automatically removed by `DELETE /api/v1/partners/{id}`.

**State/API verification**

- Partner gone from the static partner store; linked contact entities remain in `ContactsDbContext`.

**Pass criteria**: dialog enforces name-typing and partner deletion returns `204`. File a defect if link cleanup is required.

**Severity if failing**: Critical.

---

### TC-6.14 — Cannot-delete branch (archive instead)

**Steps**

1. Trigger a delete on a partner the backend refuses (e.g. has dependent records).

**UI verification**

- Dialog switches to title **"Cannot delete"** with `deleteBlockedMessage()` body (`partner-detail.html:65-72`).
- Buttons: **Cancel**, **Archive instead** (`btn-filled`, calls `archiveInstead()`).

**Pass criteria**: alternate flow available.

**Severity if failing**: Medium.
