# BUG-022 — Dashboard API returns 500 due to untranslatable LINQ

| Field | Value |
|---|---|
| ID | BUG-022 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-4.1 precondition |
| Component | `GetDashboardHandler`, `EventsDbContext` |

## Description

`GET /api/v1/dashboard` returns HTTP 500 with a `System.InvalidOperationException: The LINQ expression 'DbSet<EventRow>().Count(e => e.StartAt > @now && e.Status != "Cancelled")' could not be translated`.

## Root Cause

EF Core's SQLite provider cannot translate a `DateTimeOffset` captured variable comparison (`e.StartAt > now`) directly to SQL. The expression was used twice in `GetDashboardHandler` — once for the count and once for fetching the top-5 list.

## Fix

Pulled the events into memory first with `.AsEnumerable()` on one shared query, then reused the in-memory list for both the stat count and the take-5 projection.
