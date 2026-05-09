# BUG-025 — Contact cards do not navigate to contact detail

| Field | Value |
|---|---|
| ID | BUG-025 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-5.10 |
| Component | `ContactList` |

## Description

Clicking a contact card in the contacts grid does not navigate to the contact detail page (`/contacts/{id}`). The cards rendered with no click handler and no routerLink.

## Root Cause

`contact-list.html` rendered each contact card as a plain `<div>` with no navigation. The `[attr.data-testid]` was bound, but no `[routerLink]` or `(click)` handler was attached.

## Fix

Changed each contact card `<div>` to `<a [routerLink]="['/contacts', contact.id]">`, enabling keyboard and pointer navigation to the contact detail page.
