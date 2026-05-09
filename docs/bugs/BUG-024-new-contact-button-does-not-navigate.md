# BUG-024 — "New contact" button does not navigate to /contacts/new

| Field | Value |
|---|---|
| ID | BUG-024 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-5.8 |
| Component | `ContactList` |

## Description

Clicking the **New contact** button in the contacts list toolbar (or in the empty state) does not navigate to `/contacts/new`. The button has no click handler and no `routerLink`.

## Root Cause

`contact-list.html` used `<button>` elements for the "New contact" CTA without attaching any navigation (no `(click)="..."` and no `routerLink`). The `ContactList` class also did not import `RouterLink`.

## Fix

Changed both "New contact" `<button>` elements to `<a routerLink="/contacts/new">` anchors and added `RouterLink` to the component's `imports` array.
