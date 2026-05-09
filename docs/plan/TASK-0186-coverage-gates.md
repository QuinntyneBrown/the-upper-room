---
id: TASK-0186
title: Coverage gates in CI
status: Accepted
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-101]
estimated_context: small
---

# TASK-0186: Coverage gates

## Goal
CI fails if coverage falls below: Domain 90%, Application 85%, Infrastructure 70%, FE libs 80%, FE app services/guards 80%.

## Acceptance Tests

### CI
- Backend `dotnet test --collect:"XPlat Code Coverage"` + `coverlet`/Cobertura → enforced with reportgenerator + threshold check.
- Frontend `jest --coverage` thresholds set in `jest.config`.
- A PR that drops Application coverage to 84% fails the build.

## Definition of Done
- [ ] Thresholds enforced on `main` and PR pipelines.
