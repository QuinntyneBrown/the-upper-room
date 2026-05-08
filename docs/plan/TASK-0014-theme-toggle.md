---
id: TASK-0014
title: Theme toggle (system / light / dark) with persistence
status: Accepted
phase: F
depends_on: [TASK-0002, TASK-0005]
traces_to: [L2-115]
estimated_context: small
---

# TASK-0014: Theme toggle

## Goal
Persist a per-user theme preference (System / Light / Dark) in localStorage immediately and to the server (when authenticated) via `PATCH /api/v1/users/me`. Apply on first paint to avoid flash of unthemed content (FOUC).

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/theme-toggle.spec.ts`

**Page Object:** `pages/AppearanceSettingsPage.ts` and `components/AppShell.themeToggle()`.

**Scenarios:**
1. Default is System: with OS dark, `[data-theme=dark]` is set; with OS light, no attribute.
2. Selecting "Dark" sets `[data-theme=dark]`, persists to localStorage, and is reapplied on reload before any API call resolves.
3. After auth wired (mock), selecting "Light" issues `PATCH /api/v1/users/me` with body `{ theme: "light" }`.

## Implementation Outline
- `theme.service.ts` exposed as injection token; pre-bootstrap script in `index.html` applies stored theme synchronously.

## Definition of Done
- [ ] No FOUC observable in Playwright's `domcontentloaded` snapshot.
