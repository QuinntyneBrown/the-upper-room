# BUG-018 — Drawer does not close when Escape is pressed

| Field | Value |
|---|---|
| ID | BUG-018 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-3.2 |
| Component | `app-shell` |

## Description

Pressing the Escape key does not close the navigation drawer, even when the drawer is open.

## Root Cause

The `(keydown.escape)="closeDrawer()"` event binding on `<nav data-testid="drawer">` requires the nav element to be focused to fire. The drawer nav has no `tabindex` attribute, making it non-focusable. As a result, the Escape keydown event target is never the drawer nav and the binding never fires.

## Steps to Reproduce

1. Open the app in a mobile viewport (≤ 768px).
2. Click the drawer-toggle button to open the drawer.
3. Press Escape.
4. **Expected**: Drawer closes.
5. **Actual**: Drawer remains open.

## Fix

Added Escape key handling to the existing `window:keydown` `@HostListener` in `app-shell.ts`. When the drawer is open and Escape is pressed, `closeDrawer()` is called regardless of which element has focus.

Removed the now-redundant `(keydown.escape)="closeDrawer()"` from the `<nav>` element.
