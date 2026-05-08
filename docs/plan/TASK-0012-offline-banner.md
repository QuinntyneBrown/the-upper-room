---
id: TASK-0012
title: Offline banner
status: Draft
phase: F
depends_on: [TASK-0005]
traces_to: [L2-070]
estimated_context: small
---

# TASK-0012: Offline banner

## Goal
Detect offline state (`navigator.onLine === false` OR three consecutive network errors); render a sticky banner under the top app bar; switch to "Back online" briefly when restored.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/offline-banner.spec.ts`

**Page Object:** `components/OfflineBanner.ts` (`isVisible()`, `text()`, `closeBtn()`).

**Scenarios:**
1. Set browser context offline → banner appears within 2000ms with text "You're offline. Some features may be unavailable." and `wifi_off` leading icon.
2. Set context back online → banner switches to "Back online" with tertiary container background, then auto-dismisses after 3s.
3. User can close the banner manually; it stays closed until the next state change.

## Implementation Outline
- `projects/the-upper-room/src/app/network/` with `network.service.ts` listening to `online`/`offline` events and tracking N=3 consecutive HTTP failures.
- Component lives inside the shell.

## Definition of Done
- [ ] All scenarios pass using Playwright's `context.setOffline()`.
