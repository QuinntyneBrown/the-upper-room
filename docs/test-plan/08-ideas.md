# Section 8 — Ideas

> Mirrors `docs/user-guide.md` §8.

## Pre-conditions

- Signed in.
- Backend `IdeasController` (`backend/src/TheUpperRoom.Api/Ideas/IdeasController.cs`) has at least one seeded idea.

## Tests

### TC-8.1 — Idea list renders

**Steps**

1. Navigate to `/ideas`.

**UI verification**

- Header `<header class="ideas-header">` with `<h1 class="ideas-header__title">Ideas</h1>` (`frontend/projects/the-upper-room/src/app/ideas/idea-list/idea-list.html:1-2`).
- Controls (lines 3-23):
  - Chip **"My ideas"**, `data-testid="idea-filter-my-ideas"` (lines 4-12).
  - Sort select `data-testid="idea-sort-select"` with options **Newest** (`newest`), **Most votes** (`votes`), **Updated** (`updated`) (lines 13-22).
- Empty state: `tar-empty-state` with `data-testid="idea-list-empty"`, `icon="lightbulb"`, `heading="No ideas yet"`, `body="Be the first to share an idea."` (lines 27-32).
- Each card `<article data-testid="idea-card">` (line 36):
  - Optional cover image `data-testid="idea-card-cover-{id}"`.
  - Title `<h2>` (line 45).
  - Optional description (line 47).
  - Footer with status text (line 50) and **vote button** `<button data-testid="idea-vote-button">` (line 52-61).
  - Vote button has `idea-vote--active` modifier when `idea.hasVoted`.
  - Vote glyph: heart icon literal `favorite` rendered as text (line 59).
  - Vote count `data-testid="idea-vote-count"` (line 60).

**Behavior verification**

- API: `GET /api/v1/ideas?my=…&sort=…`.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-8.2 — My-ideas filter

**Steps**

1. Click **My ideas**.

**UI verification**

- Chip becomes `filter-chip--active`.
- Only ideas authored by the current user remain.

**Behavior verification**

- API: `GET /api/v1/ideas?my=true` (or equivalent).

**Pass criteria**: list filtered.

**Severity if failing**: High.

---

### TC-8.3 — Sort dropdown

**Steps**

1. Cycle through **Newest**, **Most votes**, **Updated**.

**UI verification**

- Options have exact values `newest | votes | updated`.
- Order of cards changes accordingly.

**Behavior verification**

- API call includes `?sort=newest|votes|updated`.

**Pass criteria**: ordering is correct for each option.

**Severity if failing**: High.

---

### TC-8.4 — Vote / unvote

**Steps**

1. Click the vote button on an idea card whose `hasVoted` is false.
2. Click again to remove.

**UI verification**

- Count increments (`data-testid="idea-vote-count"`); button gains `idea-vote--active`. `aria-label` flips between **"Vote for this idea"** and **"Remove vote"** (`idea-list.html:57`).

**Behavior verification**

- API: `POST /api/v1/ideas/{id}/votes` and `DELETE /api/v1/ideas/{id}/votes` (verify in `IdeasController.cs`).
- Optimistic UI: UI updates instantly; reverts on error.

**Database verification**

- Vote record added/removed in the in-memory store.

**Pass criteria**: vote toggles and persists.

**Severity if failing**: High.

---

### TC-8.5 — Submit a new idea

**Steps**

1. Click **New idea** (per user guide §8.2). **[unverified — `idea-list.html` does not contain a New-idea button. Verify whether submission is initiated from the FAB elsewhere or via `idea-detail` page; file a defect if missing.]**

**Behavior verification**

- API: `POST /api/v1/ideas`.
- Audit row: `EntityType="Idea"`, `Action="Create"`.

**Pass criteria (when implemented)**: idea appears at the top of list (sort=newest).

**Severity if failing**: High.

---

### TC-8.6 — Idea detail page

**Steps**

1. Click any idea card to open `/ideas/{id}`.

**UI verification**

- Optional hero `<img data-testid="idea-hero-image">` (`frontend/projects/the-upper-room/src/app/ideas/idea-detail/idea-detail.html:3-9`).
- Header (lines 12-71):
  - Title `<h1 data-testid="idea-detail-title">` (line 14).
  - Proposer text `data-testid="idea-detail-proposer"` (line 15).
  - Status chip `<span data-testid="idea-status-chip">` (line 16).
  - Cover-upload control: label with text **"Cover"** and a hidden file input accepting `image/*`, `data-testid="idea-cover-upload-button"` and `data-testid="idea-cover-input"` (lines 19-29).
  - Vote button `data-testid="idea-detail-vote"` with same active/aria semantics (lines 30-40).
  - **Submit for review** button `data-testid="idea-submit-button"` shown only when `canSubmit()` (lines 42-49).
  - Status select for leads: `data-testid="idea-status-select"` (lines 51-61) with all `statusOptions` from the component.
  - **Edit** button `data-testid="idea-detail-edit"` (lines 64-69).
- Body: when not editing, `<div data-testid="idea-detail-body">` rendered with `[innerHTML]="i.bodyHtmlSanitized"` (line 76). Sanitization comes from `backend/src/TheUpperRoom.Api/Sanitization/`.
- Edit mode: `<tar-markdown-editor>` (line 80) plus **Save** and **Cancel** buttons.

**Pass criteria**: all conditional blocks render correctly; status chip text matches the value (e.g. `Proposed`, `In progress`, `Shipped`, `Rejected`).

**Severity if failing**: High.

---

### TC-8.7 — Linked partners on idea

**Steps**

1. On idea detail click **Link partner** (`data-testid="idea-link-partner-button"`).
2. Type into the popup search `data-testid="idea-partner-search"` (placeholder **"Search partners…"**).
3. Click a result `data-testid="idea-partner-result-{name}"` (`idea-detail.html:114-119`).

**UI verification**

- Linked partner card `<div data-testid="idea-partner-card-{id}">` appears in `idea-partners__grid` (lines 130-150).
- Each linked partner has an unlink button `data-testid="idea-unlink-partner-{id}"` with icon `link_off` and `aria-label="Unlink partner"`.

**Pass criteria**: linking and unlinking both work.

**Severity if failing**: Medium.

---

### TC-8.8 — Comments on idea

**Steps**

1. On idea detail scroll to comments section. **[unverified — `idea-detail.html` does not include a comments section. The user guide §8.4 references one. Either it is rendered by `<tar-markdown-editor>` content or comments live in a separate component not yet wired in. File a defect or update the guide.]**

**Pass criteria (when implemented)**: comment posts appear immediately, optimistic UI rolls back on error.

**Severity if failing**: Medium.

---

### TC-8.9 — Status chip styling per status

**Steps**

1. View ideas with different status values.

**UI verification**

- `<span data-testid="idea-status-chip">` text equals the status value verbatim (e.g. `Proposed`).
- Style class derives from the status — verify in `idea-detail.scss` that each status has a distinct color token.

**Pass criteria**: chip color differs by status.

**Severity if failing**: Low.
