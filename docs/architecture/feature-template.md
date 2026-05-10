# Feature Template

How to add a new vertical-slice feature to the backend, matching the layout the rest of the codebase uses (Contacts, Notes, Kanban, Events, Notifications, Ideas, Audit, Rbac, Dashboard, Push, Uploads).

> Each layer below has a "what goes here" rule. If a class doesn't fit any rule, the answer is usually "you're putting it in the wrong layer". The architecture tests in `tests/TheUpperRoom.Application.Tests/TechnologyGuidanceArchitectureTests` enforce most of these rules — both allow-lists are empty, so any drift will fail CI.

## Layer responsibilities

```
Api  ──depends on→  Application  ──depends on→  Domain
                          ▲
                          │ implemented by
                          │
                   Infrastructure
```

### `TheUpperRoom.Api/<Feature>/`

- HTTP boundary only.
- A `<Feature>Controller` that:
  - Binds the request body via `[FromBody] <Action>Request body` records (also in this folder, one type per file).
  - Resolves the current user via `ICurrentUser`.
  - Sends an `<Action>Command` / `<Action>Query` through `IMediator`.
  - Maps the returned `Result` outcome enum to an `IActionResult`.
- No persistence, no business rules.

### `TheUpperRoom.Application/<Feature>/`

For each feature, this folder owns:

- `I<Feature>DbContext.cs` — interface exposing the feature's `DbSet<T>`s plus `SaveChanges` / `SaveChangesAsync`. Application handlers depend on this interface, never on the concrete `<Feature>DbContext`.
- `<Entity>Row.cs` — persistence-shape POCOs (one per file).
- `<Action>Command.cs`, `<Action>Query.cs` — MediatR `IRequest<...>` records.
- `<Action>Result.cs` — outcome record returned by the handler.
- `<Action>Handler.cs` — `internal sealed class ... : IRequestHandler<TRequest, TResult>`. Dependencies: `I<Feature>DbContext`, `IUserDirectory`, `IPermissionChecker`, plus other Application interfaces. Handler logic only — no `DbContext` concrete types, no `HttpContext`, no `IFormFile`.
- `<Action>CommandValidator.cs` — `AbstractValidator<TCommand>` (FluentValidation) for input shape (required fields, string lengths, format). Throws `ValidationException` → mapped by `Api/ExceptionHandling/ValidationExceptionHandler` to RFC-7807 `application/problem+json` 400.
- `<Feature>Outcome.cs` — enum of business outcomes (`Ok`, `NotFound`, `Forbidden`, `Unauthorized`, `Conflict`, `Unprocessable`, ...). Distinct from input validation; outcomes drive the controller's status-code mapping.
- `<Feature>Mapping.cs` (optional) — `public static` extension methods that project rows onto outward DTOs.
- `<Feature>Dto.cs` — outward shapes returned to the controller.

### `TheUpperRoom.Domain/<Feature>/`

- Entities and value objects with no EF, ASP.NET, or MediatR references.
- Pure C#. Used for invariants and behavior that's framework-independent (e.g. `Domain.Rbac.RoleCatalog`, `Domain.Cities.IHasCity`).

### `TheUpperRoom.Infrastructure/<Feature>/`

- `<Feature>DbContext.cs` — `: DbContext, I<Feature>DbContext`. Owns the EF model configuration (`OnModelCreating`).
- `<Feature>DataSeeder.cs` (under `Infrastructure/Seeding/<Feature>/`) implements `IDataSeeder`. Picked up automatically by `Infrastructure.DependencyInjection.AddSeeders(typeof(Program).Assembly)`; never `AddScoped<IDataSeeder, ...>` directly in `Program.cs`.

## DI wiring

In `TheUpperRoom.Api/Program.cs`:

```csharp
builder.Services.AddDbContext<<Feature>DbContext>(o => o.UseSqlite(<conn>));
builder.Services.AddScoped<I<Feature>DbContext>(sp => sp.GetRequiredService<<Feature>DbContext>());
```

Application's `DependencyInjection.AddApplication()` already auto-registers MediatR handlers, FluentValidation validators, and the `ValidationBehavior<,>` pipeline.

## Architecture rules enforced by tests

- One top-level type per `.cs` file under `backend/src/`. (`MultiTypeFileAllowList` is empty.)
- No `*Handler` / `*Command` / `*Query` / `*Validator` / `*DbContext` / `*DataSeeder` / `*Row` types under `TheUpperRoom.Api/`. Non-MediatR handlers (e.g. ASP.NET `IExceptionHandler`) are exempted by the test.
- Application handlers consume an `I<Feature>DbContext` interface; the regex `\bI[A-Z][A-Za-z0-9]*DbContext\b` must appear in any `*Handler.cs` file under `Application/` that mentions `DbContext`.
- `TheUpperRoom.Application` does not reference `Microsoft.EntityFrameworkCore.SqlServer` or any `Microsoft.AspNetCore.*` package.
- All seeders live under `TheUpperRoom.Infrastructure/Seeding/<Feature>/` and are wired through `Infrastructure.DependencyInjection.AddSeeders`.

## Cross-feature consumers

When a feature's data needs to be read from another feature (e.g. the Dashboard reads contacts/ideas/events), prefer:

1. Inject the other feature's `I<Feature>DbContext` directly, OR
2. Define a small Application-layer interface (`I<Feature>Store` / `I<Feature>Reader` / similar) for the read surface and have Infrastructure or Api supply the implementation.

Avoid having one feature's controller call another feature's controller's static helpers — that pulls Api into the dependency graph of cross-feature logic.

## Worked example

The Contacts vertical is the canonical implementation:

- `Application/Contacts/IContactsDbContext.cs` — interface
- `Application/Contacts/ContactRow.cs` — persistence POCO (also implements `Domain.Cities.IHasCity`)
- `Application/Contacts/Contact.cs` — outward DTO record
- `Application/Contacts/ContactsMapping.cs` — `Row` → `Contact` projection
- `Application/Contacts/ContactsOutcome.cs` — enum
- `Application/Contacts/{Create, Update, Patch, Delete, Get, List, SetContactArchived}Command|Query.cs`
- `Application/Contacts/{Create, Update, Patch, Delete, Get, List, SetContactArchived}Handler.cs`
- `Application/Contacts/{CreateContactRequest, PatchContactRequest}.cs` — bind shapes
- `Infrastructure/Contacts/ContactsDbContext.cs` — `: DbContext, IContactsDbContext`
- `Api/Contacts/ContactsController.cs` — HTTP wiring only
- `Infrastructure/Seeding/Contacts/ContactsDataSeeder.cs` — auto-registered seeder
