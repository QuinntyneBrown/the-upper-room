# BUG-028 — Partner cards do not navigate to partner detail

| Field | Value |
|---|---|
| ID | BUG-028 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-6.7 |
| Component | `PartnerList` |

## Description

Clicking a partner card in the partners grid does not navigate to the partner detail page (`/partners/{id}`). The cards rendered with no click handler and no `routerLink`.

## Root Cause

`partner-list.html` rendered each partner card as a plain `<div>` with no navigation.

## Fix

Changed each partner card `<div>` to `<a [routerLink]="['/partners', partner.id]">`, enabling keyboard and pointer navigation to the partner detail page.
