---
id: TASK-0050
title: City CRUD + listing (SystemAdmin)
status: Draft
phase: CI
depends_on: [TASK-0030]
traces_to: [L2-013, L2-077]
estimated_context: small
---

# TASK-0050: Cities

## Goal
SystemAdmin can list / create / rename / archive cities at `/admin/cities`. City entity holds `id`, `name`, `slug`, `country`, `archived`, audit fields.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cities/city-crud.spec.ts`

**Page Object:** `pages/CitiesPage.ts`.

**Scenarios:**
1. Create "Toronto" → row appears in the table, slug `toronto`.
2. Duplicate name within country → error from L2-066 `validation.duplicate`.
3. Archive a city with users → confirmation dialog warning that members will lose city; on confirm, city is archived but users keep their `cityId`.

### Backend
- `CityCommandTests.cs` — slug auto-generation rules; uniqueness per country.

## Definition of Done
- [ ] Cities API rejects city changes from non-SystemAdmin.
