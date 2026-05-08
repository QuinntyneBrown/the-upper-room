---
id: TASK-0160
title: Audit trail persistence + admin log page
status: Draft
phase: Au
depends_on: [TASK-0033]
traces_to: [L2-098]
estimated_context: medium
---

# TASK-0160: Audit trail

## Goal
EF Core SaveChanges interceptor writes `AuditEntries` rows for every Create/Update/Delete on the entities listed in L2-098. Admin page `/admin/audit` lists entries with filters (Actor, Entity Type, Action, Date range) and paginates.

## Acceptance Tests

### Backend Integration
- `AuditInterceptorTests.cs` — Updating contact phone records `before/after` JSON diff.
- Login/logout/permission-denied recorded.

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/audit/audit-log.spec.ts`

**Page Object:** `pages/AuditLogPage.ts`.

**Scenarios:**
1. SystemAdmin can access `/admin/audit`; CityLead is forbidden.
2. Performing an action (delete contact) shows up at the top of the audit log within 5s.
3. Filter by Action=Delete returns only deletes.
