# BUG-020 — City switch does not re-scope contacts list

| Field | Value |
|---|---|
| ID | BUG-020 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-3.8 |
| Component | `contact-list`, `CityScopeService` |

## Description

Switching cities via the city switcher does not cause the contacts list to re-fetch data for the new city. The list remains showing contacts from the previous city.

## Root Cause

`ContactList` does not inject `CityScopeService` and makes no API call when the city scope changes. `CityScopeService.active` is a signal but nothing in `ContactList` reacts to it.

Additionally, the contacts API request does not include a `scope` query parameter to tell the backend which city to filter by.

## Steps to Reproduce

1. Sign in as `lead@test.local` (Toronto city lead).
2. Navigate to `/contacts` — observe Alice in the list.
3. Open city switcher and select Halifax.
4. **Expected**: Contacts list re-fetches and shows Bob (Halifax contact).
5. **Actual**: Contacts list stays unchanged, still shows Alice.

## Fix

Added `CityScopeService` injection to `ContactList` and an Angular `effect()` that reloads the contacts page when `cityScopeService.current()` changes. The `buildParams()` method now also passes `scope=<citySlug>` to the API when not in all-cities mode.
