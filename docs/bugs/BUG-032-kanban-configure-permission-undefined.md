# BUG-032 — KanbanBoard:Configure permission undefined, configure page inaccessible

| Field | Value |
|---|---|
| ID | BUG-032 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-7.13 |
| Component | `app.routes.ts`, `PermissionActions`, `RoleCatalog`, `Permissions` |

## Description

The board configure route at `/boards/:id/configure` requires the permission
`KanbanBoard:Configure` via `permissionGuard`. However, this permission was never
defined in `PermissionActions.cs` and was never granted to any role in either
`RoleCatalog.cs` or `Permissions.cs`. As a result, all users are redirected to
`/forbidden` when attempting to access the configure page.

## Root Cause

`KanbanBoard:Configure` does not appear in:
- `PermissionActions.cs` — no `Configure` constant
- `RoleCatalog.cs` — not in CityLeadActions nor explicitly added to SystemAdmin
- `Permissions.cs` — not in CityLeadActions nor SystemAdmin list

## Fix

1. Added `Configure = "Configure"` to `PermissionActions.cs`.
2. Added `KanbanBoard:Configure` explicitly to `SystemAdmin` and `CityLead` permissions
   in `RoleCatalog.cs`.
3. Added `"KanbanBoard:Configure"` to `SystemAdmin` and `CityLead` in `Permissions.cs`.
