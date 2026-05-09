# Backend Architecture Audit

Date: 2026-05-09

Scope: `backend/src` and representative tests under `backend/tests`.

Focus: .NET enterprise architecture basics, code organization, maintainability, and performance. Recommendations are intentionally simple and incremental.

## Executive Summary

The backend has a strong starting shape: separate `Api`, `Application`, `Domain`, `Infrastructure`, and test projects; nullable reference types; warnings as errors; JWT middleware; Serilog; and meaningful API persistence tests.

The main issue is not a missing enterprise framework. The issue is architectural drift. The solution contains a layered architecture, but the running API mostly bypasses it. Controllers own business rules, query logic, persistence models, authorization lookups, and side effects. Several features use API-local EF Core contexts and SQLite files, while `Infrastructure/AppDbContext` and the domain model are largely separate from the runtime path.

The simplest target is:

- Keep controllers thin.
- Put use-case logic in small feature services or handlers.
- Use one production persistence path through `Infrastructure/AppDbContext`.
- Keep domain entities only where they enforce real invariants.
- Push filtering, paging, and counting into database queries.

## What Is Working

- The project layout already supports clean layering: `TheUpperRoom.Api`, `TheUpperRoom.Application`, `TheUpperRoom.Domain`, `TheUpperRoom.Infrastructure`, and test projects.
- Build discipline is good: `backend/Directory.Build.props` enables nullable reference types, implicit usings, and `TreatWarningsAsErrors`.
- Security basics are present: JWT bearer auth, production guardrails for missing signing keys, CSRF middleware, security headers, and correlation IDs in `Program.cs`.
- The domain project has useful invariants in entities such as `Domain/Contacts/Contact.cs` and `Domain/Events/Event.cs`.
- Persistence model coverage exists in `Infrastructure.Tests`, and multiple API persistence tests verify behavior across host restarts.
- The codebase is still small enough that the architecture can be corrected incrementally without a large rewrite.

## Key Findings

### 1. The Runtime Bypasses the Intended Layers

Evidence:

- `Api/Program.cs` registers feature-local contexts such as `ContactsDbContext`, `EventsDbContext`, `IdeasDbContext`, `LocationsDbContext`, `NotesDbContext`, `KanbanDbContext`, `NotificationsDbContext`, and `PushDbContext`.
- `Infrastructure/DependencyInjection.cs` registers `AppDbContext`, but `Program.cs` does not call `AddInfrastructure`.
- `Application` currently contains only city-scope helpers, despite referencing MediatR.
- Controllers directly contain use-case logic, data access, validation, authorization checks, and DTO mapping.

Risk:

- The code has two competing architectures: a layered architecture on disk and a controller-centered architecture at runtime.
- New features will copy controller patterns instead of using the domain and infrastructure layers.
- Tests can pass while the intended domain model remains unused.

Radically simple recommendation:

Pick one runtime path. Use `Infrastructure/AppDbContext` as the production persistence path and migrate one feature at a time. Start with one low-risk feature, such as contacts, and move only these pieces:

- EF entity/configuration in `Infrastructure`.
- Use-case service in `Application` or a feature service class.
- Controller reduced to HTTP input/output.

Avoid introducing a large framework or generic repository. EF Core already provides the unit of work and repository primitives needed here.

### 2. Persistence Is Fragmented

Evidence:

- The API creates many separate SQLite databases under `backend/src/TheUpperRoom.Api/Data`.
- Those `.db` files are tracked by git.
- Startup uses `Database.EnsureCreated()` for each context.
- No EF migrations were found under `backend/src`.
- `Infrastructure/AppDbContext` is configured for SQL Server, while the API runtime is configured for per-feature SQLite databases.

Risk:

- Production schema changes cannot be reviewed, rolled forward, or rolled back reliably.
- Tracked local database files make source control noisy and environment-dependent.
- Cross-feature queries and transactions become difficult because data is split across contexts and files.

Radically simple recommendation:

- Stop tracking runtime `.db` files.
- Move local SQLite files outside `src`, for example `backend/.local-data`, and ignore that folder.
- Use `Database.Migrate()` plus migrations instead of `EnsureCreated()`.
- Use one production connection string and one `AppDbContext` unless there is a proven reason to split databases.

### 3. Controllers Own Too Much Behavior

Evidence:

- Controllers repeatedly implement `GetCurrentUser()` by reading `sub` and looking up `SeedUsers.ById`.
- Controllers perform business transitions directly, for example idea status transitions, RSVP logic, board/card mutations, and city visibility checks.
- Dashboard and search call static helper methods on other controllers.

Risk:

- Behavior becomes hard to test without full HTTP tests.
- Reuse happens through controller static methods, which couples unrelated endpoints.
- Authorization and city scoping can drift between controllers.

Radically simple recommendation:

Create small services per feature, not a broad architecture rewrite. Example names:

- `IContactsService`
- `IIdeasService`
- `IKanbanService`
- `ICurrentUserContext`

Each service should own one use-case group and accept `CancellationToken`. Controllers should call one method, map the result to HTTP, and stop there.

### 4. Authorization and User Lookup Are Not Centralized

Evidence:

- Most controllers use `[Authorize]` but then manually enforce roles and city scope inside actions.
- `SeedUsers.ById` is a mutable static dictionary.
- `ICurrentUser` exists, but controllers generally do not use it.

Risk:

- Authorization rules are duplicated and easy to miss.
- Static user lookup does not work for multi-instance production deployments.
- City-scoped data rules are manually applied and inconsistent.

Radically simple recommendation:

Introduce one `CurrentUserContext` with `UserId`, `Role`, and `CityId`, backed by claims and later by persisted users. Then centralize common checks:

