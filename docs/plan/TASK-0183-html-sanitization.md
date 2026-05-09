---
id: TASK-0183
title: Server-side HTML sanitization for user input
status: Completed
phase: Z
depends_on: [TASK-0080]
traces_to: [L2-093]
estimated_context: small
---

# TASK-0183: HTML sanitization

## Goal
All HTML rendered from user input passes through Ganss.Xss with an allow-list. Notes/idea bodies/partner descriptions are sanitized server-side at write time.

## Acceptance Tests

### Backend Integration
- `HtmlSanitizerTests.cs` — `<img src=x onerror=alert(1)>` → `<img src="x">` with no event handlers.
- `<script>alert(1)</script>foo` → `foo`.
- `<a href="javascript:...">x</a>` → `<a>x</a>`.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/sanitization.spec.ts`

**Scenarios:**
1. Submit note containing `<img src=x onerror=alert(1)>` → on render, `alert` does NOT fire (assert by listening for dialog event with timeout).
