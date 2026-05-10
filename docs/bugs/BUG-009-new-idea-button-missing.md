# BUG-009 — Idea list page has no "New idea" button (RESOLVED 2026-05-10)

**Severity**: Critical
**Component**: frontend + backend
**Found in test**: TC-8.5 (Submit a new idea)
**User-guide refs**: §8.2
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10 — IdeasController now exposes `POST /api/v1/ideas` (xUnit covered: create-draft + 422-on-blank-title); idea-list toolbar renders `idea-new-button` + inline title/description form that POSTs and prepends to the list. TC-8.5 PASS.

## Description

User guide §8.2 says: "Click **New idea**." There is no New-idea button on the idea list page, so users cannot submit new ideas through the documented flow.

## Reproduction

1. Sign in.
2. Navigate to `/ideas`.
3. Look at the page header / toolbar / FAB.
4. Observe: only a **My ideas** filter chip and a sort `<select>`. No **New idea** button.

## Expected

A primary action — typically `<tar-button variant="filled">New idea</tar-button>` in the header, or a `<tar-fab>` for mobile — that opens the new-idea form (or routes to `/ideas/new`).

## Actual

`frontend/projects/the-upper-room/src/app/ideas/idea-list/idea-list.html` (66 lines) header is:

```html
<header class="ideas-header">
  <h1 class="ideas-header__title">Ideas</h1>
  <div class="ideas-header__controls">
    <button … data-testid="idea-filter-my-ideas" …>My ideas</button>
    <select data-testid="idea-sort-select" …> … </select>
  </div>
</header>
```

No "New" string, no FAB, no `(click)` handler that opens a creation form. There is no `/ideas/new` route in `app.routes.ts` either.

## Suggested fix

1. Add a primary button to the `ideas-header__controls` group:
   ```html
   <tar-button variant="filled" testId="idea-new" (clicked)="onNewIdea()">New idea</tar-button>
   ```
2. On mobile, additionally render a `<tar-fab icon="add" />`.
3. Implement `onNewIdea()` to either route to `/ideas/new` (and create the page) or open a dialog with the documented fields (Title, Description, Cover image, Partners).
4. POST to the existing `IdeasController` (`POST /api/v1/ideas`).
