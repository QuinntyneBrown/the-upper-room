# BUG-019 — App name "The Upper Room" does not navigate to dashboard

| Field | Value |
|---|---|
| ID | BUG-019 |
| Severity | Medium |
| Status | Fixed |
| Discovered | TC-3.6 |
| Component | `app-shell` |

## Description

Clicking the "The Upper Room" app name in the top bar does not navigate to the dashboard. The element is a plain `<span>` with no `routerLink`, `href`, or click handler.

## Root Cause

`app-shell.html` renders the app name as `<span class="app-shell__app-name">The Upper Room</span>` with no navigation binding.

## Steps to Reproduce

1. Navigate to `/contacts`.
2. Click "The Upper Room" in the top bar.
3. **Expected**: Navigate to `/dashboard`.
4. **Actual**: Nothing happens.

## Fix

Changed the app name `<span>` to `<a>` with `routerLink="/dashboard"` and added the appropriate import in `app-shell.ts`.
