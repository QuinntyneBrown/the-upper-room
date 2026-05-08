---
id: TASK-0173
title: PWA manifest + service worker (shell-only cache)
status: Draft
phase: X
depends_on: [TASK-0001]
traces_to: [L2-117, L2-116]
estimated_context: small
---

# TASK-0173: PWA setup

## Goal
Full `manifest.webmanifest` per L2-116 and a minimal Angular service worker that caches the app shell + immutable assets only — never API responses.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/pwa.spec.ts`

**Scenarios:**
1. `manifest.webmanifest` returns 200 with name "The Upper Room", short_name "Upper Room", display "standalone", start_url "/dashboard".
2. After first load, the SW activates; reloading offline still shows the shell (white screen avoided), but list pages show offline banner (TASK-0012).
3. API responses are NOT cached (verified by stubbing fetch; second request still hits network).

## Definition of Done
- [ ] Lighthouse PWA score ≥ 90.
