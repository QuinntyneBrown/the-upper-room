# BUG-004 — App brand "The Upper Room" in the top bar is not clickable

**Severity**: Medium
**Component**: frontend
**Found in test**: TC-3.6 (Top bar — title link)
**User-guide refs**: §3.1
**Found**: 2026-05-09

## Description

User guide §3.1 says: *"**The Upper Room** title — click it to return to the dashboard."* In the running app the title is a plain `<span>` with no click handler and no router link, so clicking it does nothing.

## Reproduction

1. Sign in (or load any in-app route).
2. Click the text **The Upper Room** in the top bar.
3. Observe: nothing happens.

## Expected

Clicking the title navigates to `/dashboard` (or `/` when on a public page).

## Actual

`frontend/projects/the-upper-room/src/app/shell/app-shell/app-shell.html:20`:

```html
<span class="app-shell__app-name">The Upper Room</span>
```

No `(click)` binding, no `routerLink`, not focusable. The `<footer>` at line 74 also uses a plain `<span>` for the brand line — for parity, decide whether the footer brand should also link home.

## Suggested fix

Replace the `<span>` with an `<a routerLink="/dashboard">` (or a button if a click handler is preferred) and add a `:focus` style consistent with the existing focus-ring tokens. Add an a11y label such as `aria-label="Home"`.
