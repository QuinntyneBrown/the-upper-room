---
id: TASK-0185
title: Bundle budgets + Lighthouse-CI
status: Draft
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-089, L2-090]
estimated_context: small
---

# TASK-0185: Bundle budgets + LH-CI

## Goal
Configure `angular.json` budgets per L2-090. CI runs Lighthouse-CI on the routes listed in L2-089 and fails when any vital regresses >10% from a 7-day rolling baseline.

## Acceptance Tests

### CI
- `lhci autorun` runs with assertions: LCP ≤ 2500, INP ≤ 200, CLS ≤ 0.1, TBT ≤ 300.
- A PR that introduces a 1MB synchronous JS chunk fails CI with "LCP regressed by ≥ 10%".

### Playwright (regression net)
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/perf-budgets.spec.ts`

**Scenario:**
1. Read `angular.json` config; assert initial-bundle warning ≤ 400kB and error ≤ 600kB.
