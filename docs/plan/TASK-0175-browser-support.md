---
id: TASK-0175
title: Browser support detection banner
status: Accepted
phase: X
depends_on: [TASK-0005]
traces_to: [L2-120]
estimated_context: small
---

# TASK-0175: Browser support

## Goal
On first paint, detect unsupported browser (e.g., IE11, ancient Safari) and show a top banner with the prescribed copy.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/browser-support.spec.ts`

**Scenarios:**
1. With user-agent overridden to IE11, the banner appears immediately.
2. With current Chrome user-agent, no banner.
3. Banner is dismissable for the session (cookie); re-appears next session.
