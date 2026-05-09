---
id: TASK-0111
title: Location detail (map + photos)
status: Accepted
phase: L
depends_on: [TASK-0110]
traces_to: [L2-058, L2-113]
estimated_context: small
---

# TASK-0111: Location detail

## Goal
`/locations/:id` shows static OpenStreetMap tile (320px tall) when lat/lng present, photo carousel (0..10 photos), capacity, accessibility, parking, "Used in N events" link.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/locations/location-detail.spec.ts`

**Scenarios:**
1. Location with coords renders the static map; without coords shows `map` icon placeholder.
2. Upload 3 photos → carousel cycles through them.
3. Photo upload >10MB rejected; non-image rejected.
4. Click "Used in N events" navigates to events list filtered by location.
