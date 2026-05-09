# BUG-021 — `/api/v1/cities` endpoint missing from backend

| Field | Value |
|---|---|
| ID | BUG-021 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-3.7, TC-3.8 |
| Component | `TarCitySwitcher`, backend `Cities` module |

## Description

The `TarCitySwitcher` component calls `GET /api/v1/cities` to populate the city dropdown. The backend has no cities controller or data store, so the request returns 404 and the dropdown only shows "All cities" with no cities to switch to. This blocks TC-3.8 (city re-scoping) entirely.

## Root Cause

The `Cities` folder in the API project only contained `Slug.cs`. No controller, DbContext, or seeder was implemented, leaving the frontend cities endpoint unresolvable.

## Fix

Added:
- `CitiesDbContext` / `CityRow` — SQLite-backed flat store for cities
- `CitiesController` — `GET /api/v1/cities` returning `{ items }` with `id`, `name`, `slug`, `archived`
- `CitiesDataSeeder` — seeds Toronto and Halifax dev cities (order 5, runs after users)
- Registered both the DbContext and seeder in `Program.cs`
