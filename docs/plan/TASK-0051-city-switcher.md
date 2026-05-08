---
id: TASK-0051
title: City switcher (SystemAdmin top bar)
status: Draft
phase: CI
depends_on: [TASK-0050]
traces_to: [L2-109]
estimated_context: small
---

# TASK-0051: City switcher

## Goal
SystemAdmin sees a city dropdown in the top bar with current city; menu lists searchable cities + "All cities (read-only)"; switching reloads scope and persists in profile.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cities/city-switcher.spec.ts`

**Page Object:** `components/CitySwitcher.ts`.

**Scenarios:**
1. SystemAdmin opens switcher → menu lists all non-archived cities; current is checkmarked.
2. Selecting "Vancouver" reloads the dashboard; subsequent contact list shows only Vancouver contacts.
3. Selecting "All cities" disables write actions and shows banner "Switch to a single city to make changes.".
4. CityLead does NOT see the switcher.

## Definition of Done
- [ ] Selection persists across sign-in.
