# Section 0 — Overview

> Mirrors `docs/user-guide.md` (front matter).

## Purpose and scope

This plan verifies every user-visible behavior in The Upper Room across:

- **UI fidelity** — every label, placeholder, button caption, icon, font, color, and spacing token in the running frontend matches the implementation in `frontend/projects/the-upper-room/` and the design tokens in `frontend/projects/components/src/lib/tokens/_tokens.scss`.
- **Behavior** — every flow described in `docs/user-guide.md` produces the documented HTTP requests, navigations, toasts, and side effects.
- **Persistence/state** — every mutation produces the expected change in the backend store (currently in-memory `static` collections inside `backend/src/TheUpperRoom.Api/<Feature>/*Controller.cs`) and the audit log (`backend/src/TheUpperRoom.Api/Audit/AuditStore.cs`).

Out of scope: load/perf (covered by `k6/`), security pen-test (separate engagement), source-code lint/style.

## Conventions

- **Test ID format**: `TC-N.X` where `N` is the section number (matches the user-guide section) and `X` is a sequential counter inside the section.
- **Severity**:
  - **Critical** — data loss, auth bypass, complete page broken, or anything that contradicts the user guide on a primary flow.
  - **High** — primary feature broken but workaround exists; visible UI regression on a label/CTA; missing toast/audit row on a mutation.
  - **Medium** — minor UI deviation (off-token color/spacing), non-critical empty/loading state issue, inconsistent copy.
  - **Low** — cosmetic (e.g. icon weight), micro-copy nit.
- **Pass criteria**: a test passes only when **all three sections** (UI, Behavior, DB) are green. A miss in any section is a fail.

## Test environment setup

### Prerequisites

- Node 22+, .NET 9 SDK (Note: solution is on `net10.0` per `*.csproj`; install matching SDK if newer).
- Chromium-based browser, plus Firefox and Safari for cross-browser pass.

### Start the backend

```powershell
cd C:\projects\the-upper-room\backend\src\TheUpperRoom.Api
dotnet run
```

The API listens on `https://localhost:5001` (or whatever Kestrel reports). Check `appsettings.Development.json` for the actual port.

The backend uses **in-memory `static` dictionaries / lists** in each controller (e.g. `_store` in `backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs:23`, `Boards` in `backend/src/TheUpperRoom.Api/Kanban/BoardsController.cs:11`, `Entries` in `backend/src/TheUpperRoom.Api/Audit/AuditStore.cs:6`). **Restarting the API resets all data.** A real EF Core `AppDbContext` exists at `backend/src/TheUpperRoom.Infrastructure/Persistence/AppDbContext.cs:18` but is not yet wired to the controllers — DB-verification steps therefore inspect the in-memory store rather than SQL.

### Start the frontend

```powershell
cd C:\projects\the-upper-room\frontend
npm install
npx ng serve the-upper-room
```

Default URL: `http://localhost:4200`.

### Test credentials

The mock auth provider (the only one wired in dev) accepts exactly one credential pair:

- **Email:** `test@example.com`
- **Password:** `Password!23456`

Anything else returns `401` with body `{ "code": "auth.invalid_credentials" }` (see `backend/src/TheUpperRoom.Api/Auth/AuthController.cs:50`).

### Inspecting persistence state

Because controllers use in-memory `static` collections, "DB verification" in this plan means one of:

1. **Re-query the API** with the appropriate `GET` (most cases). Example: after creating a contact, `GET /api/v1/contacts` should include the new `id` and `name`.
2. **Inspect the audit log** via `GET /api/v1/admin/audit` (requires `SystemAdmin` role header `X-Test-User-Id: admin`). The audit log is written by `AuditStore.Record(...)` calls scattered in each controller.
3. **Attach a debugger** to the API process and break in the relevant controller to read the static collection directly. File:line citations are provided.

If/when EF is wired up, swap "inspect static dictionary at file:line" for "`SELECT … FROM …`" against the configured DB.

## How to record results

For each section file create a row per test case in your tracker (Jira/Linear/spreadsheet) with:

- Test ID (e.g. `TC-5.3`)
- Build SHA under test
- Browser + viewport
- Result: Pass / Fail / Blocked / N/A
- Defect link (if Fail)
- Tester
- Run timestamp

A section is **green** only when all its TCs pass on **Chrome + Firefox + Safari** at **xs (375px), md (768px), and lg (1280px)** viewports.
