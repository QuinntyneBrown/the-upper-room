---
id: TASK-0187
title: k6 API load tests
status: Draft
phase: Z
depends_on: [TASK-0060, TASK-0070]
traces_to: [L2-091]
estimated_context: small
---

# TASK-0187: k6 load tests

## Goal
k6 scripts for the contact list / partner list / dashboard endpoints. CI nightly runs at 50 RPS for 5 minutes; p95 ≤ 300ms; error rate < 1%.

## Acceptance Tests

### CI
- `k6/contacts-list.js` thresholds `http_req_duration{p(95)} < 300` and `http_req_failed: rate<0.01`.
- Nightly job posts results to a status check; regressions block release.

## Definition of Done
- [ ] Test data harness seeds 10k contacts before runs.
