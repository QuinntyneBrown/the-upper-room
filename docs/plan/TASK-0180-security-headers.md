---
id: TASK-0180
title: Security headers + HSTS + CSP
status: Draft
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-092]
estimated_context: small
---

# TASK-0180: Security headers

## Goal
Backend middleware applies `HSTS`, `CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` per L2-092. HTTP requests redirect to HTTPS.

## Acceptance Tests

### Backend Integration
- `SecurityHeadersTests.cs` — every header present with the exact values from L2-092.
- HTTP request to API returns 308 redirect to HTTPS.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/security-headers.spec.ts`

**Scenarios:**
1. `GET /` response headers contain `Strict-Transport-Security`, `Content-Security-Policy`, etc.
2. CSP blocks an injected `<script src="https://evil.example/">` (verified via report endpoint).

## Definition of Done
- [ ] Mozilla Observatory grade A or higher.
