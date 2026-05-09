# Section 0 — Overview

> Mirrors `docs/user-guide.md` (front matter).

Last aligned with code: 2026-05-09.

## Purpose and scope

This plan verifies every user-visible behavior in The Upper Room across:

- **UI fidelity** — every label, placeholder, button caption, icon, font, color, and spacing token in the running frontend matches the implementation in `frontend/projects/the-upper-room/` and the design tokens in `frontend/projects/components/src/lib/tokens/_tokens.scss`.
- **Behavior** — every flow described in `docs/user-guide.md` produces the documented HTTP requests, navigations, toasts, and side effects.
- **Persistence/state** — every mutation produces the expected change in the current runtime store. Most features use feature-specific SQLite EF Core contexts under `backend/src/TheUpperRoom.Api/<Feature>/*DbContext.cs`; users are resolved from `TheUpperRoom.Infrastructure.Users.UsersDbContext`; audit entries still use `backend/src/TheUpperRoom.Api/Audit/AuditStore.cs`.

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

- Node 22+ and a .NET SDK that supports `net10.0`.
- Chromium-based browser, plus Firefox and Safari for cross-browser pass.

### Start the backend

```powershell
cd C:\projects\the-upper-room\backend\src\TheUpperRoom.Api
dotnet run
```

The API listens on whatever Kestrel reports for the current launch profile. Runtime data is stored in SQLite files under `backend/src/TheUpperRoom.Api/Data` unless a test or local configuration overrides the relevant `*Db:ConnectionString`.

At startup the API registers:

- `TheUpperRoom.Application.AddApplication(...)` for MediatR.
- `TheUpperRoom.Infrastructure.AddInfrastructure(...)` for `UsersDbContext`, `IUserDirectory`, and development seeding.
- Feature-specific EF contexts for contacts, events, ideas, locations, notes, kanban, notifications, and push.

Startup still uses `Database.EnsureCreated()` for these runtime SQLite contexts. Partners, partner-contact links, auth rate-limit buckets, and audit entries remain in memory.

### Start the frontend

```powershell
cd C:\projects\the-upper-room\frontend
npm install
npx ng serve the-upper-room
```

Default URL: `http://localhost:4200`.

### Auth and test users

The frontend uses `PkceAuthProvider`, which starts a PKCE redirect to `/__idp/authorize`. The callback route posts to `POST /api/v1/auth/exchange`, stores the returned access token in memory, and navigates to `/dashboard`.

Development seeding creates these users in `UsersDbContext`:

- `admin` / `admin@test.local` / `SystemAdmin`
- `lead` / `lead@test.local` / `CityLead`
- `member` / `member@test.local` / `Member`
- `guest` / `guest@test.local` / `Guest`

Automated backend tests authenticate by issuing a JWT with `ITokenService.IssueAccessToken(userId)` and sending `Authorization: Bearer <token>`. The removed `X-Test-User-Id` header pattern must not be used.

Known current auth limitations:

- `POST /api/v1/auth/sign-in` is only the direct credential failure/rate-limit endpoint; the UI submit path uses PKCE instead.
- `POST /api/v1/auth/exchange` currently issues a token with `sub = "anonymous"`, so that token is not accepted by protected feature endpoints that require a seeded user id.
- Frontend sign-up, invitation, verify-email, and reset-password screens call endpoints that are not currently implemented in the backend unless a test harness stubs them.

### Inspecting persistence state

Use API reads first. For example, after creating a contact, `GET /api/v1/contacts` should include the new `id` and `name`.

For direct store checks:

- Contacts: `ContactsDbContext` / `Data/contacts.db`
- Events and RSVPs: `EventsDbContext` / `Data/events.db`
- Ideas, votes, and linked partners: `IdeasDbContext` / `Data/ideas.db`
- Locations: `LocationsDbContext` / `Data/locations.db`
- Notes: `NotesDbContext` / `Data/notes.db`
- Kanban boards, columns, and cards: `KanbanDbContext` / `Data/kanban.db`
- Notifications, preferences, and sent mail: `NotificationsDbContext` / `Data/notifications.db`
- Push subscriptions and pending push rows: `PushDbContext` / `Data/push.db`
- Users: `UsersDbContext` / `Data/users.db`
- Audit log: `GET /api/v1/admin/audit` as `admin`; backing store is still in-memory `AuditStore.Entries`

When a feature still uses a static collection, the test case calls that out explicitly.

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
