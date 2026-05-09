---
id: TASK-0176
title: Deep link share button + clipboard
status: Accepted
phase: X
depends_on: [TASK-0008]
traces_to: [L2-118]
estimated_context: small
---

# TASK-0176: Share

## Goal
"Share" icon button on detail pages copies URL to clipboard or invokes Web Share API when available; snackbar "Link copied to clipboard.".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/share.spec.ts`

**Scenarios:**
1. With Web Share API mocked unavailable, clicking share writes the URL to clipboard.
2. Snackbar message "Link copied to clipboard." visible 4s.
3. With Web Share available (mocked), `navigator.share` is called instead.

## Definition of Done
- [ ] Falls back gracefully if clipboard permission denied.
