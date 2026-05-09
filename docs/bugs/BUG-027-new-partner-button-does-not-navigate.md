# BUG-027 — "New partner" button does not navigate to /partners/new

| Field | Value |
|---|---|
| ID | BUG-027 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-6.5 |
| Component | `PartnerList` |

## Description

Clicking the **New partner** button in the partners list toolbar (or in the empty state) does not navigate to `/partners/new`. The button had no click handler and no `routerLink`.

## Root Cause

`partner-list.html` used `<button type="button">` elements for the "New partner" CTA without any navigation. `PartnerList` also did not import `RouterLink`.

## Fix

Changed both "New partner" `<button>` elements to `<a routerLink="/partners/new">` anchors and added `RouterLink` to the component's `imports` array. Also changed partner card `<div>` to `<a [routerLink]="['/partners', partner.id]">` (see BUG-028).
