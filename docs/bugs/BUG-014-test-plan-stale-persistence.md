# BUG-014 — Test plan describes in-memory persistence; backend is on SQLite

**Severity**: Medium
**Component**: docs (`docs/test-plan/`)
**Found in test**: pre-flight (test plan §0)
**Found**: 2026-05-09

## Description

`docs/test-plan/00-overview.md` (and the per-section "Database verification" steps) state that the backend uses *"in-memory `static` dictionaries / lists in each controller"* and instructs testers to *"inspect the in-memory store"* after mutations.

The codebase actually uses **SQLite** via EF Core. `Program.cs:63-83` registers four `DbContext`s (`ContactsDbContext`, `EventsDbContext`, `IdeasDbContext`, `LocationsDbContext`) with file-backed Sqlite connection strings under `Data/`. Controllers (e.g. `ContactsController(ContactsDbContext db)`) inject the DbContext and read/write through it.

## Impact

A tester following the plan literally will look for static dictionaries that don't exist and miss the actual persistence verification path.

## Suggested fix

In `docs/test-plan/00-overview.md` replace the in-memory paragraph with:

> The backend persists to SQLite files under `backend/src/TheUpperRoom.Api/Data/` (`contacts.db`, `events.db`, `ideas.db`, `locations.db`). Inspect rows with:
>
> ```bash
> sqlite3 backend/src/TheUpperRoom.Api/Data/contacts.db 'SELECT * FROM Contacts'
> ```

Update each per-section "Database verification" entry to use real `SELECT` statements against the appropriate `.db` file and table.

A handful of stores remain in-memory (e.g. `AuditStore`, the rate-limit buckets in `AuthController`); call those out individually rather than as the rule.
