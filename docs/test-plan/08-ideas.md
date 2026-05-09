# Section 8 — Ideas

> Mirrors `docs/user-guide.md` §8.

## Pre-conditions

- Signed in.
- `IdeasDbContext` is available. There is no current development seeder or `POST /api/v1/ideas` create endpoint, so tests that need ideas must seed `Data/ideas.db` or use a test fixture.

## Tests

### TC-8.1 — Idea list renders

**Steps**

1. Navigate to `/ideas`.

**UI verification**

- Header `<header class="ideas-header">` with `<h1 class="ideas-header__title">Ideas</h1>` (`frontend/projects/the-upper-room/src/app/ideas/idea-list/idea-list.html:1-2`).
- Controls:
  - Chip **"My ideas"**, `data-testid="idea-filter-my-ideas"`.
  - Sort select `data-testid="idea-sort-select"` with options **Newest** (`newest`), **Most votes** (`votes`), **Updated** (`updated`).
- Empty state: `tar-empty-state` with `data-testid="idea-list-empty"`, `icon="lightbulb"`, `heading="No ideas yet"`, `body="Be the first to share an idea."`.
- Each card `<article data-testid="idea-card">`:
  - Optional cover image `data-testid="idea-card-cover-{id}"`.
  - Title `<h2>`.
  - Optional description.
  - Footer with status text and **vote button** `<button data-testid="idea-vote-button">`.
  - Vote button has `idea-vote--active` modifier when `idea.hasVoted`.
  - Vote glyph: heart icon literal `favorite` rendered as text.
  - Vote count `data-testid="idea-vote-count"`.

**Behavior verification**

- API: `GET /api/v1/ideas?myIdeas=…&sort=…`.

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

- API: `GET /api/v1/ideas?myIdeas=true`.

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

- API: `POST /api/v1/ideas/{id}/vote` toggles the current user's vote.
- Optimistic UI: UI updates instantly; reverts on error.

**State/API verification**

- Vote record is added/removed in `IdeasDbContext.Votes`.

**Pass criteria**: vote toggles and persists.

**Severity if failing**: High.

---

### TC-8.5 — Submit a new idea

**Steps**

1. Look for a **New idea** entry point on `/ideas`.

**Behavior verification**

- Current `idea-list.html` does not render a New Idea button.
- Current `IdeasController` does not expose `POST /api/v1/ideas`.
- Current backend does not write idea audit entries.

**Pass criteria**: current implementation has no idea-submission flow. Mark blocked/failed if submission is required.

**Severity if failing**: High.

---

### TC-8.6 — Idea detail page

**Steps**

1. Click any idea card to open `/ideas/{id}`.

**UI verification**

- Optional hero `<img data-testid="idea-hero-image">` (`frontend/projects/the-upper-room/src/app/ideas/idea-detail/idea-detail.html:3-9`).
- Header:
  - Title `<h1 data-testid="idea-detail-title">`.
  - Proposer text `data-testid="idea-detail-proposer"`.
  - Status chip `<span data-testid="idea-status-chip">`.
  - Cover-upload control: label with text **"Cover"** and a hidden file input accepting `image/*`, `data-testid="idea-cover-upload-button"` and `data-testid="idea-cover-input"`.
  - Vote button `data-testid="idea-detail-vote"` with same active/aria semantics.
  - **Submit for review** button `data-testid="idea-submit-button"` shown only when `canSubmit()`.
  - Status select for leads: `data-testid="idea-status-select"` with all `statusOptions` from the component.
  - **Edit** button `data-testid="idea-detail-edit"`.
- Body: when not editing, `<div data-testid="idea-detail-body">` rendered with `[innerHTML]="i.bodyHtmlSanitized"`. Sanitization comes from `backend/src/TheUpperRoom.Api/Sanitization/`.
- Edit mode: `<tar-markdown-editor>` plus **Save** and **Cancel** buttons.

**Pass criteria**: all conditional blocks render correctly; status chip text matches the value (e.g. `Proposed`, `In progress`, `Shipped`, `Rejected`).

**Severity if failing**: High.

---

### TC-8.7 — Linked partners on idea

**Steps**

1. On idea detail click **Link partner** (`data-testid="idea-link-partner-button"`).
2. Type into the popup search `data-testid="idea-partner-search"` (placeholder **"Search partners…"**).
3. Click a result `data-testid="idea-partner-result-{name}"` (`idea-detail.html:114-119`).

**UI verification**

- Linked partner card `<div data-testid="idea-partner-card-{id}">` appears in `idea-partners__grid`.
- Each linked partner has an unlink button `data-testid="idea-unlink-partner-{id}"` with icon `link_off` and `aria-label="Unlink partner"`.

**Pass criteria**: linking and unlinking both work.

**Severity if failing**: Medium.

---

### TC-8.8 — Comments on idea

**Steps**

1. On idea detail, check whether a comments section is rendered.

**Current code verification**

- `idea-detail.html` does not render a comments section.
- No idea comments API endpoint exists in `IdeasController`.

**Pass criteria**: current implementation has no idea comments flow. Mark blocked/failed if comments are required.

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