- Use authorization policies for role gates.
- Use a city-scope helper that works on `IQueryable<T>` so filters stay in the database.
- Keep resource-specific checks inside feature services when they need database state.

### 5. Static Mutable State Remains in Production Paths

Evidence:

- `PartnersController` stores partners in a static list.
- `PartnerContactsController` stores links in a static list.
- `AuditStore` stores audit records in a static list.
- `AuthController` stores rate-limit buckets in static dictionaries.
- `SeedUsers.ById` is static and mutable.

Risk:

- Data is lost on restart.
- Data is not shared across instances.
- Some collections are not thread-safe.
- Tests can pass in a single-process setup while production behavior fails under concurrency.

Radically simple recommendation:

Replace static stores in this order:

1. Audit log: persist `AuditEntry` through `AppDbContext`.
2. Partners and partner-contact links: persist through EF.
3. Users: persist user directory and roles.
4. Rate limits: keep in memory for development, but hide behind `IRateLimitStore` so Redis or SQL can replace it later.

### 6. Query Performance Is Mostly Fine for Small Data, But Will Degrade Quickly

Evidence:

- Several endpoints call `AsEnumerable()` before filtering, sorting, or paging.
- Contacts list materializes all rows before applying pagination.
- Board list counts columns and cards inside a loop.
- Idea DTO mapping counts votes and linked partners per idea.
- Most EF calls are synchronous.

Risk:

- More memory use and slower responses as tables grow.
- N+1 query patterns on dashboard, board, search, and idea list endpoints.
- Request cancellation does not stop database work.

Radically simple recommendation:

For list endpoints:

- Keep data as `IQueryable` until the final projection.
- Use `AsNoTracking()` for read-only queries.
- Apply filters and pagination before `ToListAsync`.
- Use grouped counts instead of per-row `Count()` calls.
- Add `CancellationToken` to async actions.

This does not require a new abstraction. It is mostly local query cleanup.

### 7. Request Validation and Error Responses Are Inconsistent

Evidence:

- Some invalid input returns `BadRequest`.
- Some validation failures return `UnprocessableEntity`.
- Validation is handwritten in controller actions.
- Error payloads vary between `{ error = ... }` and `{ code = ... }`.

Risk:

- Frontend error handling becomes case-specific.
- Validation behavior is harder to document and test.

Radically simple recommendation:

Use one error envelope and one validation convention. Data annotations or small per-request validators are enough. Avoid adding FluentValidation unless validation rules become complex.

## Suggested Incremental Plan

### Step 1: Establish the Runtime Direction

Document this decision in the repo:

> The backend runtime uses `TheUpperRoom.Infrastructure.AppDbContext` as the persistence path. API-local DbContexts are temporary migration scaffolding and should not be used for new features.

This prevents more split persistence from being added.

### Step 2: Create One Current User Abstraction

Add a small service:

```csharp
public interface ICurrentUserContext
{
    string UserId { get; }
    string Role { get; }
    string CityId { get; }
}
```

Replace duplicated `GetCurrentUser()` methods gradually. This is the highest-leverage maintainability cleanup.

### Step 3: Migrate One Feature End to End

Use contacts as the pilot:

- Move runtime persistence to `AppDbContext`.
- Keep existing API routes and response shapes.
- Keep tests green.
- Remove `ContactsDbContext` only after the feature fully uses `AppDbContext`.

After one feature is done, copy the pattern to notes, locations, ideas, kanban, events, notifications, then partners.

### Step 4: Persist the Audit Log

Audit is cross-cutting and already has a domain entity/configuration. Replace `AuditStore` with an injected `IAuditWriter` backed by `AppDbContext`. This makes audit data durable without changing endpoint behavior.

### Step 5: Fix Hot Query Patterns Locally

Do not start with a global data-access abstraction. Fix the visible query issues in place:

- Contacts search and pagination.
- Board list counts.
- Idea list vote and partner counts.
- Global search.
- Location delete event check.

### Step 6: Replace `EnsureCreated`

Once the first feature uses `AppDbContext`, add migrations and use `Database.Migrate()` in controlled startup code or deployment tooling.

## Target Shape

Keep the architecture boring:

```text
Api
  Controllers: HTTP binding, auth attributes, result mapping

Application
  Feature services or handlers: use cases, validation, authorization decisions

Domain
  Entities/value objects only where invariants matter

Infrastructure
  AppDbContext, EF configurations, audit writer, mail/push/upload adapters

Contracts
  Shared DTOs only if they are truly shared outside the API
```

Avoid:

- Generic repositories over EF Core.
- Full CQRS for every endpoint.
- A service per entity with only pass-through CRUD.
- New architectural packages before the existing layers are wired into runtime.

## Priority Backlog

1. Mark API-local DbContexts as temporary and block new ones.
2. Add `ICurrentUserContext`; replace duplicated `GetCurrentUser()`.
3. Move contacts to `AppDbContext` as the reference implementation.
4. Persist audit entries with an injected audit writer.
5. Move local `.db` files out of source and stop tracking them.
6. Replace `EnsureCreated()` with migrations.
7. Optimize list/search endpoints to keep filtering and paging in SQL.
8. Persist partners and partner-contact links.
9. Add architecture tests that prevent controller-to-controller static helper calls.
10. Standardize validation and error responses.

## Bottom Line

The backend does not need more ceremony. It needs one consistent runtime architecture. The existing layers are good enough; wire them into the application path, remove static stores, centralize current-user and city-scope behavior, and clean up list queries. That will improve maintainability and performance without making the codebase harder to understand.
