# Section 13 — Global Search

> Mirrors `docs/user-guide.md` §13.

## Pre-conditions

- Signed in.
- At least one record per searchable entity (contact, partner, event, idea, location).

## Tests

### TC-13.1 — Open search via Ctrl+K / ⌘+K

**Steps**

1. From any authenticated route press **Ctrl+K** (Windows/Linux) or **⌘+K** (Mac).

**UI verification**

- Overlay appears: `<div data-testid="global-search-dialog" class="global-search-backdrop">` (`frontend/projects/the-upper-room/src/app/search/global-search.html:1`).
- Mounted from `app-shell.html:5` (`@if (searchOpen()) { <app-global-search …/> }`).
- Search box `<input data-testid="global-search-input" type="text">` placeholder **"Search contacts, partners, events…"** (lines 6-15).
- Search icon `search` to the left of the input (line 4).

**Pass criteria**: overlay opens on shortcut from any route.

**Severity if failing**: High.

---

### TC-13.2 — Type-to-search across entities

**Steps**

1. Type a fragment that matches at least one of: contact name, partner name, event title, idea title, location name.

**UI verification**

- Result list `<ul class="global-search__results" role="listbox">` (`global-search.html:19`).
- Each item `<li data-testid="search-result-{id}" role="option">` (line 21) with type icon (`typeIcon(result.type)`, line 28), title, optional subtitle, and a type label badge (line 35).

**Behavior verification**

- API: `GET /api/v1/search?q=…` (verify in `backend/src/TheUpperRoom.Api/Search/`).
- Results union across entity types.

**Pass criteria**: results from at least 2 entity types render for a broad query.

**Severity if failing**: High.

---

### TC-13.3 — Arrow navigation and Enter

**Steps**

1. Type a query that returns ≥ 2 results.
2. Press **↓** to highlight next, **↑** for previous.
3. Press **Enter** on the highlighted result.

**UI verification**

- Active item has `global-search__result--active` modifier (`global-search.html:23`).
- Enter calls `navigate(result)` and routes to the entity's detail page.

**Pass criteria**: keyboard nav works; Enter routes to the active result.

**Severity if failing**: High.

---

### TC-13.4 — Click to open

**Steps**

1. With results visible, click any item.

**UI verification**

- Routes to the result entity (`(click)="navigate(result)"`, `global-search.html:26`).
- Overlay closes.

**Pass criteria**: navigation occurs.

**Severity if failing**: Medium.

---

### TC-13.5 — Esc closes the dialog

**Steps**

1. With overlay open, press **Esc**.

**UI verification**

- Overlay unmounts (`searchOpen()` set false in `AppShell`).
- Focus returns to the previously focused element.

**Pass criteria**: closes; focus restored.

**Severity if failing**: Medium.

---

### TC-13.6 — Empty state

**Steps**

1. Type a string with no matches (e.g. `xyz123notarealsearch`).

**UI verification**

- `<div data-testid="global-search-empty">` (`global-search.html:42`).
- Icon `search_off` (line 43).
- Title **"No matches"** (line 44).
- Sub text **"Try different keywords or check your filters."** (line 45).

**Pass criteria**: copy and icon exact.

**Severity if failing**: Low.

---

### TC-13.7 — Backdrop click closes overlay

**Steps**

1. Open search.
2. Click the dimmed area outside the dialog box.

**UI verification**

- The backdrop click handler short-circuits inside the dialog itself (`global-search.html:1`); clicking the backdrop closes the search through `(click)="closeSearch()"` on the wrapper in `app-shell.html:5`.

**Pass criteria**: closes on outside click.

**Severity if failing**: Medium.

---

### TC-13.8 — Result type icons

**Steps**

1. Search a term that returns a contact, partner, event, idea, location result each.

**UI verification**

- Each result shows the appropriate Material icon via `typeIcon(result.type)` from the component class (`frontend/projects/the-upper-room/src/app/search/global-search.ts`).
- Type label appears at right of row (`{result.type}`, `global-search.html:35`).

**Pass criteria**: each entity shows its conventional icon (e.g. `contacts` for Contact, `domain` or similar for Partner).

**Severity if failing**: Low.
