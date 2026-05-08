---
id: TASK-0110
title: Location CRUD + list page
status: Accepted
phase: L
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-057, L2-058]
estimated_context: medium
---

# TASK-0110: Location CRUD

## Goal
Persist Location with all L2-057 fields (incl optional lat/lng). Endpoint blocks delete when location is referenced by Scheduled future events (suggests Archive).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/locations/location-crud.spec.ts`

**Page Object:** `pages/LocationsListPage.ts`, `pages/LocationFormPage.ts`.

**Scenarios:**
1. Empty `/locations` shows `location_off` empty state with "New location" CTA.
2. Create location with full address → appears in grid.
3. Delete a location referenced by future event → 409 with "Archive instead" action; clicking archives.
4. Capacity validates as positive integer.
