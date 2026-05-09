---
id: TASK-TC-1.7
title: 'Run TC-1.7 - Security response headers are present'
status: Completed
test_id: TC-1.7
source: ../../test-plan/01-getting-started.md
result: PASS
run_at: 2026-05-09T14:56:00Z
---

# TASK-TC-1.7: Run TC-1.7 - Security response headers are present

## Goal

Run `TC-1.7` from `docs/test-plan/01-getting-started.md` and record the result.

## Result: PASS

| Field      | Value                             |
|------------|-----------------------------------|
| Endpoint   | GET http://localhost:5255/api/v1/contacts (401) |
| Run at     | 2026-05-09T14:56:00Z              |
| Tester     | Claude (automated)                |

### Checks

- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Cross-Origin-Opener-Policy: same-origin`
- [x] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [x] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [x] `Content-Security-Policy` present with `default-src 'self'` and font/style sources
- [x] `X-Correlation-Id` present (unique per request GUID)

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
